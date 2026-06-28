// 내몸에미소 통증·체형 자가진단 + 7일 루틴 데이터 (v1)

export type TypeKey = "neck" | "pelvis" | "back" | "whole";

export interface Option {
  label: string;
  scores?: Partial<Record<TypeKey, number>>;
  risk?: number; // 위험도 가산점
}
export interface Question {
  q: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    q: "하루에 앉아 있는 시간이 얼마나 되세요?",
    options: [
      { label: "4시간 미만", scores: { whole: 1 } },
      { label: "4~8시간", scores: { neck: 1, back: 1 } },
      { label: "8시간 이상", scores: { neck: 2, back: 1 }, risk: 1 },
    ],
  },
  {
    q: "가장 불편한 곳은 어디인가요?",
    options: [
      { label: "목·어깨·등 위쪽", scores: { neck: 3 } },
      { label: "허리 (특히 깊은 곳)", scores: { back: 3 } },
      { label: "골반·다리·엉덩이", scores: { pelvis: 3 } },
      { label: "여기저기 다 뻐근하고 순환이 안 돼요", scores: { whole: 3 } },
    ],
  },
  {
    q: "언제 더 불편하세요?",
    options: [
      { label: "아침에 일어났을 때", scores: { back: 2, whole: 1 } },
      { label: "오래 앉아 있은 뒤", scores: { neck: 2, back: 1 } },
      { label: "하루 끝, 저녁때", scores: { whole: 2 } },
    ],
  },
  {
    q: "거울로 옆모습을 보면, 귀가 어깨보다 앞으로 나와 있나요?",
    options: [
      { label: "네, 나와 있어요", scores: { neck: 3 }, risk: 1 },
      { label: "잘 모르겠어요", scores: { neck: 1 } },
      { label: "아니요", scores: {} },
    ],
  },
  {
    q: "어깨가 안쪽으로 말려 있는 편인가요? (라운드 숄더)",
    options: [
      { label: "네, 말려 있어요", scores: { neck: 2 } },
      { label: "조금 그런 것 같아요", scores: { neck: 1 } },
      { label: "아니요", scores: {} },
    ],
  },
  {
    q: "짝다리를 자주 짚거나, 한쪽 신발만 더 닳나요?",
    options: [
      { label: "네, 그래요", scores: { pelvis: 3 }, risk: 1 },
      { label: "가끔요", scores: { pelvis: 1 } },
      { label: "아니요", scores: {} },
    ],
  },
  {
    q: "스트레칭이나 마사지를 받으면 잠깐 괜찮다가 다시 돌아오나요?",
    options: [
      { label: "네, 계속 재발해요", scores: { back: 2, whole: 1 }, risk: 2 },
      { label: "조금 그래요", scores: { back: 1 }, risk: 1 },
      { label: "아니요", scores: {} },
    ],
  },
  {
    q: "지금 불편함의 정도는 어느 정도인가요?",
    options: [
      { label: "가볍게 신경 쓰이는 정도", risk: 0 },
      { label: "일상에서 자주 불편함", risk: 2 },
      { label: "특정 동작이 힘들거나 꽤 아픔", risk: 3 },
    ],
  },
];

export interface RoutineDay {
  day: number;
  title: string;
  how: string; // 동작 방법
  point: string; // 느낌 포인트
  durationSec: number;
  imageUrl?: string; // 비우면 텍스트만, 나중에 사진 추가
}

export interface ResultType {
  key: TypeKey;
  name: string;
  oneLiner: string;
  why: string;
  routine: RoutineDay[];
  keywords: string[]; // 관련 칼럼 매칭용 (제목·태그에서 검색)
  shareLine: string; // 공유 카드 한 줄 카피
}

