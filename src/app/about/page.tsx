import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "센터 소개 | 내몸에미소 동탄",
  description: "내몸에미소는 기능개선, 재활, 체형교정을 전문으로 하는 동탄 운동센터입니다.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">센터 소개</h1>
          <div className="prose prose-lg text-gray-600 space-y-6">
            <p className="text-xl leading-relaxed">
              내몸에미소는 <strong className="text-[#7B2D8B]">"해결사"</strong>입니다.<br />
              몸에 문제가 생겼을 때 어디 가야 할지 막막한 분들을 위한 곳입니다.
            </p>
            <p className="leading-relaxed">
              병원은 치료를 받는 곳이고, 일반 헬스장은 운동을 하는 곳입니다.
              그 사이 어딘가에 있는 분들 — 아직 병원에 갈 정도는 아닌데 몸이 불편하거나,
              치료는 끝났는데 예전처럼 움직이기 어려운 분들이 내몸에미소를 찾습니다.
            </p>
            <p className="leading-relaxed">
              정확한 병명이 없어도 괜찮습니다. 몸의 불편함을 느끼고 있다면,
              원인부터 함께 찾아드립니다.
            </p>
          </div>

          <div className="mt-16 bg-[#FAF5FB] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">오시는 길</h2>
            <p className="text-gray-600">경기도 화성시 동탄 지성로 134 5층</p>
            <p className="text-gray-500 text-sm mt-2">카카오맵, 네이버 지도에서 "내몸에미소"로 검색하세요.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
