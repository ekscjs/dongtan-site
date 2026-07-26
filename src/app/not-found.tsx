import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 | 내몸에미소",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-10">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/blog"
              className="bg-[#7B2D8B] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#6a2678] transition-colors"
            >
              블로그 글 보기 →
            </Link>
            <Link
              href="/"
              className="border border-gray-200 text-gray-600 rounded-full px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
