// 하드코딩 문제 풀. API 키 없이도 즉시 플레이 가능.
// 키: `${subject}_grade${grade}_${difficulty}` (없으면 가장 가까운 키로 폴백)

const MATH_G3_EASY = [
  { q: '3 + 4 = ?', options: ['5', '6', '7', '8'], answer: 2, explanation: '3과 4를 더하면 7.' },
  { q: '9 - 5 = ?', options: ['2', '3', '4', '5'], answer: 2, explanation: '9에서 5를 빼면 4.' },
  { q: '2 × 5 = ?', options: ['7', '10', '12', '15'], answer: 1, explanation: '2를 5번 더하면 10.' },
  { q: '8 ÷ 2 = ?', options: ['2', '3', '4', '6'], answer: 2, explanation: '8을 2로 나누면 4.' },
  { q: '6 + 7 = ?', options: ['12', '13', '14', '15'], answer: 1, explanation: '6 + 7 = 13.' },
  { q: '15 - 8 = ?', options: ['5', '6', '7', '8'], answer: 2, explanation: '15 - 8 = 7.' },
  { q: '4 × 3 = ?', options: ['7', '10', '12', '14'], answer: 2, explanation: '4를 3번 = 12.' },
  { q: '20 ÷ 4 = ?', options: ['3', '4', '5', '6'], answer: 2, explanation: '20 ÷ 4 = 5.' },
  { q: '11 + 9 = ?', options: ['18', '19', '20', '21'], answer: 2, explanation: '11 + 9 = 20.' },
  { q: '7 × 2 = ?', options: ['12', '13', '14', '16'], answer: 2, explanation: '7 × 2 = 14.' },
  { q: '18 - 9 = ?', options: ['7', '8', '9', '10'], answer: 2, explanation: '18 - 9 = 9.' },
  { q: '5 × 5 = ?', options: ['20', '24', '25', '30'], answer: 2, explanation: '5의 제곱 = 25.' },
]

const MATH_G3_NORMAL = [
  { q: '6 × 7 = ?', options: ['36', '40', '42', '49'], answer: 2, explanation: '6단: 6,12,18,24,30,36,42.' },
  { q: '56 ÷ 8 = ?', options: ['5', '6', '7', '8'], answer: 2, explanation: '8 × 7 = 56.' },
  { q: '24 + 38 = ?', options: ['52', '58', '62', '64'], answer: 2, explanation: '일의자리 12 받아올림.' },
  { q: '70 - 27 = ?', options: ['33', '43', '47', '53'], answer: 1, explanation: '70 - 27 = 43.' },
  { q: '9 × 8 = ?', options: ['64', '70', '72', '81'], answer: 2, explanation: '9단: 9 × 8 = 72.' },
  { q: '81 ÷ 9 = ?', options: ['7', '8', '9', '11'], answer: 2, explanation: '9 × 9 = 81.' },
  { q: '125 + 76 = ?', options: ['191', '201', '211', '221'], answer: 1, explanation: '125+76=201.' },
  { q: '300 - 145 = ?', options: ['145', '155', '165', '175'], answer: 1, explanation: '300-145=155.' },
  { q: '12 × 4 = ?', options: ['42', '46', '48', '52'], answer: 2, explanation: '12 × 4 = 48.' },
  { q: '72 ÷ 6 = ?', options: ['10', '11', '12', '13'], answer: 2, explanation: '6 × 12 = 72.' },
]

const MATH_G3_HARD = [
  { q: '23 × 14 = ?', options: ['312', '322', '332', '342'], answer: 1, explanation: '23×14 = 23×10+23×4 = 230+92 = 322.' },
  { q: '144 ÷ 12 = ?', options: ['11', '12', '13', '14'], answer: 1, explanation: '12 × 12 = 144.' },
  { q: '사과 5개에 4500원이다. 1개의 값은?', options: ['800원','900원','1000원','1200원'], answer: 1, explanation: '4500 ÷ 5 = 900.' },
  { q: '한 변 9cm 정사각형의 둘레는?', options: ['18cm','27cm','36cm','45cm'], answer: 2, explanation: '9×4 = 36.' },
  { q: '3시간 = 몇 분?', options: ['120분','150분','180분','200분'], answer: 2, explanation: '60×3 = 180.' },
  { q: '1L = 몇 mL?', options: ['10','100','1000','10000'], answer: 2, explanation: '1L = 1000mL.' },
  { q: '17 × 6 = ?', options: ['92','102','112','118'], answer: 1, explanation: '17×6 = 102.' },
  { q: '구슬 96개를 8명에게 똑같이. 한 명은?', options: ['10개','11개','12개','14개'], answer: 2, explanation: '96 ÷ 8 = 12.' },
]

