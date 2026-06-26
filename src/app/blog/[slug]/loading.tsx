import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-5/6", "w-2/3", "w-full", "w-4/5"];

export default function BlogPostLoading() {
  return (
    <>
      <Header />
      <main className="pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto animate-pulse">
          {/* 목록으로 */}
          <div className="h-4 w-20 bg-gray-200 rounded mb-8" />

          {/* 태그 + 날짜 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>

          {/* 제목 */}
          <div className="space-y-3 mb-4">
            <div className="h-8 bg-gray-200 rounded w-4/5" />
            <div className="h-8 bg-gray-200 rounded w-2/3" />
          </div>

          {/* 요약 */}
          <div className="border-l-4 border-gray-200 pl-4 mb-10 space-y-2">
            <div className="h-5 bg-gray-100 rounded w-full" />
            <div className="h-5 bg-gray-100 rounded w-3/4" />
          </div>

          {/* 본문 스켈레톤 */}
          <div className="space-y-4">
            {LINE_WIDTHS.map((w, i) => (
              <div key={i} className={`h-4 bg-gray-100 rounded ${w}`} />
            ))}
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
