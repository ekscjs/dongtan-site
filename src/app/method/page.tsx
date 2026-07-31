import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import { BarChartIcon } from "@/components/Icons";
import { report4050 } from "@/app/research-notes/data";

const SITE = "https://www.bodymiso.com";
const TITLE = "미소 운동법 — 내몸에미소가 몸을 보는 순서 | 동탄";
const DESC = "아픈 곳부터 만지지 않는 이유, 같은 점수가 정반대 처방으로 갈리는 지점까지.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE}/method` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE}/method`,
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "내몸에미소 동탄 기능성 운동센터" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/og-image.png"],
  },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "미소 운동법 — 내몸에미소가 몸을 보는 순서",
  description: DESC,
  url: `${SITE}/method`,
  mainEntityOfPage: `${SITE}/method`,
  about: { "@type": "Thing", name: "미소 운동법" },
  author: { "@type": "Person", name: "박미소", jobTitle: "원장", url: `${SITE}/about` },
  publisher: {
    "@type": "Organization",
    name: "내몸에미소",
    logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
  },
};

// ⑨ 부위별 기록 — 감별 카드 확정 전까지는 빈 배열. 채워지면 아래 렌더 로직 그대로 동작한다.
type MovementRegion = "목·어깨" | "허리·골반" | "무릎·발목";
type MovementCard = {
  slug: string;
  region: MovementRegion;
  signal: string; // 신호
  root: string; // 뿌리
  firstTarget: string; // 먼저 잡는 곳
  whyOrder: string; // 왜 그 순서인가
};
const MOVEMENT_CARDS: MovementCard[] = [];
const MOVEMENT_REGIONS: MovementRegion[] = ["목·어깨", "허리·골반", "무릎·발목"];

const SIX_SPOTS = ["아랫배", "엉덩이 속근육", "옆구리", "등 속근육", "견갑 주변", "다리를 모으는 근육"];

const REJECTED_METHODS = [
  { method: "굽은 등을 펴는 신전 운동을 반복한다", result: "허리가 이미 꺾여 있는 분은 그 자리에서 더 굳습니다." },
  { method: "아픈 쪽을 집중적으로 운동시킨다", result: "반대쪽을 시켰을 때 오히려 좋아졌습니다." },
];

const MEMBER_QUOTES = [
  "도대체 무슨 운동을 했는데 이렇게 힘들지.",
  "아무것도 안 한 것 같은데 발목도 무릎도 편안해요.",
  "어제 정말 오랜만에 푹 잤어요.",
];

const FLOW_STEPS = [
  { label: "측정", desc: "체형·움직임·기능 세 가지를 같이 놓고 봅니다. 하나만 보면 결론이 뒤집힙니다." },
  { label: "감별", desc: "수치만 보지 않고 시켜봅니다. 힘이 들어오는지 안 들어오는지가 판정입니다." },
  { label: "토대", desc: "아랫배와 호흡 → 골반 → 상체. 손목·발목은 따로 잡지 않습니다. 위가 정리되면 따라옵니다." },
  { label: "적재", desc: "토대가 생긴 다음에 무게를 얹습니다. 그전에 얹으면 기울어진 바닥에 벽돌을 쌓는 일입니다." },
];

const NOT_DOING: { bold?: string; text: string }[] = [
  { text: "마사지로 시작하지 않습니다" },
  { text: "정렬이 되기 전에 무게를 얹지 않습니다" },
  { text: "가동 범위를 넘겨서 시키지 않습니다" },
  {
    bold: "질환을 판단하지 않습니다.",
    text: " 가만히 있어도 저리거나 화끈거리는 느낌이 함께 있다면, 저희 선에서 판단하지 않고 병원 검사를 먼저 권해드립니다",
  },
];

