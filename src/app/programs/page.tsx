import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로그램 안내 | 내몸에미소 동탄",
  description: "기능개선, 재활, 체형교정 전문 프로그램. 1회 체험 3만원부터 시작하세요.",
};

const programs = [
  {
    id: "pain",
    title: "통증 완화 운동",
    emoji: "💪",
    short: "일상의 불편함을 회복합니다",
    desc: "팔이 잘 안 올라가거나 무릎이 뻐근한 것도 원인이 있습니다. 증상이 아닌 움직임의 원인을 찾아 해결합니다.",
    targets: [
      "팔이 머리 위로 잘 안 올라가는 분",
      "걸을 때 한쪽 다리가 이상한 분",
      "앉았다 일어날 때 무릎이 아픈 분",
    ],
  },
  {
    id: "rehab",
    title: "재활",
    emoji: "🔄",
    short: "병원과 일상 사이를 채웁니다",
    desc: "수술 후 또는 부상 후, 치료는 끝났는데 몸이 예전 같지 않은 분을 위한 프로그램입니다.",
    targets: [
      "수술 후 회복 중인 분",
      "디스크 치료 후 관리가 필요한 분",
      "스포츠 부상 후 복귀를 준비 중인 분",
    ],
  },
  {
    id: "posture",
    title: "체형교정",
    emoji: "🧍",
    short: "자세 문제를 근본 원인부터 잡습니다",
    desc: "굽은 등, 거북목, 골반 틀어짐. 자세 문제에는 반드시 원인이 있습니다.",
    targets: [
      "오래 앉아 있으면 허리가 아픈 분",
      "목·어깨가 항상 뭉쳐 있는 분",
      "한쪽 어깨가 올라가 있는 분",
    ],
  },
];

const pricing = [
  { name: "무료 상담", price: "0원", desc: "몸 상태 파악 및 방향 상담" },
  { name: "1회 체험 1:1 운동", price: "30,000원", desc: "직접 경험해보고 결정하세요" },
  { name: "8주 내몸관리 프로그램", price: "480,000원", desc: "원인부터 해결하는 8주 집중 케어" },
  { name: "개인 맞춤형 수업 10회권", price: "600,000원", desc: "장기적으로 내 몸을 관리하고 싶은 분" },
];

export default function ProgramsPage() {
  return (
    <>
      <Header />
      <main>

        {/* 히어로 */}
        <section className="bg-[#FAF5FB] py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">프로그램 안내</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              문제의 원인을 먼저 파악하고,<br />
              <span className="text-[#7B2D8B]">그에 맞는 방법으로 해결합니다</span>
            </h1>
          </div>
        </section>

        {/* 프로그램 빠른 이동 */}
        <section className="py-10 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
            {programs.map((p) => (
              <a key={p.id} href={`#${p.id}`}
                className="flex-1 text-center border border-[#7B2D8B] text-[#7B2D8B] font-semibold py-3 px-4 rounded-full text-sm hover:bg-[#7B2D8B] hover:text-white transition-colors">
                {p.emoji} {p.title}
              </a>
            ))}
          </div>
        </section>

        {/* 각 프로그램 섹션 */}
        {programs.map((p, i) => (
          <section key={p.id} id={p.id}
            className={`py-20 px-4 ${i % 2 === 1 ? "bg-[#FAF5FB]" : ""}`}>
            <div className="max-w-3xl mx-auto">
              <p className="text-4xl mb-4">{p.emoji}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{p.title}</h2>
              <p className="text-[#7B2D8B] font-semibold mb-4">{p.short}</p>
              <p className="text-gray-600 mb-8 leading-relaxed">{p.desc}</p>
              <div className="space-y-3">
                {p.targets.map((t, j) => (
                  <div key={j} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100">
                    <span className="text-[#7B2D8B] font-bold">✓</span>
                    <p className="text-gray-700 text-sm md:text-base">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* 가격 */}
        <section className="bg-[#FAF5FB] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">가격 안내</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {pricing.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-sm text-[#7B2D8B] font-semibold mb-1">{item.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{item.price}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#7B2D8B] py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">어떤 프로그램이 맞는지 모르겠다면</h2>
            <p className="text-purple-200 mb-8 text-sm md:text-base">무료 상담으로 먼저 파악합니다.</p>
            <a href="http://pf.kakao.com/_XGxbMG/chat" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-white text-[#7B2D8B] font-bold px-10 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
              카카오로 상담하기
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
