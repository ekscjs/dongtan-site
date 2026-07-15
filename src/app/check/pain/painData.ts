// 통증지도 데이터 — 내몸에미소

export type AreaKey = "neck" | "shoulder" | "back" | "pelvis" | "knee" | "ankle";

export interface PainArea {
  key: AreaKey;
  label: string;
  emoji: string;
  questions: string[];
  results: PainResult[];
}

export interface PainResult {
  title: string;
  desc: string;
  priority: number; // 1=높음, 2=보통
  matchFn: (checked: boolean[]) => boolean;
}

export const painAreas: Record<AreaKey, PainArea> = {
  neck: {
    key: "neck",
    label: "목",
    emoji: "🔴",
    questions: [
      "오래 앉아 있으면 목이 뻣뻣해진다",
      "고개를 돌릴 때 한쪽이 잘 안 돌아간다",
      "목에서 어깨로 통증이 번진다",
      "두통이 자주 온다",
      "스마트폰·컴퓨터 사용 시간이 하루 4시간 이상이다",
    ],
    results: [
      {
        title: "거북목·라운드숄더 패턴",
        desc: "고개가 앞으로 빠지면서 목 뒷근육이 늘어난 채 굳는 상태입니다. 스트레칭만으로는 잘 안 풀리고 자세 교정이 필요합니다.",
        priority: 1,
        matchFn: (c) => c[0] && c[4],
      },
      {
        title: "경추 가동성 저하",
        desc: "목 관절 자체의 움직임이 제한된 상태입니다. 방치하면 어깨·팔 저림으로 번질 수 있습니다.",
        priority: 1,
        matchFn: (c) => c[1],
      },
      {
        title: "근막 긴장성 두통",
        desc: "목 근육 긴장이 두통으로 연결되는 패턴입니다. 목 심부 근육과 흉추 움직임을 함께 풀어야 합니다.",
        priority: 2,
        matchFn: (c) => c[3],
      },
      {
        title: "목·어깨 연결 통증",
        desc: "목에서 시작한 긴장이 어깨까지 퍼진 상태입니다. 승모근과 목 사이 근막을 함께 풀어야 효과적입니다.",
        priority: 2,
        matchFn: (c) => c[2],
      },
    ],
  },

  shoulder: {
    key: "shoulder",
    label: "어깨",
    emoji: "🔴",
    questions: [
      "팔을 위로 올리기 불편하다",
      "자다가 어깨 통증으로 깬 적이 있다",
      "어깨를 돌리면 소리가 난다",
      "가방·짐을 한쪽으로만 드는 편이다",
      "어깨가 한쪽이 더 앞으로 나와 있다 (라운드숄더)",
    ],
    results: [
      {
        title: "어깨 내부 충돌 패턴",
        desc: "팔을 들 때 어깨 내부 구조물이 부딪히는 패턴입니다. 방치하면 어깨 조직에 부담이 누적될 수 있어 초기 대응이 중요합니다.",
        priority: 1,
        matchFn: (c) => c[0] && c[1],
      },
      {
        title: "어깨 좌우 불균형",
        desc: "한쪽 어깨에 부하가 집중된 상태입니다. 근육 불균형이 목과 허리까지 영향을 줄 수 있습니다.",
        priority: 2,
        matchFn: (c) => c[3],
      },
      {
        title: "라운드숄더 패턴",
        desc: "어깨가 안쪽으로 말려 가슴 앞쪽이 짧아진 상태입니다. 가슴 근육 이완과 등 근육 활성화가 필요합니다.",
        priority: 2,
        matchFn: (c) => c[4],
      },
      {
        title: "관절 가동범위 제한",
        desc: "어깨 관절의 움직임이 줄어든 상태입니다. 소리가 나는 것만으로는 크게 위험하지 않지만, 통증과 함께라면 점검이 필요합니다.",
        priority: 2,
        matchFn: (c) => c[2],
      },
    ],
  },

  back: {
    key: "back",
    label: "허리",
    emoji: "🔴",
    questions: [
      "오래 앉으면 허리가 아프다",
      "앞으로 숙일 때 당기거나 아프다",
      "뒤로 젖히면 허리가 아프다",
      "다리 저림이 있다 (엉덩이·허벅지·종아리)",
      "아침에 일어나면 한동안 허리가 뻣뻣하다",
      "스트레칭하면 잠깐 낫다가 다시 돌아온다",
    ],
    results: [
      {
        title: "허리 디스크 부담 패턴",
        desc: "앞으로 숙일 때 통증이 심하고 다리 저림이 있다면 허리 디스크 쪽에 부담이 실리는 패턴일 수 있습니다. 전문 평가가 필요합니다.",
        priority: 1,
        matchFn: (c) => c[1] && c[3],
      },
      {
        title: "허리 안정성 저하",
        desc: "코어 심부 근육이 약해 허리를 제대로 지지하지 못하는 상태입니다. 풀었다가 재발하는 반복 패턴이 특징입니다.",
        priority: 1,
        matchFn: (c) => c[0] && c[5],
      },
      {
        title: "척추 관절 부담 패턴",
        desc: "뒤로 젖힐 때 통증이 심하다면 척추 관절 쪽에 부담이 실리는 패턴일 수 있습니다. 일반 코어 운동보다 관절 가동성 회복이 먼저입니다.",
        priority: 1,
        matchFn: (c) => c[2],
      },
      {
        title: "근육 긴장·만성 피로형",
        desc: "심각한 구조 문제보다 근육 과부하가 누적된 패턴입니다. 아침 뻣뻣함은 야간 근육 긴장의 신호입니다.",
        priority: 2,
        matchFn: (c) => c[4] && !c[3],
      },
    ],
  },

  pelvis: {
    key: "pelvis",
    label: "골반",
    emoji: "🔴",
    questions: [
      "한쪽 엉덩이만 더 아프거나 뻐근하다",
      "바지 허리선이 한쪽으로 쏠린다",
      "오래 앉으면 꼬리뼈·골반이 아프다",
      "짝다리를 자주 짚거나 한쪽으로 기댄다",
      "한 발로 서면 금방 흔들린다",
    ],
    results: [
      {
        title: "골반 좌우 비대칭",
        desc: "골반이 한쪽으로 기울어진 상태입니다. 허리와 무릎에도 비대칭 부하가 걸려 장기적으로 두 군데 모두 문제가 생길 수 있습니다.",
        priority: 1,
        matchFn: (c) => (c[0] && c[1]) || (c[3] && c[1]),
      },
      {
        title: "고관절 안정성 저하",
        desc: "한 발로 서면 흔들리는 건 고관절 주변 근육이 제 역할을 못하는 신호입니다. 골반 불안정으로 이어질 수 있습니다.",
        priority: 1,
        matchFn: (c) => c[4],
      },
      {
        title: "좌식 자세 과부하",
        desc: "오래 앉는 습관으로 꼬리뼈·골반 바닥 근육에 과부하가 쌓인 상태입니다.",
        priority: 2,
        matchFn: (c) => c[2],
      },
    ],
  },

  knee: {
    key: "knee",
    label: "무릎",
    emoji: "🔴",
    questions: [
      "계단을 오르내릴 때 무릎이 아프다",
      "오래 앉았다 일어설 때 무릎이 뻣뻣하다",
      "무릎에서 소리가 자주 난다",
      "무릎이 안쪽 또는 바깥쪽으로 쏠린다 (X자·O자)",
      "달리기나 운동 후 무릎이 아프다",
    ],
    results: [
      {
        title: "슬개골(무릎뼈) 정렬 이상",
        desc: "계단에서 통증이 심하다면 무릎뼈가 정상 궤도에서 벗어난 패턴일 수 있습니다. 대퇴사두근과 엉덩이 근육 불균형이 원인인 경우가 많습니다.",
        priority: 1,
        matchFn: (c) => c[0],
      },
      {
        title: "무릎 정렬 불량 (X자·O자)",
        desc: "무릎이 안팎으로 쏠리면 관절 한쪽에만 압력이 집중됩니다. 장기적으로 연골 손상 위험이 높아집니다.",
        priority: 1,
        matchFn: (c) => c[3],
      },
      {
        title: "관절 가동성 저하",
        desc: "앉았다 일어날 때 뻣뻣한 건 무릎 관절액 순환이 더딘 신호입니다. 가볍게 움직임을 늘려주는 것만으로도 개선됩니다.",
        priority: 2,
        matchFn: (c) => c[1],
      },
      {
        title: "운동 부하 과잉",
        desc: "운동 후 통증은 무릎이 현재 부하를 버티지 못한다는 신호입니다. 하체 근력 강화와 운동량 조절이 필요합니다.",
        priority: 2,
        matchFn: (c) => c[4],
      },
    ],
  },

  ankle: {
    key: "ankle",
    label: "발목",
    emoji: "🔴",
    questions: [
      "발목을 자주 삔 적이 있다 (반복 염좌)",
      "오래 서 있으면 발목이 붓거나 무겁다",
      "발목이 안쪽으로 꺾이는 편이다 (내반)",
      "걸을 때 발이 밖으로 벌어진다",
      "발바닥이 자주 아프다 (아치 부담 의심)",
    ],
    results: [
      {
        title: "발목 불안정성",
        desc: "반복 염좌 후 발목 인대가 느슨해져 불안정한 상태입니다. 균형 훈련 없이 방치하면 만성 불안정으로 굳어집니다.",
        priority: 1,
        matchFn: (c) => c[0],
      },
      {
        title: "발바닥 근막 부담 패턴",
        desc: "발바닥 통증은 족저근막에 과부하가 걸린 신호입니다. 종아리·아킬레스건 단축이 함께 있는 경우가 많습니다.",
        priority: 1,
        matchFn: (c) => c[4],
      },
      {
        title: "발목 정렬 이상",
        desc: "발목이 안쪽으로 꺾이거나 발이 벌어지면 무릎과 골반에도 연쇄적으로 영향을 줍니다.",
        priority: 2,
        matchFn: (c) => c[2] || c[3],
      },
      {
        title: "순환·부종",
        desc: "오래 서 있으면 붓는 건 하체 순환이 더딘 신호입니다. 종아리 근육 기능 회복이 도움이 됩니다.",
        priority: 2,
        matchFn: (c) => c[1],
      },
    ],
  },
};

