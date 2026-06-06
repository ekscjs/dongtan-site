import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "건강 정보 | 내몸에미소 동탄",
  description: "허리, 무릎, 어깨 통증과 체형교정에 관한 전문 건강 정보를 제공합니다.",
};

// 나중에 MDX나 CMS로 교체 가능한 더미 데이터
const posts = [
  {
    slug: "waist-pain-cause",
    title: "오래 앉아 있으면 허리가 아픈 이유 — 근육 문제인가, 자세 문제인가",
    desc: "허리 통증의 가장 흔한 원인과, 병원 말고 운동으로 해결할 수 있는 경우를 설명합니다.",
    tag: "허리",
    date: "2025.06",
  },
  {
    slug: "knee-pain-stairs",
    title: "계단 내려갈 때 무릎이 아프다면 — 원인과 개선 방법",
    desc: "무릎 통증이 생기는 원인과 일상에서 할 수 있는 기능개선 운동을 소개합니다.",
    tag: "무릎",
    date: "2025.06",
  },
  {
    slug: "turtle-neck-fix",
    title: "거북목, 스트레칭만으로 고칠 수 없는 이유",
    desc: "거북목의 진짜 원인은 목이 아닙니다. 체형교정 관점에서 설명합니다.",
    tag: "체형교정",
    date: "2025.05",
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">건강 정보</h1>
          <p className="text-gray-500 mb-12">몸의 불편함을 이해하는 데 도움이 되는 정보를 드립니다</p>

          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="border-b border-gray-100 pb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full">
                    {post.tag}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#7B2D8B]">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">{post.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
