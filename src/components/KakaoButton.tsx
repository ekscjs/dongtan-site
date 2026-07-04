"use client";

import { usePathname } from "next/navigation";
import { getOrCreateVisitorId, getOrCreateSessionId } from "@/lib/visitor";

interface KakaoButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function KakaoButton({ className, children }: KakaoButtonProps) {
  const pathname = usePathname();

  const handleClick = () => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "kakao_chat_click", {
        event_category: "engagement",
        event_label: "카카오 상담 버튼",
      });
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "kakao_click",
        page: pathname,
        referrer: document.referrer || null,
        visitor_id: getOrCreateVisitorId(),
        session_id: getOrCreateSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <a
      href="http://pf.kakao.com/_XGxbMG/chat"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