export default function MethodPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Header />
      <main>

        {/* ① 히어로 */}
        <section className="bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">미소 운동법</p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight text-balance">
              <span className="block">내몸에미소의 운동은</span>{" "}
              <span className="text-[#7B2D8B]">
                <span className="inline-block">일을 안 하고 있는 자리를 찾아,</span>{" "}
                <span className="inline-block">다시 일하게 만드는 운동입니다.</span>
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto text-pretty">
              <span className="inline-block">아픈 곳부터 만지지 않습니다.</span>{" "}
              <span className="inline-block font-semibold text-gray-800">그래서 순서가 전부입니다.</span>
            </p>
          </div>
        </section>

        {/* ② 같은 점수, 다른 몸 — 이 페이지의 엔진 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-4">같은 점수, 다른 몸</p>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-4 text-pretty">
              오버헤드 스쿼트에서 <strong className="text-[#7B2D8B]">0점.</strong> 두 회원님에게서 같은 숫자가 나왔습니다.
            </p>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-4 text-pretty">
              <span className="inline-block">한 분은 팔이 애초에 그 높이까지 올라가지 않았고,</span>{" "}
              <span className="inline-block">한 분은 올라가긴 하는데 버티지 못했습니다.</span>
            </p>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-8 text-pretty">
              <span className="inline-block">같은 0점이지만 해야 할 일은 정반대였습니다.</span>{" "}
              <span className="inline-block">앞쪽에 스트레칭을 주면 진도가 나지 않고,</span>{" "}
              <span className="inline-block">뒤쪽에 스트레칭을 주면 오히려 더 불안정해집니다.</span>
            </p>
            <div className="bg-white border border-gray-200 border-l-4 border-l-[#7B2D8B] rounded-2xl px-6 py-6">
              <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed text-pretty">
                <span className="inline-block">무엇으로 갈랐는지 —</span>{" "}
                <span className="inline-block">그 판정 기준은 공개하지 않습니다.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ③ 우리가 깨우는 자리는 여섯 개뿐입니다 */}
        <section className="py-12 md:py-20 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 text-balance">
              우리가 깨우는 자리는 여섯 개뿐입니다
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <span className="inline-block">몸 전체를 만지지 않습니다.</span>{" "}
              <span className="inline-block">실제로 비어 있는 자리는 대개 정해져 있습니다.</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-white rounded-2xl px-5 py-5 mb-6 border border-purple-100">
              {SIX_SPOTS.map((spot, i) => (
                <span key={spot} className="flex items-center gap-3">
                  <span className="whitespace-nowrap font-bold text-[#7B2D8B]">{spot}</span>
                  {i < SIX_SPOTS.length - 1 && <span aria-hidden className="text-gray-300">·</span>}
                </span>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">대부분의 분들이 이 중 최소 두 곳에서</span>{" "}
              <strong className="inline-block text-gray-900">아무 힘도 들어오지 않습니다.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">특히 아랫배는 — 지금까지 처음부터 그 자리를 느끼신 분이</span>{" "}
              <strong className="inline-block text-gray-900">한 분도 없었습니다.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              어떻게 찾고 어떻게 깨우는지는, 직접 해보셔야 하는 부분입니다.
            </p>
          </div>
        </section>

        {/* ④ 해봤습니다. 그리고 안 됐습니다 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 text-balance">
              해봤습니다. 그리고 안 됐습니다
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              업계에서 흔히 쓰는 방법들을 저희도 해봤습니다. 남지 않은 것들을 적어둡니다.
            </p>
            <div className="space-y-4 mb-8">
              {REJECTED_METHODS.map((m) => (
                <div key={m.method} className="bg-[#FAF5FB] rounded-2xl p-6 border border-purple-100">
                  <p className="font-bold text-gray-900 mb-2 text-pretty">· {m.method}</p>
                  <p className="text-gray-500 text-sm md:text-base text-pretty">→ {m.result}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-800 font-semibold text-pretty">
              지금 하는 방식은 <strong className="text-[#7B2D8B]">이렇게 걸러지고 남은 것</strong>입니다.
            </p>
          </div>
        </section>

        {/* ⑤ 한 회차의 목표는 무게가 아닙니다 */}
        <section className="py-12 md:py-20 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 text-balance">
              한 회차의 목표는 무게가 아닙니다
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">몇 킬로, 몇 회가 기준이 아닙니다.</span>{" "}
              <strong className="inline-block text-gray-900">그 자리에 힘이 들어오는 것을 본인이 느끼는 것</strong>{" "}
              <span className="inline-block">— 그게 한 회차의 목표입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              <span className="inline-block">그리고 다음에 오시면 대개 다시 흐려져 있습니다.</span>{" "}
              <span className="inline-block">그래서 매번 다시 찾고, 그 위에서 다음으로 갑니다.</span>{" "}
              <strong className="inline-block text-[#7B2D8B]">여기에 졸업은 없습니다.</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MEMBER_QUOTES.map((q) => (
                <div key={q} className="bg-white rounded-2xl px-5 py-5 border border-purple-100">
                  <p className="text-gray-700 text-sm leading-relaxed text-pretty">&ldquo;{q}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑥ 아직 저희도 못 푼 것 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 text-balance">
              아직 저희도 못 푼 것
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">발이 도는 방향과 골반이 도는 방향이</span>{" "}
              <strong className="inline-block text-gray-900">서로 어긋나는</strong>{" "}
              <span className="inline-block">분들이 있습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              과하게 보상해서 오히려 반대로 틀어진 경우도 있습니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">이런 케이스는 저희도 아직 기준이 서지 않았습니다.</span>{" "}
              <span className="inline-block">그래서 여러 가지를 시켜보고, 평가가 틀렸으면 그 자리에서 바꿉니다.</span>
            </p>
            <p className="text-gray-800 font-semibold text-pretty">
              기록이 쌓이는 만큼 이 목록은 줄어듭니다.
            </p>
          </div>
        </section>

        {/* ⑦ 순서 */}
        <section className="py-12 md:py-20 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-balance">순서</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {FLOW_STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="bg-[#7B2D8B] text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-full">
                    {s.label}
                  </span>
                  {i < FLOW_STEPS.length - 1 && <span aria-hidden className="text-gray-300 text-xl">→</span>}
                </div>
              ))}
            </div>
            <div className="space-y-5">
              {FLOW_STEPS.map((s) => (
                <div key={s.label} className="flex gap-4">
                  <span className="shrink-0 font-bold text-[#7B2D8B] w-14">{s.label}</span>
                  <p className="text-gray-600 leading-relaxed text-pretty">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑧ 우리가 하지 않는 것 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-balance">
              우리가 하지 않는 것
            </h2>
            <div className="space-y-3">
              {NOT_DOING.map((item) => (
                <div key={item.text} className="flex items-start gap-3 bg-[#FAF5FB] rounded-xl px-5 py-4 border border-purple-100">
                  <span aria-hidden className="text-[#7B2D8B] font-bold shrink-0">✕</span>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed text-pretty">
                    {item.bold && <strong className="text-gray-900">{item.bold}</strong>}
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑨ 부위별 기록 — 감별 카드 확정 전까지는 빈 슬롯 */}
        {MOVEMENT_CARDS.length > 0 && (
          <section className="py-12 md:py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-balance">
                부위별 기록
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOVEMENT_REGIONS.map((region) => (
                  <div key={region}>
                    <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">{region}</p>
                    <div className="space-y-3">
                      {MOVEMENT_CARDS.filter((c) => c.region === region).map((c) => (
                        <Link
                          key={c.slug}
                          href={`/method/${c.slug}`}
                          className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#7B2D8B] transition-colors"
                        >
                          <p className="font-bold text-gray-900 mb-2 text-pretty">{c.signal}</p>
                          <p className="text-xs text-gray-400 mb-1">뿌리</p>
                          <p className="text-sm text-gray-600 mb-2 text-pretty">{c.root}</p>
                          <p className="text-xs text-gray-400 mb-1">먼저 잡는 곳</p>
                          <p className="text-sm text-gray-600 text-pretty">{c.firstTarget}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ⑨ 자리 — 카드가 채워지기 전까지는 연구노트 링크 (작업 D) */}
        <section className="py-12 md:py-20 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
              쌓고 있는 기록
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              40~59세 여성 회원 {report4050.sampleSize}명의 실측 데이터를 익명으로 모아 정리하고 있습니다.
            </p>
            <Link
              href="/research-notes"
              className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF5FB] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
                  <BarChartIcon className="text-[#7B2D8B] group-hover:text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{report4050.title}</h3>
                  <p className="text-sm md:text-base text-gray-500">{report4050.summary}</p>
                </div>
                <span className="text-gray-300 text-xl shrink-0">›</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ⑩ CTA */}
        <section className="bg-[#7B2D8B] py-12 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 text-balance">
              한 번 받아보시는 게 가장 빠릅니다.
            </h2>
            <p className="text-purple-200 mb-8 text-sm md:text-base lg:text-lg text-pretty">
              <span className="inline-block">글로 옮길 수 있는 부분까지 적었습니다.</span>{" "}
              <span className="inline-block">나머지는 몸으로 확인하셔야 하는 부분입니다.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <KakaoButton className="bg-white text-[#7B2D8B] font-bold px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
                첫 평가 문의하기
              </KakaoButton>
              <Link
                href="/check"
                className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full text-base hover:bg-white hover:text-[#7B2D8B] transition-colors"
              >
                내 몸 상태 1분 체크
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
