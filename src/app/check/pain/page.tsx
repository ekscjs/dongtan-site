import type { Metadata } from "next";
import PainMap from "./PainMap";

export const metadata: Metadata = {
  title: "통증지도 — 부위별 통증 셀프체크 | 내몸에미소 동탄",
  description:
    "목·어깨·허리·골반·무릎·발목 중 아픈 부위를 선택하면 체크리스트와 원인 분석을 바로 확인할 수 있습니다. 동탄 내몸에미소 무료 통증 셀프체크.",
  keywords: [
    "통증지도",
    "허리 통증 셀프체크",
    "무릎 통증 체크리스트",
    "어깨 통증 셀프체크",
    "목 통증 셀프체크",
    "골반 통증",
    "동탄 재활",
    "동탄 체형교정",
  ],
  alternates: { canonical: "https://www.bodymiso.com/check/pain" },
  openGraph: {
    title: "통증지도 — 부위별 통증 셀프체크 | 내몸에미소",
    description:
      "아픈 부위를 클릭하면 체크리스트와 원인 분석을 바로 확인. 동탄 내몸에미소 무료 서비스.",
    url: "https://www.bodymiso.com/check/pain",
    type: "website",
    locale: "ko_KR",
  },
};

export default function PainPage() {
  return <PainMap />;
}
