# 뚝딱야구 배포 가이드

## 1. Vercel 환경변수 등록

Vercel 대시보드 → Project → Settings → Environment Variables에 다음 값 등록:

### 서버 전용 (절대 클라이언트 노출 금지)
| 키 | 값 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio에서 발급한 Gemini API 키 |

### 클라이언트 (VITE_ 프리픽스, 공개됨)
| 키 | 값 |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase 콘솔 → 프로젝트 설정 → 웹앱 구성 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `<project-id>` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID |
| `VITE_FIREBASE_APP_ID` | 웹앱 ID |

> Firebase 변수가 비어도 앱은 동작합니다 (localStorage 캐시 + 폴백 문제 풀로 자동 전환).

## 2. Firestore 보안 규칙 초안

`firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 문제 풀: 누구나 읽기, 쓰기는 서버/관리자 또는 인증된 호출만
    match /quiz_pools/{poolId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 게임 기록: 본인만
    match /games/{gameId} {
      allow read, write: if request.auth != null
        && request.resource.data.playerId == request.auth.uid;
    }

    // AI 로그: 쓰기만 허용 (분석용 - 읽기는 관리자 콘솔)
    match /classes/{classId}/ai_logs/{logId} {
      allow create: if request.auth != null;
      allow read: if false;
    }
  }
}
```

## 3. 도메인 연결

- Vercel → Domains → `baseball.mumuclass.kr` 추가
- Cloudflare/DNS에서 CNAME → `cname.vercel-dns.com`

## 4. 로컬 스모크 테스트

```bash
npm install
npm run dev
```

확인 사항:
- [ ] / (Home) - 과목/학년/난이도 선택 UI 동작
- [ ] /game - AI 로딩 또는 폴백 문제 표시
- [ ] 3가지 트리거가 무작위로 발동되는지 (BEFORE/DURING/AFTER)
- [ ] 스페이스바 스윙 타이밍 측정
- [ ] 3아웃 → 다음 이닝
- [ ] 3이닝 → /result 페이지 이동
- [ ] 푸터(© 무궁무진클래스) 표시

## 5. 학생/교사 QA 시나리오

### 학생
1. Home에서 본인 학년/과목 선택
2. 1경기(3이닝)을 끝까지 플레이
3. 결과 페이지에서 타율 확인
4. "다시하기"로 같은 설정 재시작

### 교사
1. 학년별로 난이도를 바꿔가며 문제 품질 확인
2. 비용 가드(`DAILY_LIMIT`)가 작동하는지 (localStorage `aiCount:*` 확인)
3. Firebase 콘솔에서 `quiz_pools` 캐시가 생성되는지
4. 30~40분 수업 시간에 맞는 호흡인지 (3이닝 ≈ 9~12분)

## 6. 운영 체크리스트

- [ ] `GEMINI_API_KEY`는 Vercel에만 (`.env.local`은 빈 값 또는 로컬 개발용만)
- [ ] `.gitignore`에 `.env.local` 포함됨 (확인됨)
- [ ] Firestore 보안 규칙 배포 (`firebase deploy --only firestore:rules`)
- [ ] Vercel 빌드 명령: `npm run build`, 출력: `dist`
- [ ] SPA 라우팅: `vercel.json` rewrite (확인됨)
