import type { Metadata } from "next";
import AskConcierge from "./AskConcierge";

export const metadata: Metadata = {
  title: "미소AI에게 물어보기 — 증상 안내 | 내몸에미소 동탄",
  description: "증상을 그대로 말하면 동탄에서 실제 관리한 회원 사례로 쓴 콘텐츠 중에서 관련 칼럼·셀프체크·운동·프로그램을 찾아드립니다. 내몸에미소 무료 서비스.",
  alternates: { canonical: "https://www.bodymiso.com/ask" },
  openGraph: {
    title: "미소AI에게 물어보기 — 증상 안내 | 내몸에미소",
    description: "증상을 그대로 말하면 동탄 실제 관리 사례 기반 콘텐츠 중에서 관련 칼럼·셀프체크·운동·프로그램을 찾아드립니다.",
    url: "https://www.bodymiso.com/ask",
    type: "website",
    locale: "ko_KR",
  },
};

export default function AskPage() {
  return <AskConcierge />;
}