const KOREAN_G3_EASY = [
  { q: '"학교"의 반대말로 가까운 것은?', options: ['집','놀이터','병원','시장'], answer: 0, explanation: '학교에서 가서 쉬는 곳은 집.' },
  { q: '"빨갛다"와 비슷한 말은?', options: ['파랗다','붉다','노랗다','검다'], answer: 1, explanation: '"붉다"가 같은 색을 뜻한다.' },
  { q: '다음 중 명사는?', options: ['뛰다','예쁘다','책','빨리'], answer: 2, explanation: '책은 사물의 이름인 명사.' },
  { q: '"기쁘다"의 반대말은?', options: ['즐겁다','슬프다','신나다','놀라다'], answer: 1, explanation: '슬프다가 반대.' },
  { q: '받침이 있는 글자는?', options: ['가','나','산','우'], answer: 2, explanation: '산에는 받침 ㄴ이 있다.' },
  { q: '의성어는?', options: ['반짝반짝','멍멍','살랑살랑','폭신폭신'], answer: 1, explanation: '멍멍은 소리흉내(의성어).' },
  { q: '"아버지"의 높임말은?', options: ['아빠','아버님','형','삼촌'], answer: 1, explanation: '아버님이 높임말.' },
  { q: '문장의 끝에 쓰지 않는 부호는?', options: ['.','?','!',','], answer: 3, explanation: '쉼표는 문장 중간에 쓴다.' },
]

const KOREAN_G3_NORMAL = [
  { q: '"미소"와 가장 비슷한 낱말은?', options: ['웃음','눈물','한숨','외침'], answer: 0, explanation: '미소 = 웃음.' },
  { q: '주어가 있는 문장은?', options: ['빨리 뛰어!','어머나!','나는 학교에 간다.','거기 멈춰!'], answer: 2, explanation: '주어 "나는"이 있다.' },
  { q: '"바람이 살랑살랑 분다"에서 흉내내는 말은?', options: ['바람이','살랑살랑','분다','이'], answer: 1, explanation: '살랑살랑이 의태어.' },
  { q: '맞춤법이 옳은 것은?', options: ['깨끗히','깨끄시','깨끗이','깨끗시'], answer: 2, explanation: '"깨끗이"가 맞다.' },
  { q: '"책을 읽다"의 목적어는?', options: ['책을','읽다','을','책읽'], answer: 0, explanation: '"을/를"이 붙은 말이 목적어.' },
  { q: '"-님"이 붙은 높임말이 아닌 것은?', options: ['선생님','어머님','친구님','사장님'], answer: 2, explanation: '"친구님"은 어색.' },
]

const KOREAN_G3_HARD = [
  { q: '시에서 사람이 아닌 것을 사람처럼 표현하는 기법은?', options: ['비유','의인법','직유법','반복법'], answer: 1, explanation: '의인법은 사물을 사람처럼.' },
  { q: '"천 리 길도 한 걸음부터"의 뜻에 가장 맞는 것은?', options: ['가까운 길이 좋다','시작이 중요하다','빨리 가야 한다','함께 가야 한다'], answer: 1, explanation: '큰 일도 작은 시작에서.' },
  { q: '다음 중 합성어는?', options: ['하늘','꽃','책가방','달'], answer: 2, explanation: '책+가방 = 합성어.' },
  { q: '"-었-"이 들어간 시제는?', options: ['현재','과거','미래','명령'], answer: 1, explanation: '과거 시제 어미.' },
  { q: '문맥상 빈칸: "비가 ____ 우산을 썼다."', options: ['오면','와서','오고','올'], answer: 1, explanation: '원인-결과: "와서".' },
  { q: '"매우"와 같은 품사는?', options: ['빨리','책','뛰다','파란'], answer: 0, explanation: '둘 다 부사.' },
]

