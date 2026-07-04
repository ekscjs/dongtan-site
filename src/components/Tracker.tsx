"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateVisitorId, getOrCreateSessionId, isNewVisitor } from "@/lib/visitor";

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 봇 제외 (Lighthouse, HeadlessChrome, PageSpeed 포함)
    if (typeof navigator !== "undefined" && /bot|crawl|spider|prerender|headless|lighthouse|pagespeed/i.test(navigator.userAgent)) {
      return;
    }
    // 관리자 제외 — admin_flag 쿠키가 있으면 트래킹 안 함 (admin_auth는 httpOnly라 JS에서 못 읽음)
    if (document.cookie.split(";").some((c) => c.trim() === "admin_flag=1")) {
      return;
    }

    const visitor_id = getOrCreateVisitorId();
    const session_id = getOrCreateSessionId();
    const is_new = isNewVisitor();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        referrer: document.referrer || null,
        visitor_id,
        session_id,
        is_new_visitor: is_new,
      }),
      // 페이지 이동 시에도 전송 보장
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
