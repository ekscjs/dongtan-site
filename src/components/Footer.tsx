import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">내몸에미소</p>
            <p className="text-sm">기능개선 · 재활 · 체형교정 전문</p>
          </div>
          <div className="text-sm space-y-1">
            <p>경기도 화성시 동탄 지성로 134 5층</p>
            <p>카카오톡 채널: 내몸에미소</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center space-y-2">
          <div>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
              개인정보처리방침
            </Link>
          </div>
          <p>© 내몸에미소. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