export const areaOrder: AreaKey[] = ["neck", "shoulder", "back", "pelvis", "knee", "ankle"];

export const exerciseRecs: Record<AreaKey, string[]> = {
  neck: ["턱 당기기 (친 턱)", "가슴 열기 스트레칭", "견갑 모으기"],
  shoulder: ["팔 내회전 스트레칭", "밴드 외회전 운동", "가슴 앞 이완"],
  back: ["360도 복식호흡", "고양이-소 운동", "데드버그"],
  pelvis: ["골반 중립 찾기", "브릿지", "피겨4 스트레칭"],
  knee: ["클램쉘", "쿼드 스트레칭", "슬로우 스쿼트"],
  ankle: ["종아리 스트레칭", "발목 알파벳 돌리기", "한 발 균형 서기"],
};

export const blogKeywords: Record<AreaKey, string[]> = {
  neck: ["거북목", "목", "어깨", "라운드숄더", "자세"],
  shoulder: ["어깨", "회전근개", "라운드숄더", "충돌"],
  back: ["허리", "디스크", "요통", "코어", "심부"],
  pelvis: ["골반", "고관절", "비대칭", "짝다리"],
  knee: ["무릎", "슬개골", "연골", "X자", "O자"],
  ankle: ["발목", "족저근막", "염좌", "발바닥"],
};
