"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem("_miso_vid");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("_miso_vid", vid);
    }
    return vid;
  } catch {
    return "unknown";
  }
}

function getOrCreateSessionId(): string {
  try {
    const key = "_miso_sid";
    const tsKey = "_miso_sid_ts";
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

    const now = Date.now();
    const lastTs = parseInt(sessionStorage.getItem(tsKey) ?? "0");
    let sid = sessionStorage.getItem(key);

    if (!sid || now - lastTs > SESSION_TIMEOUT) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(key, sid);
    }
    sessionStorage.setItem(tsKey, String(now));
    return sid;
  } catch {
    return "unknown";
  }
}

function isNewVisitor(): boolean {
  try {
    const key = "_miso_visited";
    const visited = localStorage.getItem(key);
    if (!visited) {
      localStorage.setItem(key, "1");
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

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
