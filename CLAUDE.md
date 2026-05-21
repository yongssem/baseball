# 뚝딱야구 (DdukDdak Baseball) — CLAUDE.md

> 뚝딱 시리즈 · L5 React + Firebase + AI API (Gemini)
> AI가 문제를 자동 생성하고, 학생은 타이밍+퀴즈를 동시에 풀어 안타/홈런을 노리는 학습 야구 게임

---

## 🎯 게임 컨셉

타자 시점에서 날아오는 공을 치는 야구 게임. **3가지 트리거 상황이 랜덤으로 발동**되며, 각 상황마다 **다른 게임 메커닉**으로 작동한다.

### 트리거 3종 (랜덤 발동) — 각각 다른 메커닉

| # | 트리거 | 메커닉 | 성공 시 |
|---|---|---|---|
| 🔴 1 | **공이 날아오기 전** | 문제를 먼저 풀고 → 정답이면 **스윙권 획득** (예측형) | 정답 시간↓ = 안타 확률↑ |
| 🟡 2 | **공이 날아오는 중** | **스페이스바 타이밍 + 4지선다 동시** (멀티태스킹) | 둘 다 완벽 = 홈런 |
| 🟢 3 | **공을 치고 날아간 후** | 일단 자동 타격 → **야수가 잡기 전 문제 풀기** (도주형) | 빠르면 안타, 늦으면 아웃 |

### 결과 판정 공식
```
타이밍 점수 (Perfect/Good/Miss) × 문제 정답 + 푼 시간
→ 홈런 / 3루타 / 2루타 / 안타 / 파울 / 땅볼 / 삼진
```
- 타이밍만 좋고 오답 → 파울 (재시도 기회)
- 문제만 맞고 타이밍 Miss → 땅볼 아웃
- 둘 다 완벽 → 홈런 🎉

### 게임 진행
- **3아웃 = 1이닝 종료, 3이닝 = 1경기** (수업 시간 30~40분 맞춤)
- 또는 **10타석 모드** (점수제, 빠른 플레이용)

---

## 🤖 AI 문제 자동생성 (Gemini API)

### 핵심 흐름
1. 학생이 **과목·학년·난이도** 선택 (예: 초3 수학 곱셈, 보통)
2. 게임 시작 시 Gemini API로 **10개 문제 배치 생성** → Firestore 캐시
3. 타석마다 1개씩 소비, 부족하면 백그라운드로 추가 생성
4. 같은 클래스 학생들은 **캐시된 문제 풀(Pool)을 공유**해 비용 절감

### 난이도 매핑 (게임 보상과 연동)
| 난이도 | 보상 상한 | Gemini 프롬프트 가이드 |
|---|---|---|
| 쉬움 | 1루타까지 | 즉답 가능, 1단계 연산 |
| 보통 | 2루타까지 | 2단계 사고, 어휘 |
| 어려움 | **홈런 가능** | 응용·추론·서술 |

### 비용 관리 (필수)
- **Gemini 2.5 Flash** 우선 (무료 한도 적극 활용)
- 클래스당 일일 호출 제한 (Firestore 카운터)
- 생성된 문제는 **24시간 캐시**
- 토큰 사용량 모든 호출 로그 (`ai_logs` 컬렉션)

---

## 🎨 디자인 토큰 (뚝딱 시리즈)

```js
colors: {
  bg: '#FFF8F0',        // 크림 배경
  coral: '#FF9A8B',     // 메인 코랄 (타격, 점수)
  mint: '#A8E6CF',      // 민트 (성공, 안타)
  sky: '#B6CED9',       // 하늘 (필드)
  brown: '#8B6F47',     // 흙 (마운드, 베이스)
  white: '#FFFFFF',
  text: '#2D2D2D'
}
borderRadius: { card: '20px', button: '16px' }
fonts: {
  base: 'Pretendard',            // 본문
  score: 'DungGeunMo',           // 점수판 (레트로 픽셀)
}
```

**무드**: 파스텔, 따뜻함, 야구장 + 동심. 너무 사이버틱X, 너무 유아용X.

---

