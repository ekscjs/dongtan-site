import type { Metadata } from "next";
import CheckQuiz from "./CheckQuiz";

export const metadata: Metadata = {
  title: "동탄 체형·통증 자가진단 + 7일 교정 루틴 | 내몸에미소",
  description:
    "1분 자가진단으로 내 몸 유형(거북목·골반·허리·전신)을 확인하고, 유형별 7일 교정 루틴을 매일 따라 해보세요. 동탄 체형교정·재활 내몸에미소.",
  alternates: { canonical: "https://www.bodymiso.com/check" },
};

export default function CheckPage() {
  return <CheckQuiz />;
}