export const resultTypes: Record<TypeKey, ResultType> = {
  neck: {
    key: "neck",
    name: "거북목·라운드숄더형",
    keywords: ["거북목", "목", "어깨", "라운드숄더", "승모근", "굽은등", "자세", "스마트폰"],
    shareLine: "나는 거북목·라운드숄더형! 너도 1분이면 확인돼",
    oneLiner: "머리와 어깨가 앞으로 — 상체 앞쪽이 굳고 뒤쪽이 늘어진 상태예요.",
    why: "오래 앉아 화면을 보면 머리가 앞으로 빠지고 어깨가 말립니다. 목·등 뒤 근육은 늘어난 채 계속 버티느라 뭉치고, 가슴 앞쪽은 짧아져요. 스트레칭만으로는 잘 안 돌아오는 이유입니다.",
    routine: [
      { day: 1, title: "턱 당기기 (친 턱)", how: "벽에 등을 대고 턱을 살짝 뒤로 당겨 뒤통수를 벽에 가깝게. 5초 유지 후 풀기 × 10회.", point: "목이 길어지는 느낌", durationSec: 90, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782657951893.png" },
      { day: 2, title: "가슴 열기 (문틀 스트레칭)", how: "문틀에 팔꿈치를 대고 한 발 앞으로. 가슴 앞쪽이 늘어나게 30초 × 2회.", point: "가슴 앞쪽이 시원하게 늘어남", durationSec: 90, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658012261.png" },
      { day: 3, title: "견갑 모으기", how: "팔을 살짝 벌리고 날개뼈를 등 가운데로 천천히 모았다 풀기 × 12회.", point: "등 가운데에 힘이 들어옴", durationSec: 90, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658027946.png" },
      { day: 4, title: "상부 승모근 늘이기", how: "한 손으로 머리를 반대쪽으로 부드럽게 당겨 목옆을 늘림. 좌우 30초씩.", point: "목과 어깨 사이가 풀림", durationSec: 90, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658044574.png" },
      { day: 5, title: "흉추 펴기 (벽 신전)", how: "등 위쪽만 벽/폼롤러에 기대 가슴을 위로 열며 신전 × 10회.", point: "굽은 등이 펴지는 느낌", durationSec: 120, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658056861.png" },
      { day: 6, title: "누워서 턱 당기기", how: "바로 누워 뒤통수로 바닥을 가볍게 누르며 턱 당기기 5초 × 10회.", point: "목 깊은 근육이 켜짐", durationSec: 90, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658071739.png" },
      { day: 7, title: "자세 리셋 통합", how: "1·3·5일 동작을 이어서 한 세트. 끝나고 바른 자세로 1분 호흡.", point: "상체 정렬을 몸이 기억", durationSec: 180, imageUrl: "https://dfkqvobimrjhilihczvp.supabase.co/storage/v1/object/public/blog-images/1782658086384.png" },
    ],
  },
  pelvis: {
    key: "pelvis",
    name: "골반·하체 불균형형",
    keywords: ["골반", "짝다리", "다리", "엉덩이", "좌우", "불균형", "비대칭", "고관절"],
    shareLine: "나는 골반·하체 불균형형! 너도 1분이면 확인돼",
    oneLiner: "골반이 한쪽으로 기울거나 틀어져, 하체로 불균형이 내려간 상태예요.",
    why: "짝다리·다리 꼬기 습관이 쌓이면 골반이 한쪽으로 기울고, 양쪽 근육이 다르게 일합니다. 한쪽 신발만 닳거나 한쪽이 더 뻐근한 건 그 신호예요.",
    routine: [
      { day: 1, title: "골반 중립 찾기", how: "무릎 세워 누워 골반을 앞뒤로 천천히 기울이다 중간 지점에서 멈춰 호흡 × 10회.", point: "허리 바닥이 편해지는 지점", durationSec: 90 },
      { day: 2, title: "엉덩이 스트레칭 (피겨4)", how: "누워 한 발목을 반대 무릎에 걸고 다리를 몸쪽으로 당김. 좌우 30초씩.", point: "엉덩이 깊은 곳이 늘어남", durationSec: 90 },
      { day: 3, title: "고관절 앞쪽 늘이기", how: "한 발 앞 런지 자세에서 뒷다리 고관절 앞쪽을 늘림. 좌우 30초.", point: "골반 앞이 시원함", durationSec: 90 },
      { day: 4, title: "엉덩이 활성 (브릿지)", how: "무릎 세워 누워 엉덩이에 힘주며 골반 들기 3초 유지 × 12회.", point: "엉덩이가 일하는 느낌", durationSec: 90 },
      { day: 5, title: "옆구리·이상근 늘이기", how: "앉아 다리 꼬고 상체를 반대로 비틀어 옆·엉덩이 늘림. 좌우 30초.", point: "틀어진 쪽이 더 당김", durationSec: 90 },
      { day: 6, title: "한 다리 균형", how: "한 발로 서서 10초 버티기 좌우 × 3세트. 흔들리는 쪽을 인지.", point: "약한 쪽 균형 깨우기", durationSec: 120 },
      { day: 7, title: "골반 정렬 통합", how: "2·4·6일 동작을 한 세트로. 끝나고 양발 균등하게 서서 1분.", point: "양쪽 균형을 몸이 기억", durationSec: 180 },
    ],
  },
  back: {
    key: "back",
    name: "허리 심부형",
    keywords: ["허리", "코어", "디스크", "요통", "심부", "호흡", "복압"],
    shareLine: "나는 허리 심부형! 너도 1분이면 확인돼",
    oneLiner: "표면이 아니라 허리 깊은 곳(심부)이 굳어, 풀려도 자꾸 돌아오는 상태예요.",
    why: "스트레칭·마사지로도 잠깐 낫다 재발한다면, 표면이 아니라 심부 근육의 문제일 때가 많습니다. 심부는 힘이 아니라 호흡이 만드는 내부 압력으로 풀어야 합니다.",
    routine: [
      { day: 1, title: "360도 복식호흡 — 앞", how: "단전에 살짝 힘준 채 코로 깊게 들이마셔 배 앞이 부풀게 × 10회.", point: "배가 사방으로 차는 느낌", durationSec: 120 },
      { day: 2, title: "복식호흡 — 옆구리", how: "양손을 옆구리에 대고 숨이 손을 밀어내듯 옆으로 퍼지게 × 10회.", point: "옆구리가 열리는 느낌", durationSec: 120 },
      { day: 3, title: "복식호흡 — 등쪽", how: "의자에 살짝 숙여 앉아 숨이 등 뒤로 퍼지게 × 10회.", point: "등 뒤가 부풀어 오름", durationSec: 120 },
      { day: 4, title: "고양이-소 (척추 가동)", how: "엎드려 등을 둥글게 말았다 펴기를 호흡에 맞춰 × 10회.", point: "척추 마디마디가 움직임", durationSec: 90 },
      { day: 5, title: "허리 이완 (차일드 포즈)", how: "무릎 꿇고 상체를 앞으로 길게 늘여 허리 이완 30초 × 2회.", point: "허리가 길게 늘어남", durationSec: 90 },
      { day: 6, title: "데드버그 (심부 안정)", how: "누워 반대 팔·다리를 천천히 뻗었다 돌아오기, 허리는 바닥에 × 8회.", point: "허리가 흔들리지 않게", durationSec: 120 },
      { day: 7, title: "심부 통합", how: "1·4·6일 동작을 이어서. 끝나고 360도 호흡 1분으로 마무리.", point: "심부가 깨어난 느낌", durationSec: 180 },
    ],
  },
  whole: {
    key: "whole",
    name: "전신 뻣뻣·순환형",
    keywords: ["전신", "순환", "뻣뻣", "스트레칭", "운동", "움직임", "유연성"],
    shareLine: "나는 전신 뻣뻣·순환형! 너도 1분이면 확인돼",
    oneLiner: "특정 부위보다 전반적으로 굳고 순환이 더딘, 관리 시작이 필요한 상태예요.",
    why: "한 곳이 아니라 전반적으로 뻐근하다면, 움직임 양이 적고 순환이 더딘 경우가 많습니다. 짧게라도 매일 몸을 깨우는 습관이 가장 효과적입니다.",
    routine: [
      { day: 1, title: "전신 깨우기", how: "목→어깨→허리→고관절 순으로 천천히 크게 돌리기 각 8회.", point: "관절마다 부드러워짐", durationSec: 120 },
      { day: 2, title: "흉추 회전", how: "옆으로 누워 위쪽 팔로 큰 원을 그리며 가슴을 열기 좌우 8회.", point: "등·가슴이 트임", durationSec: 90 },
      { day: 3, title: "하체 스트레칭", how: "선 채 한 다리 뒤꿈치 밀어 종아리·뒤허벅지 늘림 좌우 30초.", point: "다리 뒤가 시원함", durationSec: 90 },
      { day: 4, title: "가벼운 스쿼트", how: "의자에 앉았다 일어나듯 천천히 × 10회. 무릎이 발끝 방향.", point: "하체에 온기가 돎", durationSec: 90 },
      { day: 5, title: "호흡 + 이완", how: "편히 앉아 4초 들이쉬고 6초 내쉬기 × 10회.", point: "몸이 풀리고 따뜻해짐", durationSec: 120 },
      { day: 6, title: "코어 + 균형", how: "플랭크 자세를 무릎 대고 20초 × 3회. 흔들리지 않게.", point: "몸통이 단단해짐", durationSec: 120 },
      { day: 7, title: "전신 통합", how: "1·3·5일 동작을 이어서 한 세트. 끝나고 깊은 호흡 1분.", point: "몸이 한결 가벼움", durationSec: 180 },
    ],
  },
};

export const riskLevels = [
  { max: 2, label: "낮음", note: "지금 관리하면 충분히 좋아질 수 있어요." },
  { max: 5, label: "보통", note: "습관이 쌓이기 전에 지금 잡는 게 좋아요." },
  { max: 99, label: "주의", note: "혼자보다 전문가 점검을 함께 권해요." },
];

export function scoreToType(answers: number[]): TypeKey {
  const totals: Record<TypeKey, number> = { neck: 0, pelvis: 0, back: 0, whole: 0 };
  answers.forEach((optIdx, qIdx) => {
    const opt = questions[qIdx]?.options[optIdx];
    if (opt?.scores) {
      (Object.keys(opt.scores) as TypeKey[]).forEach((k) => {
        totals[k] += opt.scores![k] ?? 0;
      });
    }
  });
  // 최고점 유형 (동점 시 back > neck > pelvis > whole 우선)
  const order: TypeKey[] = ["back", "neck", "pelvis", "whole"];
  let best: TypeKey = "whole";
  let bestVal = -1;
  for (const k of order) {
    if (totals[k] > bestVal) {
      bestVal = totals[k];
      best = k;
    }
  }
  return bestVal <= 0 ? "whole" : best;
}

export function scoreToRisk(answers: number[]) {
  let r = 0;
  answers.forEach((optIdx, qIdx) => {
    r += questions[qIdx]?.options[optIdx]?.risk ?? 0;
  });
  return riskLevels.find((l) => r <= l.max) ?? riskLevels[riskLevels.length - 1];
}
