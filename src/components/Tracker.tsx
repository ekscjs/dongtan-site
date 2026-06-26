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
    // 봇 제외 (간단한 체크)
    if (typeof navigator !== "undefined" && /bot|crawl|spider|prerender/i.test(navigator.userAgent)) {
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
