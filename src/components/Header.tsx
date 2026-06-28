"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import KakaoButton from "@/components/KakaoButton";

const navLinks = [
  { href: "/about", label: "센터 소개" },
  { href: "/programs", label: "프로그램" },
  { href: "/blog", label: "칼럼" },
  { href: "/check", label: "몸 상태 체크" },
  { href: "/class/breathing", label: "바디 리셋 세션" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  // 메뉴 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/">
          <Image src="/logo.png" alt="내몸에미소 로고" width={160} height={48} className="object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm text-gray-600 hover:text-[#7B2D8B] transition-colors font-medium">
              {link.label}
            </Link>
          ))}
          <KakaoButton className="bg-[#7B2D8B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#9B4DAB] transition-colors">
            무료 상담
          </KakaoButton>
        </nav>

        {/* Mobile 햄버거 */}
        <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile 풀스크린 오버레이 메뉴 */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden">
          {/* 상단 바 */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <Link href="/" onClick={close}>
              <Image src="/logo.png" alt="내몸에미소 로고" width={160} height={48} className="object-contain" />
            </Link>
            <button onClick={close} className="text-gray-700 p-1" aria-label="메뉴 닫기">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex-1 flex flex-col px-6 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="text-2xl font-bold text-gray-900 py-5 border-b border-gray-100 flex items-center justify-between active:text-[#7B2D8B]"
              >
                {link.label}
                <span className="text-gray-300 text-xl font-normal">›</span>
              </Link>
            ))}
          </nav>

          {/* 하단 고정 CTA */}
          <div className="px-6 pb-9 pt-4">
            <KakaoButton className="block w-full text-center bg-[#7B2D8B] text-white text-base font-bold py-4 rounded-full hover:bg-[#9B4DAB] transition-colors">
              무료 상담 받기
            </KakaoButton>
            <p className="text-center text-xs text-gray-400 mt-3">
              동탄 지성로 134 5층 · 평일 10:00–22:00
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