const ENGLISH_G3_EASY = [
  { q: 'Apple은 한국어로?', options: ['바나나','사과','포도','오렌지'], answer: 1, explanation: 'apple = 사과.' },
  { q: 'Dog은 무슨 뜻?', options: ['고양이','강아지','새','물고기'], answer: 1, explanation: 'dog = 개/강아지.' },
  { q: '"Hello!"의 뜻은?', options: ['잘 가','안녕','고마워','미안해'], answer: 1, explanation: '인사말 안녕.' },
  { q: '숫자 5의 영어는?', options: ['four','five','six','seven'], answer: 1, explanation: '5 = five.' },
  { q: 'Red는 무슨 색?', options: ['파랑','빨강','초록','노랑'], answer: 1, explanation: 'red = 빨강.' },
  { q: 'Cat은?', options: ['개','고양이','쥐','새'], answer: 1, explanation: 'cat = 고양이.' },
  { q: 'Book의 뜻은?', options: ['연필','책','지우개','가방'], answer: 1, explanation: 'book = 책.' },
]

const ENGLISH_G3_NORMAL = [
  { q: '"I ___ a student." 빈칸에 알맞은 것은?', options: ['is','am','are','be'], answer: 1, explanation: 'I 는 am.' },
  { q: '"How ___ you?"', options: ['is','am','are','be'], answer: 2, explanation: 'you는 are.' },
  { q: 'Monday는?', options: ['일요일','월요일','화요일','수요일'], answer: 1, explanation: '월요일.' },
  { q: '"What is this?" - "It is ___ apple."', options: ['a','an','the','x'], answer: 1, explanation: 'apple은 모음으로 an.' },
  { q: 'Big의 반대말은?', options: ['short','small','tall','long'], answer: 1, explanation: 'small.' },
]

const ENGLISH_G3_HARD = [
  { q: '"She ___ to school every day."', options: ['go','goes','going','gone'], answer: 1, explanation: '3인칭 단수: goes.' },
  { q: '"Yesterday I ___ a book."', options: ['read','reads','reading','readed'], answer: 0, explanation: 'read의 과거형도 read.' },
  { q: '"There ___ two cats."', options: ['is','are','am','be'], answer: 1, explanation: '복수: are.' },
  { q: 'Quickly는 어떤 품사?', options: ['명사','동사','형용사','부사'], answer: 3, explanation: '-ly 부사.' },
]

const SCIENCE_G3_EASY = [
  { q: '식물이 자라는 데 꼭 필요한 것이 아닌 것은?', options: ['물','햇빛','공기','얼음'], answer: 3, explanation: '얼음은 필요 없다.' },
  { q: '낮에 하늘에 떠 있는 별은?', options: ['달','태양','북두칠성','금성'], answer: 1, explanation: '태양도 별이다.' },
  { q: '얼음이 녹으면 무엇이 되나?', options: ['수증기','물','얼음','눈'], answer: 1, explanation: '고체 → 액체.' },
  { q: '나비의 어린 시기는?', options: ['알','애벌레','번데기','어른벌레'], answer: 1, explanation: '알 다음은 애벌레.' },
  { q: '자석에 붙는 것은?', options: ['종이','나무','철','유리'], answer: 2, explanation: '자석은 철에 붙는다.' },
]

const SCIENCE_G3_NORMAL = [
  { q: '물이 끓는 온도는?', options: ['50도','80도','100도','120도'], answer: 2, explanation: '평지에서 100°C.' },
  { q: '식물의 광합성에 필요한 기체는?', options: ['산소','이산화탄소','질소','수소'], answer: 1, explanation: '이산화탄소를 흡수.' },
  { q: '곤충의 다리는 몇 개?', options: ['4','6','8','10'], answer: 1, explanation: '곤충 다리 6개.' },
  { q: '태양계에서 가장 큰 행성은?', options: ['지구','화성','목성','토성'], answer: 2, explanation: '목성.' },
  { q: '소리는 무엇으로 전달되나?', options: ['빛','진동','자기력','전기'], answer: 1, explanation: '공기의 진동.' },
]

const SCIENCE_G3_HARD = [
  { q: '물질의 상태 변화 중 "기체 → 액체"는?', options: ['증발','응결','용해','승화'], answer: 1, explanation: '응결.' },
  { q: '지구의 자전 주기는?', options: ['12시간','24시간','30일','365일'], answer: 1, explanation: '하루 24시간.' },
  { q: '식물의 양분을 만드는 곳은?', options: ['뿌리','줄기','잎','꽃'], answer: 2, explanation: '잎에서 광합성.' },
  { q: '소금물에서 소금을 분리하는 방법은?', options: ['거름','증발','자석','체'], answer: 1, explanation: '물을 증발시킨다.' },
]

