export type Finding = {
  label: string;
  value: string;
  unit: string;
  n: number;
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

// 핵심 발견 — 방법론 확정 수치만 사용 (2026-07-20 확정)
// 뷰(방향)별 개별 각도값 + 오버헤드스쿼트 세부 안정성: 완전측정 6명(A형)만 집계
//   → 부분측정 4명은 "뷰당 최저점 지표 2개만" 선택 저장되는 구조라 포함 시 편향됨
// 움직임평가 총점(발끝잡기·Apley): 스키마 무관 10명 전원 존재해 전체 합산
export const findings4050: Finding[] = [
  { label: "거북목각도", value: "30.55", unit: "°", n: 12, range: "27.4~34.7°" },
  { label: "라운드숄더각도", value: "45.3", unit: "°", n: 12 },
  { label: "골반전방경사각도", value: "7.02", unit: "°", n: 12, range: "4.6~8.3°" },
  { label: "요추각도", value: "51.3", unit: "°", n: 12 },
  { label: "오버헤드스쿼트 · 무릎안정성", value: "57.3", unit: "점", n: 6, note: "0~100점, 높을수록 안정적" },
  { label: "오버헤드스쿼트 · 어깨안정성", value: "41.33", unit: "점", n: 6, note: "0~100점, 높을수록 안정적" },
  { label: "발끝잡기", value: "64.8", unit: "점", n: 10, note: "0~100점, 높을수록 유연함" },
  { label: "Apley 우측", value: "55.6", unit: "점", n: 10, note: "0~100점, 어깨 가동성 평가" },
];
