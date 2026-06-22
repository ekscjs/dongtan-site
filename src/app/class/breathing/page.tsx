import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "깊은 곳이 풀리는 호흡 · 50분 원데이 클래스 | 내몸에미소 동탄",
  description:
    "늘 어깨가 뭉치고 잠이 얕은 직장인을 위한 50분 호흡 원데이 클래스. 힘으로 푸는 스트레칭이 아니라, 깊은 긴장을 호흡으로 풀어내는 경험. 동탄 내몸에미소.",
  alternates: { canonical: "https://www.bodymiso.com/class/breathing" },
  openGraph: {
    title: "깊은 곳이 풀리는 호흡 · 50분 원데이 클래스",
    description: "힘으로 푸는 게 아니라, 호흡으로 깊은 긴장을 풀어내는 50분. 동탄 내몸에미소.",
    url: "https://www.bodymiso.com/class/breathing",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og/class-breathing.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "깊은 곳이 풀리는 호흡 · 50분 원데이 클래스",
    description: "힘으로 푸는 게 아니라, 호흡으로 깊은 긴장을 풀어내는 50분. 동탄 내몸에미소.",
    images: ["/og/class-breathing.png"],
  },
};

const FOR_YOU = [
  "하루 종일 어깨·목이 뭉쳐 있는 직장인",
  "스트레칭·마사지를 받아도 금방 다시 뻐근한 분",
  "긴장이 안 풀리고, 잠이 얕고 자주 피곤한 분",
  "숨이 늘 얕고 가슴이 답답하게 느껴지는 분",
];

const FLOW = [
  { step: "01", title: "내 호흡 점검", desc: "지금 내 숨이 얼마나 얕은지, 어디가 굳어 있는지 직접 확인합니다.", min: "8분" },
  { step: "02", title: "360도 호흡 깨우기", desc: "배·옆구리·등까지 사방으로 숨을 채우는 호흡을 몸에 익힙니다.", min: "15분" },
  { step: "03", title: "깊은 긴장 풀어내기", desc: "굳은 부위를 힘이 아니라 호흡과 이완으로 천천히 풀어냅니다.", min: "20분" },
  { step: "04", title: "일상으로 가져가기", desc: "사무실·잠들기 전에 혼자 쓸 수 있는 호흡 루틴을 정리해 드립니다.", min: "7분" },
];

const INFO = [
  { k: "시간", v: "50분" },
  { k: "정원", v: "소수 정예 6명" },
  { k: "장소", v: "지성로 134, 5층" },
  { k: "정가", v: "49,000원" },
  { k: "론칭특가", v: "29,000원" },
];

// ⬇️ 수업 날짜. 회차가 끝나면 지우고 다음 날짜로 바꾸세요. (한 번에 한 날짜만 권장)
const SESSIONS = [
  "7월 25일 (토) 오전 11:00",
];

export default function BreathingClassPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FAF5FB]">
        {/* Hero */}
        <section className="px-4 pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block bg-[#7B2D8B] text-white text-xs font-semibold px-3 py-1 rounded-full mb-5">
              7월 25일 (토) 오전 11시 · 선착순 6명
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
              힘으로 푸는 게 아니라,
              <br />
              <span className="text-[#7B2D8B]">호흡</span>으로 깊은 긴장을 풀어냅니다
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              늘 어깨가 뭉치고, 풀어도 금방 다시 굳고, 잠이 얕은 분들을 위한 50분.
              <br className="hidden md:block" />
              원장이 직접 짚어주는, 동탄 내몸에미소의 호흡 원데이 클래스입니다.
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
              이런 분들을 위한 클래스예요
            </h2>
            <div className="space-y-3">
              {FOR_YOU.map((t) => (
                <div key={t} className="flex items-start gap-3 bg-[#FAF5FB] rounded-xl px-5 py-4">
                  <span className="text-[#7B2D8B] font-bold">✓</span>
                  <p className="text-gray-700 text-sm md:text-base">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 50분 구성 */}
        <section className="px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">50분, 이렇게 진행돼요</h2>
            <p className="text-sm text-gray-500 text-center mb-8">배워서 끝나는 게 아니라, 그 자리에서 풀리는 걸 느낍니다</p>
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

        {/* 왜 호흡인가 */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">왜 ‘근막이완 + 호흡’일까요?</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              스트레칭이나 마사지로 잠깐 시원했다가 금방 다시 굳는다면, 표면이 아니라 더 깊은 곳이 긴장해 있는
              경우가 많습니다. 깊은 근육은 힘으로 누른다고 풀리지 않아요.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3">
              이 클래스는 먼저 도구로 굳은 근막을 풀어줍니다. 근막이 풀려야 호흡이 제대로 깊이 들어가거든요.
              이완된 몸에 깊은 호흡을 넣으면, 손이 닿지 않는 안쪽 긴장이 비로소 빠지기 시작합니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              운동을 빡세게 하는 시간이 아니라, 몸을 이완시키고 숨을 깊게 쓰는 법을 익히는 50분입니다.
              원장이 한 사람씩 직접 짚어드립니다.
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
                    i.k === "론칭특가"
                      ? "bg-[#7B2D8B] border-[#7B2D8B]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <p className={`text-xs mb-1 ${i.k === "론칭특가" ? "text-purple-200" : "text-gray-400"}`}>{i.k}</p>
                  <p className={`font-bold ${i.k === "론칭특가" ? "text-white text-lg" : i.k === "정가" ? "text-gray-400 line-through" : i.k === "장소" ? "text-gray-900 text-sm" : "text-gray-900"}`}>{i.v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              * 정원이 작아 신청 순서대로 일정을 안내드립니다.<br />현재는 동탄 센터 현장 수업으로 진행됩니다.
            </p>
          </div>
        </section>

        {/* 신청 */}
        <section id="apply" className="px-4 py-12 bg-white scroll-mt-20">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">신청하기</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              아래에서 참석할 날짜를 골라 신청해 주세요. 정원이 차면 마감됩니다.
            </p>
            <LeadForm
              program="호흡원데이"
              source="class-breathing"
              timeLabel="참석할 수업 날짜"
              timePlaceholder="날짜를 선택하세요"
              timeOptions={SESSIONS}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
