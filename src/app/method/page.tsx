import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BarChartIcon } from "@/components/Icons";
import { report4050 } from "@/app/research-notes/data";

const SITE = "https://www.bodymiso.com";
const TITLE = "미소 운동법 v1.0 — 내몸에미소가 몸을 보는 방식 | 동탄";
const DESC =
  "아픈 곳은 대개 범인이 아니다. 빈 깡통을 찾아 깨우는 순서 — 내몸에미소가 회원 200여 명의 기록에서 정리한 운동 방법론 v1.0.";

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
  headline: "미소 운동법 v1.0 — 내몸에미소가 몸을 보는 방식",
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

// 부속: 부위별 기록 — 감별 카드 확정 전까지는 빈 배열. 채워지면 아래 렌더 로직 그대로 동작한다.
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

const PRINCIPLES: string[][] = [
  ["아픈 곳은 대개 범인이 아니다"],
  ["뻣뻣한 게 아니라 못 버티는 것이다"],
  ["바닥부터 수평을 맞춘다 —", "골반을 먼저 잡아야 호흡이 열린다"],
  ["몸이 그 동작을 감당할 준비가 됐는지", "먼저 본다"],
  ["통증이 사라진 것과 회복은 다른 일이다"],
  ["숫자가 좋아지는 것보다", "무너지지 않는 게 먼저다"],
  ["같은 증상이라도 사람마다 순서가 다르다"],
  ["우리가 하지 않는 일을 분명히 한다"],
];

const PROCEDURE_STEPS: { label: string; desc: string[] }[] = [
  { label: "측정", desc: ["체형·움직임·기능 세 가지를", "같이 놓고 봅니다.", "하나만 보면 결론이 뒤집힙니다."] },
  { label: "감별", desc: ["수치만 보지 않고 시켜봅니다.", "빈 깡통이 어디인지 찾는 게 이 단계입니다."] },
  { label: "토대", desc: ["정렬과 안정성을 먼저 세웁니다."] },
  { label: "얹기", desc: ["토대가 생긴 다음에 무게를 올립니다."] },
];

const BODY_ORDER = ["① 코어", "② 골반", "③ 상체", "④ 말단"];

const AWAKEN_SPOTS = ["하복부", "엉덩이 속근육", "등 속근육", "옆구리", "견갑 주변", "다리를 모으는 근육"];

const DISCERN_ROWS = [
  { same: "오버헤드 스쿼트 0점", a: "애초에 그 높이까지 올라가지 않음", b: "올라가지만 버티지 못함" },
  { same: "무릎이 안쪽으로 쏠림", a: "위에서 내려온 원인 (고관절)", b: "아래에서 올라온 원인 (발)" },
  { same: "유연해 보임", a: "실제로 가동성이 좋음", b: "못 버텨서 범위가 넓어 보임" },
  { same: "다리가 저림", a: "허리에서 온 것", b: "그 외" },
];

const NOT_DOING: { bold?: string; text: string[] }[] = [
  { text: ["마사지로 시작하지 않습니다"] },
  { text: ["정렬이 되기 전에 무게를 얹지 않습니다"] },
  {
    text: [
      "가동 범위를 넘겨서 시키지 않습니다.",
      "내 가동 범위가 아니면 가지 마세요.",
      "다치는 경우는 두 가지밖에 없습니다.",
      "너무 무거웠거나, 너무 갔거나.",
    ],
  },
  {
    bold: "질환을 판단하지 않습니다.",
    text: [
      "가만히 있어도 저리거나 화끈거리는 느낌이 함께 있다면,",
      "저희 선에서 보지 않고 병원 검사를 먼저 권해드립니다",
    ],
  },
];

