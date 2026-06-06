import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로그램 안내 | 내몸에미소 동탄",
  description: "기능개선, 재활, 체형교정 전문 프로그램. 1회 체험 3만원부터 시작하세요.",
};

const programs = [
  {
    title: "기능개선",
    color: "bg-[#7B2D8B]",
    desc: "팔이 잘 안 올라가거나, 무릎이 뻐근하거나, 일상 동작이 불편한 분을 위한 프로그램입니다. 움직임의 원인을 파악하고 기능을 회복합니다.",
    targets: ["팔이 머리 위로 잘 안 올라가는 분", "걸을 때 한쪽 다리가 이상한 분", "앉았다 일어날 때 무릎이 아픈 분"],
  },
  {
    title: "재활",
    color: "bg-[#9B4DAB]",
    desc: "수술 후, 부상 후, 또는 병원 치료가 끝났는데 몸이 예전 같지 않은 분을 위한 프로그램입니다. 병원과 일상 사이를 채워드립니다.",
    targets: ["수술 후 회복 중인 분", "디스크 치료 후 관리가 필요한 분", "스포츠 부상 후 복귀를 준비 중인 분"],
  },
  {
    title: "체형교정",
    color: "bg-[#F4A261]",
    desc: "굽은 등, 거북목, 골반 틀어짐, 어깨 비대칭. 자세 문제는 근본 원인이 있습니다. 원인부터 잡아드립니다.",
    targets: ["오래 앉아 있으면 허리가 아픈 분", "목, 어깨가 항상 뭉쳐 있는 분", "한쪽 어깨가 올라가 있는 분"],
  },
];

const pricing = [
  { name: "무료 상담", price: "0원", desc: "몸 상태 파악 및 방향 상담" },
  { name: "1회 체험 1:1 운동", price: "30,000원", desc: "직접 경험해보고 결정하세요" },
  { name: "3회 집중 케어", price: "90,000원", desc: "체험 후 본격 시작을 위한 입문 패키지" },
  { name: "8주 내몸관리 프로그램", price: "480,000원", desc: "원인부터 해결하는 8주 집중 케어" },
  { name: "개인 맞춤형 수업 10회권", price: "600,000원", desc: "장기적으로 내 몸을 관리하고 싶은 분" },
];

export default function ProgramsPage() {
  return (
    <>
      <Header />
      <main className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">프로그램 안내</h1>
          <p className="text-gray-500 text-center mb-16">문제의 원인을 먼저 파악하고, 그에 맞는 방법으로 해결합니다</p>

          <div className="space-y-8 mb-20">
            {programs.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`${p.color} px-8 py-5`}>
                  <h2 className="text-white text-2xl font-bold">{p.title}</h2>
                </div>
                <div className="px-8 py-6 flex flex-col md:flex-row gap-6">
                  <p className="text-gray-600 leading-relaxed flex-1">{p.desc}</p>
                  <ul className="space-y-2 flex-1">
                    {p.targets.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-[#7B2D8B] mt-0.5">✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">가격 안내</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {pricing.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-sm text-[#7B2D8B] font-semibold mb-1">{item.name}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{item.price}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="https://pf.kakao.com/" target="_blank" rel="noopener noreferrer"
              className="bg-[#7B2D8B] text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-[#9B4DAB] transition-colors inline-block">
              카카오로 무료 상담 신청
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
