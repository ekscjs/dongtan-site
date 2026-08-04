import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE = "https://www.bodymiso.com";
const TITLE = "아픈 곳과 원인이 다른 자리들 | 미소 운동법 · 내몸에미소 동탄";
const DESC =
  "무릎이 아프면 고관절을, 팔이 안 올라가면 골반을 먼저 봅니다. 내몸에미소가 증상별로 먼저 보는 곳과 그렇게 판단하는 신호 21가지.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE}/method/pain-origin` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE}/method/pain-origin`,
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
  headline: "아픈 곳과 원인이 다른 자리들",
  description: DESC,
  url: `${SITE}/method/pain-origin`,
  mainEntityOfPage: `${SITE}/method/pain-origin`,
  about: { "@type": "Thing", name: "미소 운동법" },
  author: { "@type": "Person", name: "박미소", jobTitle: "원장", url: `${SITE}/about` },
  publisher: {
    "@type": "Organization",
    name: "내몸에미소",
    logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
  },
  dateModified: "2026-08-04",
};

// 21행 매핑표. slugs가 있는 것만 관련 기록 링크 — 존재 확인된 슬러그만(예약 상태 제외).
type Row = {
  symptom: string[]; // "/"로 갈리는 대안 표현은 배열로
  blamed: string[]; // "·"로 잇는 병렬 항목
  weLookAt: string[]; // "·"로 잇는 병렬 항목
  slugs?: string[];
};

const ROWS: Row[] = [
  { symptom: ["무릎이 아프다", "걸을 때 무릎이 불편하다"], blamed: ["무릎"], weLookAt: ["고관절"] },
  {
    symptom: ["스쿼트할 때 무릎이 안쪽으로 무너진다"],
    blamed: ["무릎"],
    weLookAt: ["발 아치"],
    slugs: ["knee-valgus-cause-was-collapsed-arch-left-foot"],
  },
  {
    symptom: ["팔이 머리 위로 안 올라간다"],
    blamed: ["어깨"],
    weLookAt: ["흉추"],
    slugs: ["dongtan-clinical-multi-symptom-thoracic-first", "shoulder-imbalance-thoracic-mobility-first"],
  },
  {
    symptom: ["수술 안 한 반대쪽 어깨까지 아파온다"],
    blamed: ["그 어깨"],
    weLookAt: ["골반", "전신 긴장"],
    slugs: ["shoulder-both-sides-pain-whole-body-tension-pelvis"],
  },
  {
    symptom: ["뒤통수까지 아픈 두통"],
    blamed: ["머리"],
    weLookAt: ["목"],
    slugs: ["cervicogenic-headache-neck-tension-dongtan"],
  },
  {
    symptom: ["거북목·라운드숄더에 두통까지"],
    blamed: ["근력 부족"],
    weLookAt: ["정렬", "근력보다 먼저"],
    slugs: ["alignment-first-before-resistance-training"],
  },
  {
    symptom: ["아침 첫발이 아프다"],
    blamed: ["발바닥"],
    weLookAt: ["발목", "종아리"],
    slugs: ["plantar-fasciitis-ankle-calf-cause"],
  },
  {
    symptom: ["앉았다 일어설 때 사타구니가 당긴다"],
    blamed: ["사타구니"],
    weLookAt: ["고관절 앞쪽"],
    slugs: ["hip-stiffness-groin-tightness-sitting-dongtan"],
  },
  {
    symptom: ["다이어트해도 아랫배가 안 들어간다"],
    blamed: ["뱃살"],
    weLookAt: ["골반 각도"],
    slugs: ["pelvic-tilt-belly-shape"],
  },
  {
    symptom: ["허리가 아무리 해도 안 풀린다"],
    blamed: ["허리"],
    weLookAt: ["호흡", "코어"],
    slugs: ["why-deep-back-pain-wont-go-away"],
  },
  {
    symptom: ["다리가 저리다"],
    blamed: ["허리디스크"],
    weLookAt: ["저리는 위치와 상황에 따라 갈립니다"],
    slugs: ["leg-numbness-not-always-disc"],
  },
  { symptom: ["넘어질까 무섭다"], blamed: ["다리 힘"], weLookAt: ["감각", "힘만이 아닙니다"] },
  {
    symptom: ["몸은 유연한데 자꾸 아프다"],
    blamed: ["유연성 부족"],
    weLookAt: ["안정성 결핍"],
    slugs: ["flexible-but-unstable-hip-mobility-knee-pattern"],
  },
  {
    symptom: ["웨이트는 충분히 하는데 자꾸 다친다"],
    blamed: ["근력 부족"],
    weLookAt: ["가동성"],
    slugs: ["athlete-strong-but-injured-mobility-not-strength"],
  },
  {
    symptom: ["골반이 아프다"],
    blamed: ["골반 좌우 틀어짐"],
    weLookAt: ["좌우는 정상이었던 경우도 있습니다"],
    slugs: ["pelvic-pain-but-symmetry-was-fine-senior"],
  },
  {
    symptom: ["뒤에서 보면 몸이 틀어져 보인다"],
    blamed: ["측만"],
    weLookAt: ["측정 수치는 정상 범위인 경우도 있습니다"],
  },
  {
    symptom: ["통증은 없어졌는데 예전 같지 않다"],
    blamed: ["다 나은 것"],
    weLookAt: ["기능은 아직입니다"],
    slugs: ["pain-gone-not-fully-recovered-function"],
  },
  { symptom: ["손목·팔꿈치가 아프다"], blamed: ["손목", "팔꿈치"], weLookAt: ["어깨"] },
  { symptom: ["발목을 자주 삐끗한다"], blamed: ["발목"], weLookAt: ["고관절", "발이 땅을 딛는 방식"] },
  { symptom: ["종아리에 쥐가 자주 난다"], blamed: ["종아리", "순환"], weLookAt: ["체중을 어디로 지지하는지"] },
  { symptom: ["턱이 불편하다", "이를 간다"], blamed: ["턱관절"], weLookAt: ["골반"] },
];

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="text-sm font-bold text-[#7B2D8B] shrink-0">{n}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">{title}</h2>
    </div>
  );
}