const REJECTED_METHODS: { method: string; result: string[] }[] = [
  {
    method: "굽은 등을 펴는 신전 운동을 반복한다",
    result: ["허리가 이미 꺾여 있는 경우", "그 자리에서 더 굳습니다."],
  },
  {
    method: "아픈 쪽을 집중적으로 운동시킨다",
    result: ["반대쪽을 시켰을 때", "오히려 좋아지는 경우가 반복됐습니다."],
  },
  {
    method: "힘센 근육의 톤을 눌러놓고 약한 쪽을 쓰게 한다",
    result: ["마사지로 아무리 눌러놔도", "힘센 쪽이 계속 힘을 씁니다.", "해봤는데 안 됐습니다."],
  },
];

const REVISIONS = [
  { version: "v1.0", when: "2026.07", desc: "첫 공개 — 지금 보고 계신 내용", current: true },
  { version: "v1.1", when: "예정", desc: "몸을 볼 때 무엇부터 보는지", current: false },
  { version: "v1.2", when: "예정", desc: "어디가 아플 때 원인이 주로 어디인지", current: false },
  { version: "v2.0", when: "예정", desc: "40~50대 여성 체형 측정에서 실제로 나온 것", current: false },
];

// 의미 단위로 미리 쪼갠 문장을 inline-block으로 묶어 렌더 — 구 단위 줄바꿈 보장
// 공백은 span 밖의 형제 텍스트 노드로 둔다 — inline-block 안쪽 끝 공백은 CSS가 잘라내서 안 보인다
function Chunks({ parts }: { parts: string[] }) {
  return (
    <>
      {parts.flatMap((part, i) => {
        const span = (
          <span key={`c${i}`} className="inline-block">
            {part}
          </span>
        );
        return i === 0 ? [span] : [" ", span];
      })}
    </>
  );
}

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="text-sm font-bold text-[#7B2D8B] shrink-0">{n}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">{title}</h2>
    </div>
  );
}