const SOCIAL_G3_EASY = [
  { q: '한국의 수도는?', options: ['부산','서울','인천','대구'], answer: 1, explanation: '대한민국 수도는 서울.' },
  { q: '신호등의 색이 아닌 것은?', options: ['빨강','노랑','초록','파랑'], answer: 3, explanation: '파랑은 신호등 색이 아님.' },
  { q: '우리나라 국화는?', options: ['장미','무궁화','진달래','벚꽃'], answer: 1, explanation: '무궁화.' },
  { q: '한복은 어느 나라의 옷?', options: ['중국','한국','일본','베트남'], answer: 1, explanation: '한국 전통 의복.' },
  { q: '경찰서의 신고 전화는?', options: ['112','114','119','120'], answer: 0, explanation: '112.' },
]

const SOCIAL_G3_NORMAL = [
  { q: '대한민국의 화폐 단위는?', options: ['엔','달러','원','위안'], answer: 2, explanation: '원(KRW).' },
  { q: '세종대왕이 만든 것은?', options: ['활자','한글','지도','거북선'], answer: 1, explanation: '훈민정음(한글).' },
  { q: '지도에서 북쪽은 보통 어느 방향?', options: ['위쪽','아래쪽','왼쪽','오른쪽'], answer: 0, explanation: '지도 위쪽이 북.' },
  { q: '우리나라에서 가장 큰 섬은?', options: ['거제도','강화도','제주도','울릉도'], answer: 2, explanation: '제주도.' },
  { q: '국회의원을 뽑는 것을 무엇이라 하나?', options: ['투표','회의','시험','연설'], answer: 0, explanation: '선거에서 투표.' },
]

const SOCIAL_G3_HARD = [
  { q: '삼국시대 세 나라가 아닌 것은?', options: ['고구려','백제','신라','발해'], answer: 3, explanation: '발해는 통일신라 이후.' },
  { q: '대한민국 정부 형태는?', options: ['왕정','민주공화국','연방제','독재'], answer: 1, explanation: '민주공화국.' },
  { q: '"이순신"이 활약한 전쟁은?', options: ['병자호란','임진왜란','6.25전쟁','삼별초'], answer: 1, explanation: '임진왜란.' },
  { q: '세계에서 가장 큰 대륙은?', options: ['아프리카','아시아','유럽','북아메리카'], answer: 1, explanation: '아시아.' },
]

const POOLS = {
  math_grade3_easy: MATH_G3_EASY,
  math_grade3_normal: MATH_G3_NORMAL,
  math_grade3_hard: MATH_G3_HARD,
  korean_grade3_easy: KOREAN_G3_EASY,
  korean_grade3_normal: KOREAN_G3_NORMAL,
  korean_grade3_hard: KOREAN_G3_HARD,
  english_grade3_easy: ENGLISH_G3_EASY,
  english_grade3_normal: ENGLISH_G3_NORMAL,
  english_grade3_hard: ENGLISH_G3_HARD,
  science_grade3_easy: SCIENCE_G3_EASY,
  science_grade3_normal: SCIENCE_G3_NORMAL,
  science_grade3_hard: SCIENCE_G3_HARD,
  social_grade3_easy: SOCIAL_G3_EASY,
  social_grade3_normal: SOCIAL_G3_NORMAL,
  social_grade3_hard: SOCIAL_G3_HARD,
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getSampleQuestions({ subject, grade, difficulty, count = 10 }) {
  const exactKey = `${subject}_grade${grade}_${difficulty}`
  // 정확히 매칭되는 풀 > 같은 과목/난이도 (다른 학년) > 같은 과목 > 수학 보통
  const candidates = [
    POOLS[exactKey],
    POOLS[`${subject}_grade3_${difficulty}`],
    POOLS[`${subject}_grade3_normal`],
    POOLS['math_grade3_normal'],
  ].filter(Boolean)
  const base = candidates[0] || []
  const shuffled = shuffle(base)
  // 부족하면 반복해서 채움
  const out = []
  while (out.length < count) {
    out.push(...shuffled)
  }
  return out.slice(0, count)
}
