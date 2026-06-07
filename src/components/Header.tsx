"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navLinks = [
  { href: "/about", label: "센터 소개" },
  { href: "/programs", label: "프로그램" },
  { href: "/blog", label: "칼럼" },
  { href: "/check", label: "몸 상태 체크" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <a href="http://pf.kakao.com/_XGxbMG/chat" target="_blank" rel="noopener noreferrer"
            className="bg-[#7B2D8B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#9B4DAB] transition-colors">
            무료 상담
          </a>
        </nav>

        {/* Mobile button */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm text-gray-600 font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href="http://pf.kakao.com/_XGxbMG/chat" target="_blank" rel="noopener noreferrer"
            className="bg-[#7B2D8B] text-white text-sm font-semibold px-5 py-3 rounded-full text-center">
            무료 상담
          </a>
        </div>
      )}
    </header>
  );
}
