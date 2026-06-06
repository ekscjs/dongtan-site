import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "후기 | 내몸에미소 동탄",
  description: "내몸에미소 회원 후기 및 비포애프터 사례를 확인하세요.",
};

const reviews = [
  {
    name: "40대 직장인",
    issue: "허리 통증",
    content: "오래 앉아 있으면 허리가 너무 아팠는데, 원인이 골반에 있다는 걸 처음 알았어요. 8주 하고 나서 확실히 달라졌습니다.",
  },
  {
    name: "60대 시니어",
    issue: "무릎 통증",
    content: "계단 오르기가 너무 힘들었는데 이제 훨씬 편해졌어요. 선생님이 제 속도에 맞춰 주셔서 부담 없이 다닐 수 있었어요.",
  },
  {
    name: "30대 직장인",
    issue: "거북목·어깨",
    content: "목이 항상 뭉쳐있고 어깨도 비대칭이었는데 체형교정 받고 나서 자세가 달라졌다는 말을 주변에서 먼저 해줬어요.",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">회원 후기</h1>
          <p className="text-gray-500 text-center mb-16">실제 회원분들의 변화입니다</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {r.issue}
                </span>
                <p className="text-gray-700 leading-relaxed mb-6">"{r.content}"</p>
                <p className="text-sm text-gray-400">{r.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="https://pf.kakao.com/" target="_blank" rel="noopener noreferrer"
              className="bg-[#7B2D8B] text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-[#9B4DAB] transition-colors inline-block">
              나도 상담 신청하기
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