## 🛠️ 스택

- **Frontend**: React 18 + Vite + Tailwind CSS
- **애니메이션**: Framer Motion (공 궤적·타격 임팩트)
- **사운드**: Howler.js (효과음·BGM)
- **Backend**: Vercel Serverless Functions
- **AI**: Gemini 2.5 Flash API
- **DB**: Firebase Firestore (문제 캐시·게임 기록·리더보드)
- **배포**: Vercel

## 🔐 API 키 보안 — 절대 원칙
- 클라이언트 코드에 Gemini API 키 노출 금지
- 모든 AI 호출은 `/api/generate-quiz.js` 서버리스 함수 경유
- 환경변수는 Vercel 대시보드에만 (`GEMINI_API_KEY`)

---

## 📁 폴더 구조

```
ddukddak-baseball/
├─ api/
│  └─ generate-quiz.js          # Gemini 호출, 키 보호
├─ src/
│  ├─ components/
│  │  ├─ Field.jsx              # 야구장 + 공 애니메이션
│  │  ├─ Batter.jsx             # 타자 캐릭터
│  │  ├─ Pitcher.jsx            # 투수 캐릭터
│  │  ├─ Scoreboard.jsx         # 이닝/점수/아웃카운트
│  │  ├─ QuizCard.jsx           # 문제 표시 + 4지선다
│  │  ├─ TimingBar.jsx          # 스윙 타이밍 게이지
│  │  └─ ResultModal.jsx        # 안타/홈런/아웃 결과
│  ├─ hooks/
│  │  ├─ useAI.js               # /api/generate-quiz 래퍼
│  │  ├─ useQuizPool.js         # Firestore 문제 캐시 관리
│  │  ├─ useGameState.js        # 이닝·아웃·점수 상태머신
│  │  └─ useSwingTiming.js      # 스페이스바 타이밍 판정
│  ├─ game/
│  │  ├─ triggerEngine.js       # 3종 트리거 랜덤 분배
│  │  ├─ resultCalculator.js    # 타이밍×정답 → 결과 매핑
│  │  └─ constants.js
│  ├─ pages/
│  │  ├─ Home.jsx               # 학년/과목/난이도 선택
│  │  ├─ Game.jsx               # 메인 게임 화면
│  │  └─ Result.jsx             # 경기 종료 후 통계
│  └─ App.jsx
├─ public/
│  ├─ sounds/                   # CC0 효과음 (타격, 환호, 삼진)
│  └─ sprites/                  # 픽셀아트 캐릭터
├─ .env.local                   # 커밋 금지
└─ CLAUDE.md
```

---

## 🔥 Firestore 구조

```
/quiz_pools/{poolKey}            # poolKey = "math_grade3_easy_20260519"
  ├─ subject: string
  ├─ grade: number
  ├─ difficulty: string
  ├─ questions: array            # AI 생성 문제 배열
  └─ createdAt: timestamp

/games/{gameId}
  ├─ classId: string
  ├─ playerId: string
  ├─ score: number
  ├─ innings: array
  └─ createdAt

/classes/{classId}/ai_logs/{logId}
  ├─ prompt, response, userId, tokenCount, createdAt
```

---

## 🦶 푸터 (필수)

```jsx
<footer className="text-center pb-6 text-xs" style={{color:'#64748b'}}>
  © 2026 <a href="https://mumuclass.kr" style={{color:'#64748b'}}>무궁무진클래스</a> · 용쌤
</footer>
```

---

## 🚫 금지사항

- README.md 자동 생성 ❌
- 이 CLAUDE.md 무단 수정 ❌
- Gemini API 키 클라이언트 노출 ❌
- 레이트 리밋 없이 운영 배포 ❌
- 학생 개인정보 평문 저장 ❌

---

## 💡 차후 확장 아이디어 (MVP 이후)

- 학급 누적 점수 + 팀 대결 모드
- 학생이 직접 문제 등록 (AI 생성과 혼합)
- 픽셀아트 캐릭터 커스터마이징
- 홈런왕 명예의 전당 (전국)
- Disco 마일리지 연동
