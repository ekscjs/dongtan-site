import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "바디 리셋 세션 · 2시간 1:1 | 내몸에미소 동탄",
  description:
    "병원, 필라테스, PT 다 해봤는데 불편함이 그대로인 분들을 위한 2시간 1:1 세션. 쓰여야 할 근육이 왜 잠들어 있는지, 움직임으로 함께 찾아봅니다. 동탄 내몸에미소.",
  alternates: { canonical: "https://www.bodymiso.com/class/breathing" },
  openGraph: {
    title: "바디 리셋 세션 · 2시간 1:1 | 내몸에미소 동탄",
    description: "병원, 필라테스, PT 다 해봤는데 불편함이 그대로인 분들을 위한 2시간 1:1 세션.",
    url: "https://www.bodymiso.com/class/breathing",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og/class-breathing.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "바디 리셋 세션 · 2시간 1:1 | 내몸에미소 동탄",
    description: "병원, 필라테스, PT 다 해봤는데 불편함이 그대로인 분들을 위한 2시간 1:1 세션.",
    images: ["/og/class-breathing.png"],
  },
};

const FOR_YOU = [
  "여러 곳 다녀봤는데 불편함이 그대로인 분",
  "잠깐 나아졌다가 다시 돌아오는 게 반복되는 분",
  "특정 동작이 잘 안 되는 이유를 모르는 분",
  "그냥 이렇게 살아야 하나 싶었던 분",
];

const FLOW = [
  {
    step: "01",
    title: "움직임 살펴보기",
    desc: "지금 몸이 어떻게 움직이는지 함께 확인합니다. 어디가 제대로 쓰이지 않고 있는지 봅니다.",
    min: "30분",
  },
  {
    step: "02",
    title: "호흡·이완",
    desc: "굳어 있는 곳을 힘이 아닌 호흡과 이완으로 풀어냅니다.",
    min: "30분",
  },
  {
    step: "03",
    title: "근육 깨우기",
    desc: "제대로 쓰이지 않던 근육을 움직임을 통해 활성화합니다.",
    min: "40분",
  },
  {
    step: "04",
    title: "루틴 정리",
    desc: "집에서 혼자 이어갈 수 있는 움직임 루틴을 정리해드립니다.",
    min: "20분",
  },
];

const INFO = [
  { k: "시간", v: "2시간" },
  { k: "형태", v: "1:1" },
  { k: "장소", v: "지성로 134, 5층" },
  { k: "정가", v: "300,000원" },
  { k: "특가", v: "250,000원" },
];

export default function BodyResetSessionPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FAF5FB]">
        {/* Hero */}
        <section className="px-4 pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block bg-[#7B2D8B] text-white text-xs font-semibold px-3 py-1 rounded-full mb-5">
              1:1 · 2시간 · 예약제
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
              운동보다
              <br />
              <span className="text-[#7B2D8B]">먼저 해야 할 것</span>이 있습니다
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              쓰여야 할 근육이 잠들어 있으면, 열심히 해도 다른 곳이 대신 버팁니다.
              <br className="hidden md:block" />
              그 근육을 먼저 깨우는 2시간입니다.
            </p>
            <a
              href="#apply"
              className="inline-block bg-[#7B2D8B] text-white font-bold py-4 px-10 rounded-full hover:bg-[#6a2578] transition-colors"
            >
              신청하기 →
            </a>
          </div>
        </section>

        {/* 이런 분들 */}
        <section className="px-4 py-10 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
              이런 분들과 함께합니다
            </h2>
            <div className="space-y-3">
              {FOR_YOU.map((t) => (
                <div key={t} className="flex items-start gap-3 bg-[#FAF5FB] rounded-xl px-5 py-4">
                  <CheckIcon className="text-[#7B2D8B] shrink-0 mt-0.5" size={16} />
                  <p className="text-gray-700 text-sm md:text-base">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2시간 구성 */}
        <section className="px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">
              2시간, 이렇게 진행돼요
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              원장이 처음부터 끝까지 직접 함께합니다
            </p>
            <div className="space-y-4">
              {FLOW.map((f) => (
                <div key={f.step} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                  <div className="text-[#9B4DAB] font-bold text-lg shrink-0 w-8">{f.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{f.title}</p>
                      <span className="text-xs text-gray-400">{f.min}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 설명 */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              왜 열심히 해도 그대로일까요
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              쓰여야 할 근육이 잠들어 있으면, 열심히 운동해도 다른 곳이 대신 버팁니다.
              그 상태에서 계속 운동하면 버티던 곳이 지쳐 불편함이 생깁니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              호흡과 이완, 움직임으로 잠든 근육을 깨우는 2시간입니다.
              원장이 처음부터 끝까지 직접 함께합니다.
            </p>
          </div>
        </section>

        {/* 안내 */}
        <section className="px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-3">
              {INFO.map((i) => (
                <div
                  key={i.k}
                  className={`rounded-2xl border p-5 text-center ${
                    i.k === "특가"
                      ? "bg-[#7B2D8B] border-[#7B2D8B]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <p className={`text-xs mb-1 ${i.k === "특가" ? "text-purple-200" : "text-gray-400"}`}>{i.k}</p>
                  <p className={`font-bold ${i.k === "특가" ? "text-white text-lg" : i.k === "정가" ? "text-gray-400 line-through" : i.k === "장소" ? "text-gray-900 text-sm" : "text-gray-900"}`}>{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 신청 */}
        <section id="apply" className="px-4 py-12 bg-white scroll-mt-20">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">신청하기</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              신청 후 원장이 직접 연락드려 일정을 조율합니다
            </p>
            <LeadForm
              program="바디리셋세션"
              source="class-breathing"
              timeLabel="희망 요일·시간대"
              timePlaceholder="선택 안 함"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
