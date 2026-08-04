import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BarChartIcon } from "@/components/Icons";
import { report4050 } from "@/app/research-notes/data";

const SITE = "https://www.bodymiso.com";
const TITLE = "미소 운동법 v1.1 — 내몸에미소가 몸을 보는 방식 | 동탄";
const DESC =
  "아픈 곳은 대개 범인이 아니다. 정렬부터 알아차리기까지 다섯 단계로 몸을 되돌리는 순서 — 내몸에미소가 회원 200여 명의 기록에서 정리한 운동 방법론 v1.1.";

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
  headline: "미소 운동법 v1.1 — 내몸에미소가 몸을 보는 방식",
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
  dateModified: "2026-08-04",
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
  ["부위가 어디든", "밟는 순서는 하나다"],
  ["우리가 하지 않는 일을 분명히 한다"],
];

const PROCEDURE_STEPS: { label: string; desc: string[] }[] = [
  {
    label: "정렬",
    desc: [
      "운동을 시작하기 전에",
      "골반과 흉곽을 제자리에 놓습니다.",
      "교정이라는 말과는 좀 다릅니다.",
      "몸은 습관 때문에 계속 그 자리에 틀어져 있고,",
      "그 상태로 움직이면 찝힙니다.",
      "골반이 돌아간 분에게 엉덩이 운동을 그대로 시키면",
      "바로 찝히는 느낌이 옵니다.",
      "그래서 조금이라도 돌려놓고,",
      "한쪽이 힘을 더 쓰지 않게 막아놓고 시작합니다.",
      "불편한 쪽이 오히려 힘을 더 쓰는 경우가 많습니다.",
    ],
  },
  {
    label: "깨우기",
    desc: [
      "빈 깡통을 찾아 그 자리를 깨웁니다.",
      "무게는 쓰지 않습니다.",
      "무게 없이 힘들게 만드는 방법을 총동원합니다.",
      "근육을 키우는 건 이 단계의 목표가 아닙니다.",
      "불균형이 있는 채로 키우면 불균형만 커집니다.",
    ],
  },
  {
    label: "알려주기",
    desc: [
      "움직임을 알려주고,",
      "지금 어디를 쓰고 있는지 하나하나 짚어줍니다.",
      "거북목과 라운드숄더가 있는 분은",
      "가슴을 펴는 게 안 됩니다.",
      "흉곽이 안 움직이니까요.",
      "그런 분에게는",
      "“팔이 움직이고 있는 것 같지만",
      "지금 움직이는 건 흉추다”까지 말로 짚어주고,",
      "손을 대서 그 자리를 느끼게 합니다.",
    ],
  },
  {
    label: "저항",
    desc: ["여기까지 되면 저항 운동이 들어갑니다.", "무게는 중요하지 않습니다.", "이 단계가 목적지도 아닙니다."],
  },
  {
    label: "알아차리기",
    desc: [
      "본인이 스스로 눈치채고 고치는 단계입니다.",
      "생활 습관까지 여기에 들어갑니다.",
      "이게 되면 저희 없이도 굴러갑니다.",
    ],
  },
];

const BODY_ORDER = ["① 코어", "② 골반", "③ 상체", "④ 말단"];

const AWAKEN_SPOTS = ["하복부", "엉덩이 속근육", "등 속근육", "옆구리", "견갑 주변", "다리를 모으는 근육"];

const DISCERN_ROWS = [
  { same: "오버헤드 스쿼트 0점", a: "애초에 그 높이까지 올라가지 않음", b: "올라가지만 버티지 못함" },
  { same: "무릎이 안쪽으로 쏠림", a: "위에서 내려온 원인 (고관절)", b: "아래에서 올라온 원인 (발)" },
  { same: "유연해 보임", a: "실제로 가동성이 좋음", b: "못 버텨서 범위가 넓어 보임" },
  { same: "가동 범위는 좋은데 아픔", a: "자기 범위 안에서 못 버팀", b: "자기 범위를 넘겨서 씀" },
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
  {
    method: "약해 보이는 근육만 골라 강화한다",
    result: [
      "어깨가 아플 때 회전근개가 약한 탓으로 보고",
      "그 자리만 강화해봤습니다.",
      "더 아팠습니다.",
      "몸이 틀어진 상태에서 한 자리만 강화하면",
      "틀어진 채로 더 굳습니다.",
      "그 순간에는 시원합니다.",
      "잠깐 좋아진 것 같다가 돌아갑니다.",
    ],
  },
  {
    method: "힘을 쓰지 않는 스트레칭으로 범위를 늘린다",
    result: [
      "힘 없이 쭉 늘리면",
      "몸이 위험하다고 느끼고 오히려 더 줄어듭니다.",
      "늘리려면 힘을 실어서,",
      "근력 운동처럼 조금씩 늘려야 합니다.",
      "그냥 늘린 날은 금방 돌아오고,",
      "힘을 쓰면서 한 날은 이틀이고 삼일이고 유지됩니다.",
    ],
  },
];

