"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareIcon } from "@/components/Icons";

// 버튼을 띄우지 않을 경로
const HIDDEN_PREFIXES = ["/ask", "/admin"];

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
}

export default function AskFloatingButton() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <Link
      href="/ask"
      onClick={() => track("ask_floating_click", { from: pathname })}
      aria-label="미소코치에게 물어보기"
      className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-[#7B2D8B] px-4 py-3 text-white shadow-lg
                 transition-colors hover:bg-[#6a2578] md:bottom-8 md:right-8 md:px-5 md:py-4"
    >
      <MessageSquareIcon size={20} className="shrink-0" />
      <span className="text-sm font-bold md:text-base">미소코치</span>
    </Link>
  );
}
