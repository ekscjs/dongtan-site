import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "바디 리셋 세션 · 4주 1:1 프로그램 | 내몸에미소 동탄",
  description:
    "프로 선수, 현업 트레이너, 원인 불명 통증에 시달리는 분들을 위한 4주 1:1 프로그램. 긴장된 곳은 풀고 약화된 곳은 강화해 몸을 원래 자리로 되돌립니다. 한 번 배우면 평생 쓰는 기술. 동탄 내몸에미소.",
  alternates: { canonical: "https://www.bodymiso.com/class/breathing" },
  openGraph: {
    title: "바디 리셋 세션 · 4주 1:1 프로그램 | 내몸에미소 동탄",
    description: "프로 선수, 현업 트레이너, 원인 불명 통증에 시달리는 분들을 위한 4주 1:1 프로그램. 몸을 원래 자리로 되돌리는 기술을 배웁니다.",
    url: "https://www.bodymiso.com/class/breathing",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og/class-breathing.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "바디 리셋 세션 · 4주 1:1 프로그램 | 내몸에미소 동탄",
    description: "프로 선수, 현업 트레이너, 원인 불명 통증에 시달리는 분들을 위한 4주 1:1 프로그램. 몸을 원래 자리로 되돌리는 기술을 배웁니다.",
    images: ["/og/class-breathing.png"],
  },
};

const FOR_YOU = [
  "병원에 가도 원인을 알 수 없는 통증에 시달리는 분",
  "이것저것 다 해봐도 늘 그대로이신 분",
  "현업에서 운동을 가르치는 트레이너·강사",
  "프로 선수, 혹은 운동선수를 준비 중인 분",
];

const FLOW = [
  {
    step: "1주차",
    title: "평가 + 이완",
    desc: "지금 체형과 원래 있어야 할 자리(제로 포지션)의 차이를 확인하고, 긴장된 곳을 먼저 풀어냅니다. 집에서 할 수 있는 기초 강화운동도 함께 전달합니다.",
    min: "1시간 30분",
  },
  {
    step: "2주차",
    title: "강화",
    desc: "약화된 부위에 본격적으로 근력을 붙입니다. 몸을 바른 자리로 되돌려도 버텨줄 근력이 없으면 금방 원래대로 돌아가기 때문입니다. 집에서 반복할 강화운동 세트를 전달합니다.",
    min: "1시간 30분",
  },
  {
    step: "3주차",
    title: "각성 + 통합",
    desc: "전신 근육을 깨우고, 이완과 강화를 하나의 움직임으로 통합합니다.",
    min: "1시간 30분",
  },
  {
    step: "4주차",
    title: "정리 + 셀프관리 전환",
    desc: "4주간 배운 것을 하나의 유지 루틴으로 정리합니다. 맞춤 PDF와 함께, 이후에도 카카오톡으로 운동 사진을 보내면 피드백을 받을 수 있습니다.",
    min: "1시간 30분",
  },
];

const INFO = [
  { k: "시간", v: "1시간 30분" },
  { k: "형태", v: "1:1" },
  { k: "기간", v: "4주 · 주 1회" },
  { k: "장소", v: "지성로 134, 5층" },
  { k: "가격", v: "문의" },
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
              1:1 · 4주 과정 · 문의
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-snug mb-4">
              운동보다
              <br />
              <span className="text-[#7B2D8B]">먼저 해야 할 것</span>이 있습니다
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              긴장된 곳은 풀고, 약화된 곳은 강화해서 몸을 원래 있던 자리로 되돌립니다.
              <br className="hidden md:block" />
              한 번 배우면 평생 가져가는 4주 프로그램입니다.
            </p>
            <a
              href="#apply"
              className="inline-block bg-[#7B2D8B] text-white font-bold py-4 px-10 rounded-full hover:bg-[#6a2578] transition-colors"
            >
              문의하기 →
            </a>
          </div>
        </section>

        {/* 이런 분들 */}
        <section className="px-4 py-10 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2">
              이런 분들을 위한 프로그램입니다
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-500 text-center mb-8">
              가볍게 한번 해보려는 분보다는, 지금 상태가 정말 답답하신 분들을 위한 과정입니다.
            </p>
            <div className="space-y-3">
              {FOR_YOU.map((t) => (
                <div key={t} className="flex items-start gap-3 bg-[#FAF5FB] rounded-xl px-5 py-4">
                  <CheckIcon className="text-[#7B2D8B] shrink-0 mt-0.5" size={16} />
                  <p className="text-gray-700 text-sm md:text-base lg:text-lg">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4주 구성 */}
        <section className="px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2">
              4주, 이렇게 진행돼요
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-500 text-center mb-8">
              원장이 매주 1회, 1시간 30분씩 직접 함께합니다
            </p>
            <div className="space-y-4">
              {FLOW.map((f) => (
                <div key={f.step} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                  <div className="text-[#9B4DAB] font-bold text-lg shrink-0 w-16 whitespace-nowrap">{f.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{f.title}</p>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{f.min}</span>
                    </div>
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 설명 */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              왜 4주가 필요할까요
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              긴장된 곳을 풀고, 약화된 곳을 강화하고, 전신 근육을 깨우는 것 — 이 세 가지가 함께 이뤄져야 몸이 원래 있어야 할 자리로 돌아갑니다.
              되돌려놓기만 해서는 안 됩니다. 그 자리를 버텨줄 근력이 없으면 금방 다시 틀어지기 때문입니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              그래서 4주 동안 교정과 강화운동을 함께 진행하고, 프로그램이 끝난 뒤에는 스스로 관리할 수 있도록 합니다.
              원장이 4주 내내 직접 함께합니다.
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
                    i.k === "가격"
                      ? "bg-[#7B2D8B] border-[#7B2D8B]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <p className={`text-xs mb-1 ${i.k === "가격" ? "text-purple-200" : "text-gray-400"}`}>{i.k}</p>
                  <p className={`font-bold ${i.k === "가격" ? "text-white text-lg" : i.k === "장소" ? "text-gray-900 text-sm" : "text-gray-900"}`}>{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section id="apply" className="px-4 py-12 bg-white scroll-mt-20">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2">문의하기</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-500 text-center mb-6">
              문의 남기시면 원장이 직접 연락드려 프로그램과 진행 방식을 안내합니다
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