const REVISIONS: { version: string; when: string; desc: string[]; current: boolean }[] = [
  { version: "v1.0", when: "2026.07", desc: ["첫 공개"], current: false },
  {
    version: "v1.1",
    when: "2026.08",
    desc: ["무엇을 만들려고 하는지", "절차 다섯 단계", "알아차리기", "어디서 왔는가"],
    current: true,
  },
  { version: "v1.2", when: "예정", desc: ["어디가 아플 때 원인이 주로 어디인지"], current: false },
  { version: "v2.0", when: "예정", desc: ["40~50대 여성 체형 측정에서 실제로 나온 것"], current: false },
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

// 단계 화살표 — 데스크톱은 가로, 모바일은 세로로 떨어지게 (→를 90도 회전)
function StepArrows({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-2 mb-6">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-col md:flex-row items-center gap-2">
          <span className="bg-[#7B2D8B] text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-full">
            {label}
          </span>
          {i < labels.length - 1 && (
            <span aria-hidden className="text-gray-300 text-xl rotate-90 md:rotate-0">
              →
            </span>
          )}
        </div>
      ))}
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
            <p className="text-gray-400 text-xs font-semibold mb-6">Ver 1.1 · 2026년 8월</p>
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
              <span className="inline-block">회원 200여 명, 임상 기록 40여 편에서 반복해서 나온 판단을 뽑아 이름을 붙였습니다.</span>{" "}
              <span className="inline-block">새로 만든 건 없습니다.</span>{" "}
              <span className="inline-block">이미 하고 있던 걸 적었습니다.</span>
            </p>
          </div>
        </section>

        {/* 0. 무엇을 만들려고 하는가 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="0" title="무엇을 만들려고 하는가" />

            <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-6 text-pretty">
              <Chunks
                parts={[
                  "저희가 목표로 하는 상태는,",
                  "회원이 저희 없이도",
                  "자기 몸을 수정할 수 있게 되는 것입니다.",
                ]}
              />
            </p>

            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <span className="inline-block">통증이 0이 되는 것도, 무게를 얼마나 드는 것도,</span>{" "}
              <span className="inline-block">각도가 정상 범위에 들어오는 것도 아닙니다.</span>{" "}
              <span className="inline-block">그것들은 지나가는 자리입니다.</span>{" "}
              <span className="inline-block">저희가 “이제 됐다”고 보는 순간은 다릅니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">허리로 오래 고생하다 오신 분이 있습니다.</span>{" "}
              <span className="inline-block">처음엔 앞으로 숙이는 동작이 전혀 안 됐고,</span>{" "}
              <span className="inline-block">골반이 심하게 꺾인 채로 굳어 있었습니다.</span>{" "}
              <span className="inline-block">지금은 숙이는 게 됩니다.</span>{" "}
              <span className="inline-block">그런데 원장이 “됐다”고 말한 근거는 그게 아니었습니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">이분이 어느 날 이렇게 말했습니다.</span>{" "}
              <strong className="inline-block text-gray-900">“선생님, 이거 집에서 이렇게 하면 되겠네.”</strong>
            </p>

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">그전까지는 호흡 운동 정도만 하시라고,</span>{" "}
              <span className="inline-block">다른 건 하지 마시라고 말렸습니다.</span>{" "}
              <span className="inline-block">지금은 혼자 하셔도 걱정이 되지 않습니다.</span>{" "}
              <span className="inline-block">자기 몸이 어디로 틀어졌는지 알아차리고,</span>{" "}
              <span className="inline-block">뭐가 잘못됐는지 먼저 말하고,</span>{" "}
              <span className="inline-block">스스로 고쳐서 움직입니다.</span>
            </p>

            <p className="text-gray-900 font-bold leading-relaxed mb-6 text-pretty">
              <span className="inline-block">여기까지 오면 저희가 없어도 됩니다.</span>{" "}
              <span className="inline-block">다른 곳에 가서도 자기 몸을 아니까 거기에 맞춰 움직입니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">그래서 이 문서의 절차는 무게를 얹는 데서 끝나지 않습니다.</span>{" "}
              <span className="inline-block">마지막 단계는 사람을 내보내는 일입니다.</span>{" "}
              <span className="inline-block">5장 절차의 다섯 번째가 그것입니다.</span>
            </p>
          </div>
        </section>

        {/* 1. 정의 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
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
        <section className="py-12 md:py-16 px-4">
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
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
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
                <h3 className="text-lg font-bold text-[#7B2D8B] mb-3">알아차리기</h3>
                <p className="text-gray-900 font-bold leading-relaxed mb-3 text-pretty">
                  <Chunks
                    parts={[
                      "자기 몸이 지금 어떻게 움직이고 있는지를",
                      "스스로 눈치채고,",
                      "그 자리에서 고치는 것.",
                    ]}
                  />
                </p>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <span className="inline-block">허리를 잔뜩 구부리고 앉아 있다가</span>{" "}
                  <span className="inline-block">“아, 이렇게 앉지 말라고 했지” 하고 다시 앉습니다.</span>{" "}
                  <span className="inline-block">걷다가 오른쪽 무릎이 불편해지면</span>{" "}
                  <span className="inline-block">“이렇게 걷지 말라고 했지” 하고 걸음을 고칩니다.</span>{" "}
                  <span className="inline-block">큰 힘을 쓰는 일이 아닙니다.</span>{" "}
                  <span className="inline-block">이게 알아차리기입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                  <strong className="inline-block text-gray-900">이게 되는 분과 안 되는 분의 차이가 가장 큽니다.</strong>{" "}
                  <span className="inline-block">되는 분은 배우는 속도가 빨라지고,</span>{" "}
                  <span className="inline-block">안 되는 분은 아무리 해도 매번 원점으로 돌아갑니다.</span>{" "}
                  <span className="inline-block">센터에서 잘 됐다고 해서</span>{" "}
                  <span className="inline-block">집에 가서도 되는 건 아니기 때문입니다.</span>
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  <span className="inline-block">무릎이 불편하다던 분이</span>{" "}
                  <span className="inline-block">걸으면서 계속 이걸 의식하기 시작했습니다.</span>{" "}
                  <span className="inline-block">대단한 운동을 한 게 아닌데도</span>{" "}
                  <span className="inline-block">불편함이 줄고 걸음이 수정되는 게</span>{" "}
                  <span className="inline-block">느껴진다고 하셨습니다.</span>
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
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="4" title="원칙" />
            <ul className="space-y-3 mb-6">
              {PRINCIPLES.map((p, i) => (
                <li key={p.join("")} className="flex gap-3 bg-[#FAF5FB] rounded-xl border border-gray-100 px-5 py-4">
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
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="5" title="절차" />

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-1. 큰 순서</h3>
              <StepArrows labels={PROCEDURE_STEPS.map((s) => s.label)} />
              <div className="space-y-4">
                {PROCEDURE_STEPS.map((s) => (
                  <div key={s.label} className="flex gap-4">
                    <span className="shrink-0 font-bold text-[#7B2D8B] w-28">{s.label}</span>
                    <p className="text-gray-600 leading-relaxed text-pretty">
                      <Chunks parts={s.desc} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-2. 매 회차 앞에 다시 놓는 것</h3>
              <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                <strong className="inline-block text-gray-900">②는 한 번 하고 끝나지 않습니다.</strong>{" "}
                <span className="inline-block">한 번 됐던 자리도 다시 잊습니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">그래서 운동을 시작하기 전에</span>{" "}
                <span className="inline-block">매번 다시 깨우고 들어갑니다.</span>{" "}
                <span className="inline-block">경력자든 아니든 똑같습니다.</span>
              </p>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-3. 몸을 잡는 순서</h3>
              <StepArrows labels={BODY_ORDER} />
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

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-4. 깨우는 자리</h3>
              <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
                <span className="inline-block">깨워야 할 자리는 그렇게 많지 않습니다.</span>{" "}
                <span className="inline-block">몸 전체를 만지지 않습니다.</span>{" "}
                <span className="inline-block">실제로 비어 있는 자리는 대개 정해져 있습니다.</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-white rounded-2xl px-5 py-5 mb-4">
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
              <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
                <span className="inline-block">특히 하복부는 — 지금까지 처음부터 그 자리를 느끼신 분이</span>{" "}
                <strong className="inline-block text-gray-900">한 분도 없었습니다.</strong>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">이 자리들은 따로 떨어져 있지 않습니다.</span>{" "}
                <span className="inline-block">옆구리가 빈 분은 전거근도 골반도 하복부도 같이 못 느낍니다.</span>
              </p>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-5. 비어 있으면 무엇이 생기는가</h3>
              <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                <span className="inline-block">비어 있는 자리가 있으면 그날 당장 무슨 동작이 안 되는 건 아닙니다.</span>{" "}
                <span className="inline-block">당장은 아무 일도 일어나지 않습니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                <strong className="inline-block text-gray-900">대신 힘이 센 쪽으로만 계속 움직입니다.</strong>{" "}
                <strong className="inline-block text-gray-900">그러면 불균형이 생깁니다.</strong>{" "}
                <span className="inline-block">코어와 허벅지가 잡아주지 못하면 골반이 돌아가고,</span>{" "}
                <span className="inline-block">상체도 따라 돌아갑니다.</span>{" "}
                <span className="inline-block">그게 쌓입니다.</span>{" "}
                <span className="inline-block">세월이 지나 어느 날부터 불편해지는 분이 있고,</span>{" "}
                <span className="inline-block">끝까지 안 불편한 분도 있습니다.</span>
              </p>
              <p className="text-gray-900 font-bold leading-relaxed mb-3 text-pretty">
                문제는 그 상태로 운동을 시작할 때 생깁니다.
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">운동은 강화하는 일입니다.</span>{" "}
                <span className="inline-block">틀어진 상태에서 강화하면 틀어진 채로 굳습니다.</span>{" "}
                <span className="inline-block">반듯한 몸에 붙여놓으면 좋은 몸이 되지만,</span>{" "}
                <span className="inline-block">틀어진 몸에 그대로 붙여놓으면 문제가 됩니다.</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">5-6. 운동이 됐는지 확인하는 방법</h3>
              <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                저희는 이렇게 확인합니다.
              </p>
              <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
                <strong className="inline-block text-gray-900">운동 전에 그분이 아프다고 한 자리를 먼저 눌러봅니다.</strong>{" "}
                <strong className="inline-block text-gray-900">운동이 끝나고 같은 자리를 다시 눌러봅니다.</strong>{" "}
                <span className="inline-block">통증이 없어졌으면 그 자리에 운동이 된 겁니다.</span>{" "}
                <span className="inline-block">다음 주에도 같은 자리를 봅니다.</span>{" "}
                <span className="inline-block">계속 봅니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <span className="inline-block">누르는 건 확인하는 일입니다.</span>{" "}
                <span className="inline-block">눌러서 낫게 하는 게 아닙니다.</span>{" "}
                <span className="inline-block">계속 눌러줘도 그것만으로는 해결되지 않습니다.</span>
              </p>
            </div>
          </div>
        </section>

        {/* 6. 감별 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="6" title="감별" />
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              여기가 v1.0에서 가장 많이 바뀐 자리입니다.
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">순서는 하나, 판단은 갈립니다</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">어깨가 아파서 오셔도, 무릎이 아파서 오셔도,</span>{" "}
              <span className="inline-block">골반이 아파서 오셔도</span>{" "}
              <strong className="inline-block text-gray-900">밟는 순서는 크게 다르지 않습니다.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">운동의 기초가 없는 상태라서 몸이 아픈 것이고,</span>{" "}
              <span className="inline-block">그 기초를 세우는 일은 같습니다.</span>{" "}
              <span className="inline-block">호흡을 열고, 하복부를 깨우고,</span>{" "}
              <span className="inline-block">옆구리를 깨우고, 견갑 주변을 깨웁니다.</span>{" "}
              <span className="inline-block">누구든 거기서 반응합니다.</span>{" "}
              <span className="inline-block">그리고 돌아간 골반을 제자리에 놓고 움직입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <span className="inline-block">골반이 앞으로 꺾였든 뒤로 꺾였든 같은 기전으로 봅니다.</span>{" "}
              <span className="inline-block">꺾인 건 꺾인 겁니다.</span>{" "}
              <span className="inline-block">그걸 둘로 나눠서 다른 운동을 시키지 않습니다.</span>
            </p>
            <p className="text-gray-900 font-bold leading-relaxed mb-10 text-pretty">
              <span className="inline-block">그래서 저희가 감별하는 건 무엇을 시킬지가 아닙니다.</span>{" "}
              <span className="inline-block">어디를 원인으로 볼지입니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">판단이 갈리는 자리들</h3>

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
                    <tr key={r.same} className="border-b border-gray-100 bg-[#FAF5FB]">
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        <span className="inline-block">{r.same}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        <span className="inline-block">{r.a}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        <span className="inline-block">{r.b}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일: 세로 카드 (375px에서 가로 스크롤 대신) */}
            <div className="md:hidden space-y-3 mb-4">
              {DISCERN_ROWS.map((r) => (
                <div key={r.same} className="bg-[#FAF5FB] rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900 mb-2 text-pretty">{r.same}</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-600 text-pretty">
                      <span className="text-[#7B2D8B] font-semibold">A</span>{" "}
                      <span className="inline-block">{r.a}</span>
                    </p>
                    <p className="text-gray-600 text-pretty">
                      <span className="text-[#7B2D8B] font-semibold">B</span>{" "}
                      <span className="inline-block">{r.b}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
              네 번째 줄이 이번에 추가된 것입니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              <span className="inline-block">바른 자세를 만들려고 등을 과하게 펴고 계신 분들이 많습니다.</span>{" "}
              <span className="inline-block">그게 좋지 않습니다.</span>{" "}
              <span className="inline-block">자기 범위 이상으로 넘어가면 견갑이 뜨고,</span>{" "}
              <span className="inline-block">어깨에서 충돌이 옵니다.</span>{" "}
              <span className="inline-block">범위가 부족해서 아픈 게 아니라,</span>{" "}
              <span className="inline-block">범위를 넘겨 쓰다가 아파진 경우입니다.</span>{" "}
              <span className="inline-block">운동을 열심히 하시는 분,</span>{" "}
              <span className="inline-block">골프처럼 한쪽으로 크게 쓰는 운동을 하시는 분에게서 자주 봅니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">느꼈다고 하는데 아닌 경우</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">빈 깡통이 잡히지 않는 분이 있습니다.</span>{" "}
              <span className="inline-block">두 가지 경우가 있습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">하나는 그 자리가 너무 오래 늘어나 있어서,</span>{" "}
              <span className="inline-block">손을 대서 도와주면 조금 느끼지만</span>{" "}
              <span className="inline-block">혼자서는 못 느끼는 경우입니다.</span>{" "}
              <span className="inline-block">저희에게도 아직 안 풀린 숙제로 남아 있습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">다른 하나는 감각 자체가 무딘 경우입니다.</span>{" "}
              <span className="inline-block">팔을 양옆으로 올려보라고 하면</span>{" "}
              <span className="inline-block">한쪽이 덜 올라가 있는데도 다 올렸다고 말합니다.</span>{" "}
              <span className="inline-block">자기 팔이 어디까지 올라가 있는지를 모릅니다.</span>{" "}
              <span className="inline-block">다른 곳에서도 아무 느낌이 없다고만 하셨던 분들입니다.</span>{" "}
              <span className="inline-block">저희는 느낄 때까지 시킵니다.</span>
            </p>
            <p className="text-gray-900 font-bold leading-relaxed mb-3 text-pretty">
              <span className="inline-block">여기서 하나 더 있습니다.</span>{" "}
              <span className="inline-block">느꼈다고 말씀하시는데 실제로는 아닌 경우입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              <span className="inline-block">하복부가 느껴진다고 하시는데 같은 자리가 계속 불편하다고 합니다.</span>{" "}
              <span className="inline-block">그러면 저희는 이렇게 봅니다.</span>{" "}
              <strong className="inline-block text-gray-900">제대로 느꼈다면 그 증상이 남아 있을 이유가 없습니다.</strong>{" "}
              <span className="inline-block">다시 해보시라고 말씀드리면,</span>{" "}
              <span className="inline-block">나중에는 아닌 것 같다고 하십니다.</span>{" "}
              <span className="inline-block">느꼈다는 말과 증상이 어긋날 때는 증상을 믿습니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">여기까지만 적습니다</h3>
            <div className="bg-[#FAF5FB] border border-gray-200 border-l-4 border-l-[#7B2D8B] rounded-2xl px-6 py-6 mb-4">
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

        {/* 7. 어디서 왔는가 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="7" title="어디서 왔는가" />

            <h3 className="font-bold text-gray-900 mb-3 text-base md:text-lg">원장 자신의 몸입니다</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">이 방법은 어느 유파에서 배워 온 것이 아닙니다.</span>{" "}
              <span className="inline-block">원장 본인의 몸에서 나왔습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">원장은 자기 몸에 먼저 해보지 않은 운동을 회원에게 적용하지 않습니다.</span>{" "}
              <span className="inline-block">직접 느껴보고 “이게 이래서 문제가 되겠구나”를 확인한 다음에 씁니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">오른쪽 엉덩이가 찝혀서 엉덩이 운동을 못 하던 시기가 있었습니다.</span>{" "}
              <span className="inline-block">엉덩이가 뒤로 빠져 있는 상태에서 그 운동을 하면,</span>{" "}
              <span className="inline-block">이미 조여 있는 자리를 더 조이게 됩니다.</span>{" "}
              <span className="inline-block">그래서 찝히지 않게 하면서 할 수 있는 방법을 만들었습니다.</span>{" "}
              <span className="inline-block">왼쪽 어깨가 걸릴 때는 걸리지 않는 움직임을 찾았습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">누구나 아는 동작도 같습니다.</span>{" "}
              <span className="inline-block">클램셸은 어디서나 하지만,</span>{" "}
              <span className="inline-block">잘못하면 엉덩이가 찝히고 이상근 통증이 옵니다.</span>{" "}
              <span className="inline-block">그걸 막으면서 하는 방법이 필요합니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <strong className="inline-block text-gray-900">자기 몸에서 문제가 생긴 방식은 다른 사람에게도 똑같이 생깁니다.</strong>{" "}
              <span className="inline-block">그래서 자기 몸에서 걸린 자리는 전부 회원에게도 걸리는 자리로 봅니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-3 text-base md:text-lg">과거의 자신에게서 버린 것</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              가장 크게 바뀐 건 남의 방식이 아니라 자기 방식입니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">예전에도 코어 운동을 시켰습니다.</span>{" "}
              <span className="inline-block">시킨다고 시켰지만, 원장 본인이 그걸 못 느꼈습니다.</span>{" "}
              <span className="inline-block">그게 이렇게까지 문제가 될 거라고 생각하지 못한 채로</span>{" "}
              <span className="inline-block">계속 운동을 했습니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <span className="inline-block">지금 하는 것은 그걸 극복하는 방법입니다.</span>{" "}
              <span className="inline-block">그때 못 느꼈던 부분을 어떻게 하면 느낄 수 있는지,</span>{" "}
              <span className="inline-block">그 방법을 연구한 결과입니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-3 text-base md:text-lg">다른 길로 같은 자리에 왔습니다</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">몸의 감각을 다시 세우는 데서 출발하는 계열이 있습니다.</span>{" "}
              <span className="inline-block">자기 몸이 지금 어떻게 움직이는지를</span>{" "}
              <span className="inline-block">사람이 정확히 모른다는 전제에서 시작하는 접근들입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">저희가 그쪽에서 배워 온 것은 아닙니다.</span>{" "}
              <strong className="inline-block text-gray-900">다른 길로 걸어와서 같은 자리에 도착했습니다.</strong>{" "}
              <span className="inline-block">빈 깡통과 알아차리기가 그 자리입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              <span className="inline-block">그리고 갈라지는 지점도 분명합니다.</span>{" "}
              <span className="inline-block">그 계열은 측정을 하지 않고, 버티는 힘을 중심에 두지 않습니다.</span>{" "}
              <span className="inline-block">저희는 측정을 하고, 안정성을 축으로 놓습니다.</span>{" "}
              <span className="inline-block">감각을 되살린 다음에</span>{" "}
              <strong className="inline-block text-gray-900">버틸 수 있게 만드는 데까지</strong>{" "}
              <span className="inline-block">갑니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-3 text-base md:text-lg">측정은 판단을 대신하지 않습니다</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">측정을 시작한 뒤로 달라진 건 속도입니다.</span>{" "}
              <span className="inline-block">예전에는 만져보고 시켜보면서 유추했고,</span>{" "}
              <span className="inline-block">지금은 문제가 될 자리를 더 빨리 압니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">다만 측정은 어디를 의심할지 좁혀주는 도구입니다.</span>{" "}
              <span className="inline-block">어디가 비어 있는지는 여전히 시켜봐야 압니다.</span>{" "}
              <span className="inline-block">3장 「빈 깡통」의 그 순서는 바뀌지 않았습니다.</span>
            </p>
          </div>
        </section>

        {/* 8. 하지 않는 것 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="8" title="하지 않는 것" />

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">8-1. 원칙으로 하지 않는 것</h3>
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

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">8-2. 해봤고 남기지 않은 것</h3>
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

        {/* 9. 한계 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="9" title="한계" />

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">9-1. 아직 기준이 서지 않은 것</h3>
            <div className="space-y-4 mb-10">
              <p className="text-gray-600 leading-relaxed text-pretty">
                <strong className="inline-block text-gray-900">발과 골반의 방향이 어긋나는 경우.</strong>{" "}
                <span className="inline-block">발이 도는 방향과 골반이 도는 방향이</span>{" "}
                <span className="inline-block">서로 맞지 않을 때가 있습니다.</span>{" "}
                <span className="inline-block">과하게 보상해서 반대로 틀어진 경우도 있습니다.</span>{" "}
                <span className="inline-block">이런 케이스는 아직 저희도 헷갈립니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <strong className="inline-block text-gray-900">상체 판단.</strong>{" "}
                <span className="inline-block">하체보다 상체가 더 어렵습니다.</span>{" "}
                <span className="inline-block">아직 헷갈리는 자리가 남아 있습니다.</span>{" "}
                <span className="inline-block">견갑이 잘 움직여야 한다는 것과</span>{" "}
                <span className="inline-block">흉추의 움직임이 중요하다는 것은 분명하지만,</span>{" "}
                <span className="inline-block">그 앞단의 판단에서</span>{" "}
                <span className="inline-block">아직 확신이 서지 않는 부분이 있습니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <strong className="inline-block text-gray-900">상체와 하체를 잇는 연결.</strong>{" "}
                <span className="inline-block">위아래를 연결하는 사슬을 더 봐야 합니다.</span>{" "}
                <span className="inline-block">공부하고 있는 중입니다.</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-pretty">
                <strong className="inline-block text-gray-900">깨운 것이 풀리는 문제.</strong>{" "}
                <span className="inline-block">깨워놓은 자리가 시간이 지나면 다시 풀립니다.</span>{" "}
                <span className="inline-block">매일 관리해도 풀립니다.</span>{" "}
                <span className="inline-block">원장 본인의 몸에서도 아직 진행 중인 숙제입니다.</span>
              </p>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">9-2. 지금 시도하고 있는 것</h3>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <span className="inline-block">지금 저희 방식은 한 자리씩 따로 깨우는 방식입니다.</span>{" "}
              <span className="inline-block">하복부면 하복부, 광배면 광배.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-pretty">
              <strong className="inline-block text-gray-900">여러 자리를 한 번에 연결해서 움직이는 방식으로</strong>{" "}
              <strong className="inline-block text-gray-900">가보려 하고 있습니다.</strong>{" "}
              <span className="inline-block">대각선으로 이어지는 연결을 한 동작에서 같이 쓰는 쪽입니다.</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-pretty">
              <span className="inline-block">시켜봤더니 다들 힘들어하십니다.</span>{" "}
              <span className="inline-block">한 자리 느끼는 데도 집중이 필요한데</span>{" "}
              <span className="inline-block">여러 자리를 동시에 느껴보라고 하니 어려워하십니다.</span>{" "}
              <span className="inline-block">이제 막 시작한 단계입니다.</span>{" "}
              <span className="inline-block">되는지 안 되는지는 해보고 적겠습니다.</span>
            </p>

            <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">9-3. 그래서 이렇게 합니다</h3>
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
            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              기록이 쌓이는 만큼 9-1의 목록은 줄어듭니다.
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">원장은 이렇게 말합니다.</span>{" "}
              <strong className="inline-block text-gray-900">무조건이라는 건 없습니다.</strong>{" "}
              <span className="inline-block">더 나은 방법이 있으면 그걸 받아들이는 게 맞습니다.</span>{" "}
              <span className="inline-block">앞으로도 계속 바뀔 겁니다.</span>
            </p>
          </div>
        </section>

        {/* 10. 이 방법을 쓰려는 분께 */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="10" title="이 방법을 쓰려는 분께" />

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">이 문서를 읽고 자기 회원에게 써보려는 분이 있을 수 있습니다.</span>{" "}
              <span className="inline-block">그래서 미리 적어둡니다.</span>{" "}
              <strong className="inline-block text-gray-900">문서만 읽고는 안 됩니다.</strong>
            </p>

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <span className="inline-block">레시피를 그대로 줘도 요리가 되는 사람과 안 되는 사람이 있습니다.</span>{" "}
              <span className="inline-block">움직임을 보고 알아차리는 눈이 필요하고,</span>{" "}
              <span className="inline-block">그건 문장으로 넘어가지 않습니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed mb-4 text-pretty">
              <strong className="inline-block text-gray-900">먼저 자기 몸에서 겪어봐야 합니다.</strong>{" "}
              <span className="inline-block">보고 있으면 “저 자리가 느껴지겠구나” 하는 짐작은 됩니다.</span>{" "}
              <span className="inline-block">그런데 그게 어떤 느낌인지는 겪어보지 않으면 모릅니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              <span className="inline-block">저희도 이 일을 하면서 못 느끼는 자리가 있었습니다.</span>{" "}
              <span className="inline-block">전문가라는 사람이 못 느끼는데,</span>{" "}
              <span className="inline-block">처음 오신 분은 얼마나 더 못 느끼겠습니까.</span>{" "}
              <span className="inline-block">그래서 저희가 계속 찾는 건 하나입니다.</span>{" "}
              <span className="inline-block">어떻게 하면 더 쉽게 전달될까.</span>{" "}
              <span className="inline-block">단계를 더 낮춰서라도 그렇게 갑니다.</span>
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">직접 몸으로 겪어보시려면</span>{" "}
              <Link
                href="/class/breathing"
                className="inline-block text-[#7B2D8B] font-semibold underline underline-offset-2 hover:text-[#6a2578]"
              >
                바디 리셋 세션
              </Link>
              <span className="inline-block">이 그 과정입니다.</span>{" "}
              <span className="inline-block">4주 동안 1:1로 진행하고,</span>{" "}
              <span className="inline-block">트레이너·강사분들도 같은 과정으로 오십니다.</span>
            </p>
          </div>
        </section>

        {/* 11. 개정 이력 */}
        <section className="py-12 md:py-16 px-4 bg-[#FAF5FB]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading n="11" title="개정 이력" />
            <div className="overflow-x-auto mb-8">
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
                      <td className={`py-3 px-3 font-bold whitespace-nowrap align-top ${r.current ? "text-[#7B2D8B]" : "text-gray-500"}`}>
                        {r.version}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap align-top">{r.when}</td>
                      <td className="py-3 px-3 text-gray-600">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {r.desc.map((d, i) => (
                            <span key={d} className="flex items-center gap-2">
                              <span className="whitespace-nowrap">{d}</span>
                              {i < r.desc.length - 1 && <span aria-hidden className="text-gray-300">·</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mb-2 text-pretty">
              v1.1에서 고친 것 중 가장 큰 것을 적어둡니다.
            </p>
            <p className="text-gray-600 leading-relaxed text-pretty">
              <span className="inline-block">v1.0은 절차의 마지막을 무게 얹기로 적었습니다.</span>{" "}
              <span className="inline-block">그건 저희가 실제로 하는 일이 아니었습니다.</span>{" "}
              <span className="inline-block">회원이 저희 없이 자기 몸을 수정할 수 있게 되는 것이 마지막입니다.</span>{" "}
              <span className="inline-block">그걸 고쳤습니다.</span>
            </p>
          </div>
        </section>

        {/* 부속: 쌓고 있는 기록 (연구노트) */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-balance">
              쌓고 있는 기록
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-pretty">
              40~50대 여성 회원 {report4050.sampleSize}명의 실측 데이터를 익명으로 모아 정리하고 있습니다.
            </p>
            <Link
              href="/research-notes"
              className="block bg-[#FAF5FB] rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
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
