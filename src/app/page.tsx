import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const symptoms = [
  { icon: "🦴", text: "허리가 자꾸 찌릿하고 뻐근한 분" },
  { icon: "🦵", text: "무릎이 시려서 계단이 무서운 분" },
  { icon: "💪", text: "팔이 잘 안 올라가거나 어깨가 굳은 분" },
  { icon: "🧍", text: "자세가 나쁜 건 아는데 어떻게 고쳐야 할지 모르는 분" },
  { icon: "🏥", text: "병원 치료는 끝났는데 몸이 예전 같지 않은 분" },
  { icon: "👴", text: "부모님 체력과 거동이 걱정되시는 분" },
];

const programs = [
  {
    title: "기능개선",
    desc: "일상에서 불편한 동작을 회복합니다. 팔이 잘 안 올라가거나 무릎이 뻐근한 것도 원인이 있습니다.",
    color: "border-[#7B2D8B]",
  },
  {
    title: "재활",
    desc: "수술 후 또는 부상 후 몸을 회복하고 싶을 때. 병원과 일상 사이, 그 중간을 채워드립니다.",
    color: "border-[#9B4DAB]",
  },
  {
    title: "체형교정",
    desc: "굽은 등, 거북목, 골반 틀어짐. 자세 문제를 근본 원인부터 잡아드립니다.",
    color: "border-[#F4A261]",
  },
];

const steps = [
  { step: "01", title: "무료 상담", desc: "어디가 불편한지 먼저 말씀해 주세요. 정확한 병명이 없어도 괜찮습니다." },
  { step: "02", title: "1회 체험", desc: "직접 움직임을 확인하고 문제 원인을 파악합니다." },
  { step: "03", title: "맞춤 프로그램", desc: "원인에 맞는 운동 방법으로 실질적인 변화를 만들어 드립니다." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-[#FAF5FB] py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">동탄 기능개선 · 재활 · 체형교정 전문</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              몸이 불편한데<br />
              <span className="text-[#7B2D8B]">어디 가야 할지 모르겠다면</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              정확한 병명이 없어도 괜찮습니다.<br />
              허리, 무릎, 어깨 — 불편함을 느끼고 있다면 원인부터 함께 찾아드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="http://pf.kakao.com/_XGxbMG/chat" target="_blank" rel="noopener noreferrer"
                className="bg-[#7B2D8B] text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-[#9B4DAB] transition-colors">
                카카오로 무료 상담 신청
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">경기도 화성시 동탄 지성로 134 5층</p>
          </div>
        </section>

        {/* 이런 분들 */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">이런 분들이 오십니다</h2>
            <p className="text-center text-gray-500 mb-12">아주 아프지 않아도, 불편함을 느끼고 있다면 충분합니다</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {symptoms.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
                  <span className="text-3xl">{s.icon}</span>
                  <p className="text-gray-700 font-medium leading-snug">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 프로그램 */}
        <section className="bg-[#FAF5FB] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">전문 프로그램</h2>
            <p className="text-center text-gray-500 mb-12">문제의 원인을 먼저 파악하고, 그에 맞는 방법으로 해결합니다</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map((p, i) => (
                <div key={i} className={`bg-white rounded-2xl p-8 border-t-4 ${p.color} shadow-sm`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/programs" className="text-[#7B2D8B] font-semibold hover:underline">
                자세한 프로그램 및 가격 보기 →
              </Link>
            </div>
          </div>
        </section>

        {/* 진행 방식 */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">이렇게 시작합니다</h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-[#7B2D8B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#7B2D8B] py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">어디가 불편하신지 말씀해 주세요</h2>
            <p className="text-green-100 mb-8 text-lg">무료 상담으로 시작합니다. 부담 없이 연락 주세요.</p>
            <a href="http://pf.kakao.com/_XGxbMG/chat" target="_blank" rel="noopener noreferrer"
              className="bg-white text-[#7B2D8B] font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors inline-block">
              문의하기
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
