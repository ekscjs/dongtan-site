import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, type Post } from "@/lib/supabase";
import { report4050, findings4050 } from "../data";
import FindingsGrid from "../FindingsGrid";

export const revalidate = 3600;

const SITE = "https://www.bodymiso.com";
const PAGE_URL = `${SITE}/research-notes/${report4050.slug}`;
const TITLE = `${report4050.title} | 내몸에미소`;
const DESC = `바디닷 3D 체형측정으로 기록한 40~59세 여성 회원 ${report4050.sampleSize}명의 체형·움직임 관찰 데이터. 표본 크기와 수집 방법을 함께 공개합니다.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESC, url: PAGE_URL, type: "article", locale: "ko_KR" },
};

const RELATED_KEYWORDS = ["거북목", "라운드숄더", "골반", "체형", "40대", "50대", "여성", "자세"];

async function getRelatedClinicalNotes(): Promise<Pick<Post, "title" | "slug" | "excerpt" | "tag">[]> {
  const { data } = await supabase
    .from("posts")
    .select("title, slug, excerpt, tag")
    .eq("published", true)
    .eq("tag", "임상노트")
    .order("created_at", { ascending: false })
    .limit(30);
  const all = data ?? [];
  const matched = all.filter((p) => RELATED_KEYWORDS.some((k) => p.title.includes(k)));
  return (matched.length ? matched : all).slice(0, 3);
}

export default async function Report4050Page() {
  const related = await getRelatedClinicalNotes();

  const reportLd = {
    "@context": "https://schema.org",
    "@type": ["Report", "Article"],
    headline: report4050.title,
    description: DESC,
    datePublished: "2026-07-20",
    dateModified: report4050.lastUpdated,
    mainEntityOfPage: PAGE_URL,
    author: { "@type": "Person", name: "박미소", jobTitle: "원장", url: `${SITE}/about` },
    publisher: {
      "@type": "Organization",
      name: "내몸에미소",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reportLd) }} />
      <Header />
      <main className="pt-10 pb-16 md:pt-14 md:pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/research-notes" className="text-sm text-gray-400 hover:text-[#7B2D8B] mb-6 inline-block">
            ← 연구노트 목록으로
          </Link>

          {/* 1. 도입부 */}
          <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">연구노트</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {report4050.title}
          </h1>
          <p className="text-gray-500 mb-2">표본 {report4050.sampleSize}명 · {report4050.collectingSince}부터 축적</p>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-12">
            내몸에미소를 방문한 40~59세 여성 회원의 체형·움직임 측정 결과를 모으고 있습니다. 아직 표본이 크지 않은 <strong>초기 관찰 기록</strong>이며, 방문 회원이 늘어날수록 계속 업데이트됩니다.
          </p>

          {/* 2. 데이터 출처/방법론 */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">데이터는 이렇게 모았습니다</h2>
            <div className="bg-[#FAF5FB] rounded-2xl p-6 space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <p><strong className="text-gray-900">측정 도구</strong> — 바디닷(bodydot) 3D 체형측정기</p>
              <p><strong className="text-gray-900">수집 기간</strong> — {report4050.collectingSince}부터 현재까지</p>
              <p><strong className="text-gray-900">표본</strong> — 내몸에미소 방문 회원 중 40~59세 여성 {report4050.sampleSize}명 (전체 각도 측정 6명 + 부분 측정 4명)</p>
              <p><strong className="text-gray-900">익명화</strong> — 이름·연락처 등 식별 정보는 모두 제외하고, 연령·성별·측정 수치만 남겼습니다</p>
            </div>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-4">
              이 수치는 <strong>내몸에미소를 방문한 회원 기준의 관찰 데이터</strong>이며, 4050 여성 전체를 대표하는 통계가 아닙니다. 항목별로 측정된 인원 수(N)가 다르니, 아래 각 수치의 N을 함께 확인해 주세요.
            </p>
          </section>

          {/* 3. 핵심 발견 */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">관찰된 평균 수치</h2>
            <p className="text-gray-500 text-sm md:text-base mb-6">
              측정된 각도·점수의 평균입니다. 정상 범위와 비교한 값이 아니라, 저희가 실제로 측정한 값 그대로입니다.
            </p>
            <FindingsGrid findings={findings4050} />
          </section>

          {/* 4. 실제 사례 연결 */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">이 수치, 실제 사례로 보면</h2>
              <div className="space-y-2.5">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="block rounded-xl border border-gray-100 px-4 py-3 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
                  >
                    <p className="font-semibold text-sm md:text-base text-gray-900 line-clamp-1">{p.title}</p>
                    {p.excerpt && <p className="text-xs md:text-sm text-gray-500 mt-0.5 line-clamp-1">{p.excerpt}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 5. 왜 중요한지 */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">왜 4050 여성 체형을 따로 봐야 할까요</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              40대 후반부터는 호르몬 변화와 함께 근육량이 줄고 자세를 버텨주던 힘이 약해지면서, 거북목·라운드숄더·골반 정렬 같은 체형 문제가 한꺼번에 겹쳐서 나타나는 경우가 많습니다. 젊었을 때와 같은 방식으로 접근하면 오히려 무릎이나 허리에 부담이 될 수 있어서, 원인을 먼저 측정하고 그에 맞게 운동 순서를 정하는 게 중요합니다. 이 리포트는 그 원인을 숫자로 기록해두는 작업입니다.
            </p>
          </section>

          {/* 7. 업데이트 표시 */}
          <div className="border-t border-gray-100 pt-6 flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            표본 {report4050.sampleSize}명 · 마지막 업데이트 {report4050.lastUpdated} · 다음 업데이트 예정 {report4050.nextUpdate}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
