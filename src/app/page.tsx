import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const symptoms = [
  { icon: "🔍", text: '허리·무릎·어깨가 아픈데 검사하면 "이상 없다"는 분' },
  { icon: "🔁", text: "치료받으면 잠깐 낫다가 다시 재발하는 분" },
  { icon: "🏃", text: '의사에게 "운동 하세요" 들었는데 어떤 운동인지 모르는 분' },
  { icon: "🧍", text: "거북목·굽은 등·골반 틀어짐이 신경 쓰이는 분" },
  { icon: "👴", text: "나이 들면서 몸이 예전 같지 않다고 느끼는 분" },
  { icon: "💡", text: "운동을 시작하고 싶은데 내 몸에 맞는 방법을 모르는 분" },
];

const programs = [
  {
    title: "통증 완화 운동",
    desc: "팔이 잘 안 올라가거나 무릎이 뻐근한 것도 원인이 있습니다. 일상의 불편함을 회복합니다.",
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
  { step: "01", title: "무료 상담", desc: "카카오톡으로 편하게 말씀해 주세요. 바로 연결됩니다." },
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
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              여기저기 다녀봤는데,<br />
              <span className="text-[#7B2D8B]">왜 계속 아프고 불편할까요?</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed">
              허리, 무릎, 어깨 — 통증의 원인은 대부분 움직임에 있습니다.<br className="hidden sm:block" />
              내몸에미소가 원인부터 찾아드립니다.
            </p>
            <a
              href="http://pf.kakao.com/_XGxbMG/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#7B2D8B] text-white font-bold px-8 py-4 rounded-full text-base md:text-lg hover:bg-[#9B4DAB] transition-colors"
            >
              카카오로 무료 상담 신청
            </a>
            <p className="text-sm text-gray-400 mt-4">경기도 화성시 동탄 지성로 134 5층</p>
          </div>
        </section>

        {/* 이런 분들 */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">이런 분들이 찾아오십니다</h2>
            <p className="text-center text-gray-500 mb-12 text-sm md:text-base">아주 아프지 않아도, 불편함을 느끼고 있다면 충분합니다</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {symptoms.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 flex items-start gap-4">
                  <span className="text-2xl shrink-0">{s.icon}</span>
                  <p className="text-gray-700 font-medium leading-snug text-sm md:text-base">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 프로그램 */}
        <section className="bg-[#FAF5FB] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">전문 프로그램</h2>
            <p className="text-center text-gray-500 mb-12 text-sm md:text-base">문제의 원인을 먼저 파악하고, 그에 맞는 방법으로 해결합니다</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map((p, i) => (
                <div key={i} className={`bg-white rounded-2xl p-8 border-t-4 ${p.color} shadow-sm`}>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/programs" className="text-[#7B2D8B] font-semibold hover:underline text-sm md:text-base">
                자세한 프로그램 및 가격 보기 →
              </Link>
            </div>
          </div>
        </section>

        {/* 진행 방식 */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">이렇게 시작합니다</h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="w-11 h-11 rounded-full bg-[#7B2D8B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#7B2D8B] py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">몸이 달라지는 걸 직접 느껴보세요</h2>
            <p className="text-purple-200 mb-8 text-base md:text-lg">무료 상담으로 시작합니다.</p>
            <a
              href="http://pf.kakao.com/_XGxbMG/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#7B2D8B] font-bold px-10 py-4 rounded-full text-base md:text-lg hover:bg-gray-100 transition-colors"
            >
              지금 문의하기
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