// "/"로 갈리는 대안 표현 — 통째로 넘기고, 갈라지는 지점만 허용
function SlashJoin({ parts }: { parts: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      {parts.map((p, i) => (
        <span key={p} className="flex items-baseline gap-1.5">
          <span className="inline-block">{p}</span>
          {i < parts.length - 1 && <span aria-hidden className="text-gray-300">/</span>}
        </span>
      ))}
    </span>
  );
}

// "·"로 잇는 병렬 항목 — 구분점을 레이아웃으로
function DotJoin({ parts, className }: { parts: string[]; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className ?? ""}`}>
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          <span className="whitespace-nowrap inline-block">{p}</span>
          {i < parts.length - 1 && <span aria-hidden className="text-gray-300">·</span>}
        </span>
      ))}
    </span>
  );
}

function RelatedLinks({ slugs }: { slugs: string[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {slugs.map((slug, i) => (
        <Link
          key={slug}
          href={`/blog/${slug}`}
          className="text-xs text-[#7B2D8B] font-semibold underline underline-offset-2 hover:text-[#6a2578] whitespace-nowrap"
        >
          관련 기록{slugs.length > 1 ? ` ${i + 1}` : ""} →
        </Link>
      ))}
    </div>
  );
}

export default function PainOriginPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Header />
      <main>

        {/* [표제] + [리드] */}
        <section className="bg-[#FAF5FB] pt-10 pb-12 md:pt-14 md:pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-2 tracking-widest uppercase">미소 운동법</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-6 text-balance">
              아픈 곳과 원인이 다른 자리들
            </h1>
            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-6 text-pretty">
              저희가 먼저 보는 곳 목록입니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">무릎이 아파서 오시면 저희는 고관절을 봅니다.</span>{" "}
              <span className="inline-block">팔이 안 올라가면 골반부터 봅니다.</span>{" "}
              <span className="inline-block">왜 그런지는</span>{" "}
              <Link
                href="/method"
                className="inline-block text-[#7B2D8B] font-semibold underline underline-offset-2 hover:text-[#6a2578]"
              >
                미소 운동법 2장
              </Link>
              <span className="inline-block">에 적어뒀습니다.</span>{" "}
              <span className="inline-block">이 페이지는 그 목록입니다.</span>
            </p>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed text-pretty">
              <span className="inline-block">임상 기록에서 반복해서 나온 것만 적었습니다.</span>{" "}
              <span className="inline-block">짐작으로 채운 칸은 없습니다.</span>
            </p>
          </div>
        </section>

        {/* 1. 증상과 원인 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="1" title="증상과 원인" />

            {/* 데스크톱: 표 */}
            <div className="hidden md:block overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">이런 증상으로 오십니다</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 whitespace-nowrap">흔히 지목되는 곳</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">저희가 먼저 보는 곳</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.symptom[0]} className="border-b border-gray-100 bg-[#FAF5FB]">
                      <td className="py-3 px-3 text-gray-900 font-medium align-top">
                        <SlashJoin parts={r.symptom} />
                      </td>
                      <td className="py-3 px-3 text-gray-500 align-top">
                        <DotJoin parts={r.blamed} />
                      </td>
                      <td className="py-3 px-3 align-top">
                        <DotJoin parts={r.weLookAt} className="font-bold text-gray-900" />
                        {r.slugs && <RelatedLinks slugs={r.slugs} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일: 세로 카드 (375px에서 3열 표 대신) */}
            <div className="md:hidden space-y-3 mb-4">
              {ROWS.map((r) => (
                <div key={r.symptom[0]} className="bg-[#FAF5FB] rounded-xl p-4">
                  <p className="font-bold text-gray-900 text-pretty">
                    <SlashJoin parts={r.symptom} />
                  </p>
                  <p className="text-xs text-gray-400 mt-3 mb-1">흔히 지목되는 곳</p>
                  <p className="text-sm text-gray-500">
                    <DotJoin parts={r.blamed} />
                  </p>
                  <p className="text-xs text-gray-400 mt-3 mb-1">저희가 먼저 보는 곳</p>
                  <p className="text-sm">
                    <DotJoin parts={r.weLookAt} className="font-bold text-[#7B2D8B]" />
                  </p>
                  {r.slugs && <RelatedLinks slugs={r.slugs} />}
                </div>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">마지막 네 줄은 최근에 정리한 것입니다.</span>{" "}
              <span className="inline-block">손목과 턱이 골반과 이어지는 건</span>{" "}
              <span className="inline-block">근막이 위아래로 연결되어 있어서입니다.</span>{" "}
              <span className="inline-block">등 쪽에서 잡아당기면 목을 지나 얼굴까지 끌려옵니다.</span>
            </p>
          </div>
        </section>

        {/* 2. 무엇을 보고 그렇게 판단하는가 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="2" title="무엇을 보고 그렇게 판단하는가" />
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <span className="inline-block">목록만 있으면 남의 이야기로 읽힙니다.</span>{" "}
              <span className="inline-block">저희가 실제로 보는 신호를 적습니다.</span>
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">무릎이 아프다</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">발이 바깥으로 돌아가 있는데</span>{" "}
                  <span className="inline-block">무릎은 정면을 보려고 하는 상태를 봅니다.</span>{" "}
                  <span className="inline-block">무릎이 두 번째 발가락 방향으로 움직이면 괜찮습니다.</span>{" "}
                  <span className="inline-block">그런데 대개 그렇게 움직이지 않습니다.</span>{" "}
                  <span className="inline-block">자기 자리에 없는 채로 계속 정면으로 돌아가려 하니 아픕니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">팔이 안 올라간다</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">골반이 한쪽으로 밀려 있는지를 먼저 봅니다.</span>{" "}
                  <span className="inline-block">밀린 방향과 어깨가 불편한 방향이</span>{" "}
                  <span className="inline-block">같은 경우도 있고 반대인 경우도 있습니다.</span>{" "}
                  <span className="inline-block">사람마다 생활 패턴이 달라서</span>{" "}
                  <span className="inline-block">여기는 하나씩 확인해야 합니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">가동 범위는 좋은데 아프다</h3>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <span className="inline-block">바른 자세를 만들려고 등을 과하게 펴고 계신지 봅니다.</span>{" "}
                  <span className="inline-block">자기 범위를 넘겨서 쓰면 견갑이 뜨고 어깨에서 충돌이 옵니다.</span>{" "}
                  <span className="inline-block">운동을 열심히 하시는 분,</span>{" "}
                  <span className="inline-block">골프처럼 한쪽으로 크게 쓰는 운동을 하시는 분에게서 자주 나옵니다.</span>
                </p>
                <p className="text-gray-900 font-bold leading-relaxed text-pretty">
                  <span className="inline-block">범위가 부족해서 아픈 게 아니라</span>{" "}
                  <span className="inline-block">범위를 넘겨 써서 아파진 경우입니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">손목·팔꿈치</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">어깨가 좋아지고 나서</span>{" "}
                  <span className="inline-block">손목과 팔꿈치를 따로 손대지 않았는데</span>{" "}
                  <span className="inline-block">같이 좋아진 경우가 반복됐습니다.</span>{" "}
                  <span className="inline-block">그래서 여기는 말단부터 손대지 않습니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">발목을 자주 삐끗한다</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">발이 땅을 딛는 세 지점을 제대로 쓰고 있는지 봅니다.</span>{" "}
                  <span className="inline-block">못 쓰면 삐끗할 수밖에 없습니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">종아리에 쥐가 난다</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">뒤꿈치로 딛고 몸이 뒤로 넘어가려는 자세인지 봅니다.</span>{" "}
                  <span className="inline-block">그러면 앞으로 쏠린 몸을 종아리가 계속 버티고 있습니다.</span>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">허리로 오셨는데 어깨가 걱정되는 경우</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">골반이 틀어져 있으면 시간이 지나 어깨로 옵니다.</span>{" "}
                  <span className="inline-block">그래서 허리로 오신 분의 어깨를 미리 봅니다.</span>{" "}
                  <span className="inline-block">골반을 잡아주면 어깨는 기능만 살려도 회복됩니다.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 느꼈다고 하시는데 아닌 경우 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="3" title="느꼈다고 하시는데 아닌 경우" />
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              이건 저희가 매 회차 확인하는 것입니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">어떤 자리를 깨우려고 시켜보고</span>{" "}
              <span className="inline-block">“여기 힘 들어오는 게 느껴지세요?” 하고 묻습니다.</span>{" "}
              <span className="inline-block">느껴진다고 하시는데,</span>{" "}
              <span className="inline-block">같은 자리가 계속 불편하다고 하시는 경우가 있습니다.</span>
            </p>
            <p className="text-gray-900 font-bold leading-relaxed mb-4 text-pretty">
              저희는 이렇게 봅니다. 제대로 느꼈다면 그 증상이 남아 있을 이유가 없습니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">그래서 다시 해보시라고 말씀드립니다.</span>{" "}
              <span className="inline-block">나중에는 아닌 것 같다고 하십니다.</span>{" "}
              <span className="inline-block">느꼈다는 말과 증상이 어긋날 때는 증상을 믿습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">빈 깡통이 잡히지 않는 분도 있습니다.</span>{" "}
              <span className="inline-block">그 자리가 너무 오래 늘어나 있어서</span>{" "}
              <span className="inline-block">손을 대서 도와주면 조금 느끼지만</span>{" "}
              <span className="inline-block">혼자서는 못 느끼는 경우, 그리고 감각 자체가 무딘 경우입니다.</span>{" "}
              <span className="inline-block">후자는 팔을 양옆으로 올려보라고 하면</span>{" "}
              <span className="inline-block">한쪽이 덜 올라가 있는데도 다 올렸다고 말씀하십니다.</span>
            </p>
          </div>
        </section>

        {/* 4. 여기까지만 적습니다 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="4" title="여기까지만 적습니다" />
            <div className="bg-white border border-gray-200 border-l-4 border-l-[#7B2D8B] rounded-2xl px-6 py-6 mb-4">
              <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed text-pretty">
                <span className="inline-block">어디를 보는지와 왜 그렇게 보는지는 적었습니다.</span>{" "}
                <span className="inline-block">무엇을 시키는지,</span>{" "}
                <span className="inline-block">어느 수치부터 어느 쪽으로 보는지는 적지 않습니다.</span>
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
              <span className="inline-block">글로 옮길 수 있는 데까지 적었습니다.</span>{" "}
              <span className="inline-block">나머지는 몸으로 확인해야 하는 부분입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">이 목록이 어떤 순서 위에서 쓰이는지는</span>{" "}
              <Link
                href="/method"
                className="inline-block text-[#7B2D8B] font-semibold underline underline-offset-2 hover:text-[#6a2578]"
              >
                미소 운동법
              </Link>
              <span className="inline-block">에 있습니다.</span>
            </p>
          </div>
        </section>

        {/* [끝] 한 줄 링크 */}
        <section className="py-12 md:py-16 px-4 border-t border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-pretty">
              <span className="inline-block">자기 몸이 어느 쪽인지 궁금하시면</span>{" "}
              <Link
                href="/check"
                className="inline-block text-[#7B2D8B] font-semibold underline underline-offset-2 hover:text-[#6a2578]"
              >
                내 몸 상태 체크
              </Link>
              <span className="inline-block">로 시작해보실 수 있습니다.</span>
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
