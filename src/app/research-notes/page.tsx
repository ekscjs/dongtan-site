import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BarChartIcon } from "@/components/Icons";
import { report4050 } from "./data";

const SITE = "https://www.bodymiso.com";
const TITLE = "연구노트 | 내몸에미소 동탄";
const DESC =
  "내몸에미소가 바디닷 3D 체형측정으로 쌓아온 회원 관찰 데이터를 정리합니다. 익명화된 실측 기록이며, 표본 규모와 한계를 함께 밝힙니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE}/research-notes` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE}/research-notes`, type: "website", locale: "ko_KR" },
};

const reports = [report4050];

export default function ResearchNotesHub() {
  return (
    <>
      <Header />
      <main className="pt-12 pb-16 md:pt-16 md:pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">연구노트</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            내몸에미소가 직접 쌓은<br />체형 데이터 기록
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
            방문 회원의 바디닷 3D 체형측정 결과를 익명화해서 모아둔 관찰 기록입니다. 표본이 아직 크지 않은 초기 단계이고, 리포트마다 정확한 수집 방법과 한계를 함께 밝힙니다.
          </p>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-12">
            전체 인구를 대표하는 통계가 아니라, 내몸에미소를 방문한 회원 기준의 실측 데이터입니다. 분기마다 갱신합니다.
          </p>

          <div className="space-y-4">
            {reports.map((r) => (
              <Link
                key={r.slug}
                href={`/research-notes/${r.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF5FB] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
                    <BarChartIcon className="text-[#7B2D8B] group-hover:text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{r.title}</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-2">{r.summary}</p>
                    <p className="text-xs text-gray-400">표본 {r.sampleSize}명 · 마지막 업데이트 {r.lastUpdated}</p>
                  </div>
                  <span className="text-gray-300 text-xl shrink-0">›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
