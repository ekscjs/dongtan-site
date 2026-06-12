import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import KakaoButton from "@/components/KakaoButton";

export const metadata: Metadata = {
  title: "후기 | 내몸에미소 동탄",
  description: "내몸에미소 회원 후기 및 비포애프터 사례를 확인하세요.",
};

const reviews = [
  {
    name: "40대 직장인",
    issue: "어깨 통증",
    content: "운동하다 다친 곳이 계속 재발해서 정형외과와 운동을 번갈아 다니다 더 나빠졌어요. 팔이 올라가지 않아 이곳에 왔는데, 처음부터 가동범위를 꼼꼼히 확인하고 상태에 맞게 진행해줘서 신기했어요. 20회 하고 너무 좋아져서 재등록해서 다니고 있어요.",
  },
  {
    name: "50대 여성",
    issue: "부상 예방·체력",
    content: "운동 전에 몸을 풀어주고 시작하는데 다치지 않도록 신경 써주시는 게 느껴져요. 급하게 하지 않고 천천히 관리해주셔서 운동을 겁내는 분들께 특히 추천드려요.",
  },
  {
    name: "30대 주부",
    issue: "허리 디스크",
    content: "필라테스, 요가, PT 다 해봤는데 여기가 진짜 달라요. 허리디스크로 걷기도 힘든 상태로 왔는데, 이제 덤벨 들고 워킹런지도 가능하게 만들어주셨어요. 몸에 대해 제대로 공부한 분께 받는 느낌이에요.",
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
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
                <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start">
                  {r.issue}
                </span>
                <p className="text-gray-700 leading-relaxed mb-6 flex-1">"{r.content}"</p>
                <p className="text-sm text-gray-400">{r.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <KakaoButton className="bg-[#7B2D8B] text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-[#9B4DAB] transition-colors inline-block">
              카카오로 상담하기
            </KakaoButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