export default function MethodPage() {
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
            <p className="text-gray-400 text-xs font-semibold mb-6">Ver 1.0 · 2026년 7월</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-6 text-balance">
              <span className="block">바른 자세라는 건 없습니다.</span>{" "}
              <span className="block">
                <Chunks parts={["몇 분이고", "한 자세로 있는 것이", "잘못된 자세입니다."]} />
              </span>
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <span className="inline-block">안 움직여서 생기는 문제를,</span>{" "}
              <span className="inline-block">더 바른 자세로 앉아서 풀 수는 없습니다.</span>
            </p>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed text-pretty">
              <span className="inline-block">이 문서는 내몸에미소가 몸을 보는 방식을 정리한 것입니다.</span>{" "}
              <span className="inline-block">회원 200여 명, 임상 기록 40여 편에서 반복해서 나타난 판단을 뽑아 이름을 붙였습니다.</span>{" "}
              <span className="inline-block">새로 만든 건 없습니다.</span>{" "}
              <span className="inline-block">이미 하고 있던 걸 적었습니다.</span>
            </p>
          </div>
        </section>

        {/* 1. 정의 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="1" title="정의 — 운동, 그리고 그 앞의 순서" />

            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-4 text-pretty">
              몸을 움직이는 것은 전부 운동입니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <Chunks
                parts={[
                  "이건 운동이고 저건 아니고,",
                  "저희는 그렇게 나누지 않습니다.",
                  "걷는 것도, 무게를 드는 것도,",
                  "필라테스도 다 운동입니다.",
                ]}
              />
            </p>

            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-4 text-pretty">
              <Chunks parts={["다만 운동은 제대로 하면", "몸을 낫게 하고,", "잘못하면 독이 됩니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <Chunks parts={["부작용이 아닙니다.", "운동이 원래 그런 겁니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <Chunks parts={["같은 동작이 어떤 몸에는 약이 되고", "어떤 몸에는 해가 됩니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <span className="inline-block">그래서 무엇을 하느냐보다</span>{" "}
              <strong className="inline-block text-gray-900">어떤 몸에 그것을 얹느냐</strong>
              <span className="inline-block">가 먼저입니다.</span>
            </p>

            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-4 text-pretty">
              그러니 순서가 있습니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <Chunks parts={["일을 안 하고 있는 자리를 먼저 깨우고,", "그 위에서 움직여야 합니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">깨우지 않은 채로 움직이면</span>{" "}
              <strong className="inline-block text-gray-900">이미 일하고 있는 자리가</strong>{" "}
              <strong className="inline-block text-gray-900">그 일까지 떠맡습니다.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <Chunks parts={["운동을 열심히 할수록", "한 군데만 더 아파지는", "경우가 여기서 나옵니다."]} />
            </p>

            <p className="text-gray-600 leading-relaxed mb-1 text-pretty">
              <Chunks parts={["그래서 미소 운동법은", "다른 종류의 운동이 아닙니다."]} />
            </p>
            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-6 text-pretty">
              <Chunks parts={["운동을 하기 전에", "밟아야 하는 순서입니다."]} />
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">한 회차의 목표도 그래서 다릅니다.</span>{" "}
              <span className="inline-block">몇 킬로를 들었는지, 몇 회를 했는지는 세지 않습니다.</span>{" "}
              <strong className="inline-block text-gray-900">그 자리에 힘이 들어오면 그날은 된 겁니다.</strong>
            </p>
          </div>
        </section>

        {/* 2. 전제 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="2" title="전제 — 이 방법이 서 있는 세 가지" />
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">전제 1. 몸은 부위별로 따로 놀지 않는다</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">한 곳이 제 역할을 못 하면 몸은 그 일을 옆이나 위아래로 떠넘깁니다.</span>
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">전제 2. 아픈 곳은 대개 범인이 아니다</h3>
                <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                  <span className="inline-block">떠맡은 곳은 남의 일까지 하느라 과로하고,</span>{" "}
                  <span className="inline-block">결국 거기가 먼저 비명을 지릅니다.</span>{" "}
                  <span className="inline-block">그게 통증입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                  <span className="inline-block">마사지하는 그 근육은 계속 피해자입니다.</span>{" "}
                  <span className="inline-block">원인은 따로 있는데 거기만 자꾸 눌러댄다고 돌아오지 않습니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  그래서 통증이 있는 자리와 문제가 시작된 자리는 대개 다릅니다.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">전제 3. 뻣뻣한 게 아니라 못 버티는 것이다</h3>
                <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                  <strong className="inline-block text-gray-900">이걸 잘못 보면 뒤에 하는 게 전부 어긋납니다.</strong>{" "}
                  <span className="inline-block">뻣뻣해 보여서 오시는 분들, 거의 다 여기에 해당합니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                  <span className="inline-block">범위가 없어서 못 움직이는 경우는 생각보다 적습니다.</span>{" "}
                  <span className="inline-block">범위는 있는데 그 안에서 스스로 버텨주지 못하는 경우가 훨씬 많습니다.</span>{" "}
                  <span className="inline-block">유연성이 부족해 보이는 것의 정체가 사실은 안정성 결핍입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">이 경우 스트레칭은 도움이 되지 않습니다.</span>{" "}
                  <span className="inline-block">늘어난 것을 더 늘리는 일이 됩니다.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 용어 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="3" title="용어" />
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <span className="inline-block">이 방법에는 저희가 쓰는 말이 있습니다.</span>{" "}
              <span className="inline-block">뜻을 정해두지 않으면 뒤의 내용이 읽히지 않습니다.</span>
            </p>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">빈 깡통</h3>
                <p className="text-gray-900 font-bold leading-relaxed mb-3 text-pretty">
                  <Chunks parts={["자극을 줘봤을 때", "아무것도 느껴지지 않는 자리."]} />
                </p>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <span className="inline-block">저희가 제일 많이 쓰는 말입니다.</span>{" "}
                  <span className="inline-block">센터에서는 “여기는 약간 깡통 느낌이 난다”고 표현합니다.</span>{" "}
                  <span className="inline-block">각도나 점수보다 이게 먼저입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <span className="inline-block">“여기 힘 들어오는 게 느껴지세요?” 라고 물었을 때 안 들어온다고 하면,</span>{" "}
                  <span className="inline-block">그 자리가 빈 깡통이고 그게 곧 목표가 됩니다.</span>
                </p>
                <p className="text-gray-500 text-sm leading-relaxed text-pretty">
                  측정 수치는 <strong className="text-gray-700">어디를 의심할지 좁혀주는 도구</strong>일 뿐이고, 어디가 비어 있는지는 시켜봐야 압니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">깨운다</h3>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <Chunks parts={["빈 깡통에 감각을 되살려,", "그 자리가 다시", "자기 일을 하게 만드는 것."]} />
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">근육을 키우는 것과 다릅니다.</span>{" "}
                  <span className="inline-block">없던 힘을 새로 만드는 일은 아닙니다.</span>{" "}
                  <span className="inline-block">
                    <strong className="text-gray-900">끊긴 연결을 다시 잇는</strong> 쪽에 가깝습니다.
                  </span>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">피해자 근육</h3>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <span className="inline-block">원인이 아니면서 남의 일을 떠맡아 과로하고 있는 근육.</span>{" "}
                  <span className="inline-block">통증이 나타나는 자리는 대개 여기입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  피해자를 아무리 풀어줘도 원인이 그대로면 통증은 돌아옵니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">토대 / 얹기</h3>
                <p className="text-gray-700 leading-relaxed mb-1 text-pretty">
                  <strong className="text-gray-900">토대</strong> — 무게를 얹기 전에 갖춰야 하는 정렬과 안정성.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3 text-pretty">
                  <strong className="text-gray-900">얹기</strong> — 그 위에 무게와 부하를 올리는 일.
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">기울어진 바닥에 벽돌을 쌓으면 높이 올릴수록 빨리 무너집니다.</span>{" "}
                  <span className="inline-block">순서가 뒤바뀌면 운동이 손해가 됩니다.</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">게이트</h3>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  다음 단계로 넘어가도 되는지 보는 기준.
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">저희는 무게나 횟수로 정하지 않습니다.</span>{" "}
                  <span className="inline-block">그 자리에 힘이 들어오는 걸</span>{" "}
                  <span className="inline-block">본인이 느끼면 넘어갑니다.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 원칙 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="4" title="원칙" />
            <ul className="space-y-3 mb-6">
              {PRINCIPLES.map((p, i) => (
                <li key={p.join("")} className="flex gap-3 bg-white rounded-xl border border-gray-100 px-5 py-4">
                  <span className="shrink-0 font-bold text-[#7B2D8B]">{i + 1}</span>
                  <p className="text-gray-700 leading-relaxed text-pretty">
                    <Chunks parts={p} />
                  </p>
                </li>
              ))}
            </ul>
            <blockquote className="border-l-4 border-gray-200 pl-4 space-y-1.5">
              <p className="text-gray-700 text-sm font-bold leading-relaxed text-pretty">
                3번은 좀 다릅니다.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed text-pretty">
                <span className="inline-block">“호흡부터”라는 말은 어디서나 합니다.</span>{" "}
                <span className="inline-block">저희는 골반을 먼저 잡습니다.</span>
              </p>
              <p className="text-gray-600 text-sm leading-relaxed text-pretty">
                골반이 안 잡히면 호흡이 안 열리거든요.
              </p>
            </blockquote>
          </div>
        </section>

        {/* 5. 절차 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="5" title="절차" />

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-1. 큰 순서</h3>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {PROCEDURE_STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="bg-[#7B2D8B] text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-full">
                      {s.label}
                    </span>
                    {i < PROCEDURE_STEPS.length - 1 && <span aria-hidden className="text-gray-300 text-xl">→</span>}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {PROCEDURE_STEPS.map((s) => (
                  <div key={s.label} className="flex gap-4">
                    <span className="shrink-0 font-bold text-[#7B2D8B] w-14">{s.label}</span>
                    <p className="text-gray-600 leading-relaxed text-pretty">
                      <Chunks parts={s.desc} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-2. 몸을 잡는 순서</h3>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {BODY_ORDER.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="bg-[#7B2D8B] text-white font-bold text-sm md:text-base px-4 py-2 rounded-full">
                      {s}
                    </span>
                    {i < BODY_ORDER.length - 1 && <span aria-hidden className="text-gray-300 text-xl">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                <strong className="inline-block text-gray-900">말단은 따로 잡지 않습니다.</strong>{" "}
                <span className="inline-block">손목·발목은 위가 정리되면 따라옵니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                <Chunks
                  parts={["그래서 저희는 손목·팔꿈치 통증을 어깨에서,", "발목·발바닥 통증을 무릎과 고관절에서 봅니다."]}
                />
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">어깨가 좋아지면 손목도 손가락도 같이 좋아집니다.</span>{" "}
                <span className="inline-block">발도 똑같습니다.</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-3. 깨우는 자리</h3>
              <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
                <span className="inline-block">깨워야 할 자리는 그렇게 많지 않습니다.</span>{" "}
                <span className="inline-block">몸 전체를 만지지 않습니다.</span>{" "}
                <span className="inline-block">실제로 비어 있는 자리는 대개 정해져 있습니다.</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#FAF5FB] rounded-2xl px-5 py-5 mb-4">
                {AWAKEN_SPOTS.map((spot, i) => (
                  <span key={spot} className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-bold text-[#7B2D8B]">{spot}</span>
                    {i < AWAKEN_SPOTS.length - 1 && <span aria-hidden className="text-gray-300">·</span>}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                대부분 이 중 최소 두 곳이 빈 깡통입니다.
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">특히 하복부는 — 지금까지 처음부터 그 자리를 느끼신 분이</span>{" "}
                <strong className="inline-block text-gray-900">한 분도 없었습니다.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 6. 감별 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="6" title="감별" />
            <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
              <span className="inline-block">같은 증상, 같은 점수라도</span>{" "}
              <span className="inline-block">해야 할 일이 정반대로 갈리는 자리가 있습니다.</span>
            </p>
            <p className="text-gray-900 font-bold leading-relaxed mb-6 text-pretty">
              여기서 잘못 갈리면 뒤에 하는 게 전부 헛일이 됩니다.
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">갈리는 자리들</h3>

            {/* 데스크톱: 표 */}
            <div className="hidden md:block overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">같은 것</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">갈래 A</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">갈래 B</th>
                  </tr>
                </thead>
                <tbody>
                  {DISCERN_ROWS.map((r) => (
                    <tr key={r.same} className="border-b border-gray-100 bg-white">
                      <td className="py-3 px-3 font-semibold text-gray-900">{r.same}</td>
                      <td className="py-3 px-3 text-gray-600">{r.a}</td>
                      <td className="py-3 px-3 text-gray-600">{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일: 세로 카드 (375px에서 가로 스크롤 대신) */}
            <div className="md:hidden space-y-3 mb-4">
              {DISCERN_ROWS.map((r) => (
                <div key={r.same} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900 mb-2 text-pretty">{r.same}</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-600 text-pretty">
                      <span className="text-[#7B2D8B] font-semibold">A</span> {r.a}
                    </p>
                    <p className="text-gray-600 text-pretty">
                      <span className="text-[#7B2D8B] font-semibold">B</span> {r.b}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              <span className="inline-block">첫 번째 줄을 예로 들면, 같은 0점이라도 앞쪽에 스트레칭을 주면 진도가 나가지 않고</span>{" "}
              <span className="inline-block">뒤쪽에 스트레칭을 주면 오히려 더 불안정해집니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">여기까지만 적습니다</h3>
            <div className="bg-white border border-gray-200 border-l-4 border-l-[#7B2D8B] rounded-2xl px-6 py-6 mb-4">
              <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed text-pretty">
                <span className="inline-block">무엇을 보고 갈랐는지,</span>{" "}
                <span className="inline-block">그 기준은 적지 않습니다.</span>
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
              <span className="inline-block">원리와 갈래는 적었습니다.</span>{" "}
              <span className="inline-block">기준선, 실제 동작, 회차 구성은 이 문서에 넣지 않습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">글로 옮길 수 있는 데까지 적었고,</span>{" "}
              <span className="inline-block">나머지는 몸으로 확인해야 하는 부분입니다.</span>
            </p>
          </div>
        </section>

        {/* 7. 하지 않는 것 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="7" title="하지 않는 것" />

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">7-1. 원칙으로 하지 않는 것</h3>
            <div className="space-y-3 mb-4">
              {NOT_DOING.map((item) => (
                <div key={item.text[0]} className="flex items-start gap-3 bg-[#FAF5FB] rounded-xl px-5 py-4 border border-purple-100">
                  <span aria-hidden className="text-[#7B2D8B] font-bold shrink-0">✕</span>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed text-pretty">
                    {item.bold && (
                      <>
                        <strong className="inline-block text-gray-900">{item.bold}</strong>{" "}
                      </>
                    )}
                    <Chunks parts={item.text} />
                  </p>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">7-2. 해봤고 남기지 않은 것</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <Chunks parts={["방법을 정하는 과정에서", "실제로 해보고 버린 것들입니다.", "기록으로 남깁니다."]} />
            </p>
            <div className="space-y-4 mb-6">
              {REJECTED_METHODS.map((m) => (
                <div key={m.method} className="bg-[#FAF5FB] rounded-2xl p-6 border border-purple-100">
                  <p className="font-bold text-gray-900 mb-2 text-pretty">· {m.method}</p>
                  <p className="text-gray-500 text-sm md:text-base text-pretty">
                    → <Chunks parts={m.result} />
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-800 text-pretty">
              지금 하는 방식은 이렇게 걸러지고 남은 것입니다.
            </p>
          </div>
        </section>

        {/* 8. 한계 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="8" title="한계" />

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">8-1. 아직 기준이 서지 않은 것</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <Chunks parts={["발이 도는 방향과 골반이 도는 방향이", "서로 어긋나는 경우가 있습니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <Chunks parts={["과하게 보상해서", "오히려 반대로 틀어진 경우도 있습니다."]} />
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              평가할 때 이런 케이스는 아직 저희도 헷갈립니다.
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">8-2. 그래서 이렇게 합니다</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              평가가 틀렸을 가능성을 열어두고 시작합니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">알고 있는 걸 총동원해서 시켜보고,</span>{" "}
              <span className="inline-block">평가가 맞았는지 그 자리에서 확인하고,</span>{" "}
              <span className="inline-block">틀렸으면 바로 고칩니다.</span>
            </p>
            <p className="text-gray-900 font-bold leading-relaxed mb-2 text-pretty">
              <span className="inline-block">이 방법은 아직 완성되지 않았습니다.</span>{" "}
              <span className="inline-block">계속 고치고 있습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              기록이 쌓이는 만큼 8-1의 목록은 줄어듭니다.
            </p>
          </div>
        </section>

        {/* 9. 개정 이력 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="9" title="개정 이력" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">버전</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">시점</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {REVISIONS.map((r) => (
                    <tr key={r.version} className="border-b border-gray-100">
                      <td className={`py-3 px-3 font-bold whitespace-nowrap ${r.current ? "text-[#7B2D8B]" : "text-gray-500"}`}>
                        {r.version}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{r.when}</td>
                      <td className="py-3 px-3 text-gray-600">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 부속: 쌓고 있는 기록 (연구노트) */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-balance">
              쌓고 있는 기록
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              40~50대 여성 회원 {report4050.sampleSize}명의 실측 데이터를 익명으로 모아 정리하고 있습니다.
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

        {/* 부속: 부위별 기록 — 감별 카드 확정 전까지는 빈 슬롯 */}
        {MOVEMENT_CARDS.length > 0 && (
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-balance">
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

        {/* [끝] 한 줄 링크 */}
        <section className="py-12 md:py-16 px-4 border-t border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-pretty">
              <span className="inline-block">읽고 자기 몸이 어느 쪽인지 궁금하시면</span>{" "}
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
