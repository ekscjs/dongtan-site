export type Finding = {
  label: string;
  value: string;
  unit: string;
  n: number;
  max: number; // 막대 기준폭 — 각도항목 0~60°, 점수항목 0~100점
  range?: string;
  note?: string;
};

export type ReportMeta = {
  slug: string;
  title: string;
  summary: string;
  sampleSize: number;
  collectingSince: string; // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
  nextUpdate: string; // 사람이 읽는 텍스트
};

export const report4050: ReportMeta = {
  slug: "4050-women",
  title: "동탄 4050 여성 체형 데이터 리포트",
  summary: "바디닷 3D 체형측정으로 쌓은 40~59세 여성 회원 관찰 기록",
  sampleSize: 10,
  collectingSince: "2026-06-19",
  lastUpdated: "2026-07-20",
  nextUpdate: "2026년 12월",
};

// 움직임평가 점수 — 스키마 무관 10명(발끝잡기·Apley) 또는 완전측정 6명(오버헤드스쿼트 세부) 기준
export const movementFindings4050: Finding[] = [
  { label: "오버헤드스쿼트 · 무릎안정성", value: "57.3", unit: "점", n: 6, max: 100, note: "0~100점, 높을수록 안정적" },
  { label: "오버헤드스쿼트 · 어깨안정성", value: "41.33", unit: "점", n: 6, max: 100, note: "0~100점, 높을수록 안정적" },
  { label: "발끝잡기", value: "64.8", unit: "점", n: 10, max: 100, note: "0~100점, 높을수록 유연함" },
  { label: "Apley 우측", value: "55.6", unit: "점", n: 10, max: 100, note: "0~100점, 어깨 가동성 평가" },
];

export type AngleScore = {
  label: string;
  score: number; // 바디닷 자체 0~100 환산 점수, 좌우측면 합산 평균
  n: number; // 좌우측면 합산 표본수
  angleAvg: string; // 원본 각도(도) 평균값 — 보조 텍스트
  distribution: { good: number; fair: number; caution: number }; // 회원별(좌우평균) 80+/50~79/50미만 인원수, 합계 6명
};

// 각도 항목 score — 완전측정 6명(A형) 기준, 출처: naemiso-brand/4050-score-analysis-2026-07-20.json
// score 오름차순으로 미리 정렬 — 낮을수록 더 흔하게 관찰된 문제(Top3는 앞 3개를 그대로 사용)
export const angleScores4050: AngleScore[] = [
  { label: "라운드숄더각도", score: 52.75, n: 12, angleAvg: "45.3°", distribution: { good: 0, fair: 4, caution: 2 } },
  { label: "거북목각도", score: 58.5, n: 12, angleAvg: "30.55°", distribution: { good: 0, fair: 6, caution: 0 } },
  { label: "골반전방경사각도", score: 69.58, n: 12, angleAvg: "7.02°", distribution: { good: 0, fair: 6, caution: 0 } },
  { label: "요추각도", score: 73.5, n: 12, angleAvg: "51.3°", distribution: { good: 1, fair: 5, caution: 0 } },
  { label: "흉추각도", score: 80.67, n: 12, angleAvg: "39°", distribution: { good: 4, fair: 2, caution: 0 } },
];
