import type { Metadata } from "next";
import CheckQuiz from "./CheckQuiz";

export const metadata: Metadata = {
  title: "내 몸 상태 체크 | 내몸에미소 동탄",
  description: "3가지 질문으로 내 몸에 맞는 프로그램을 찾아보세요.",
};

export default function CheckPage() {
  return <CheckQuiz />;
}
