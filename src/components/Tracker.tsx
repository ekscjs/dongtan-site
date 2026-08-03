"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateVisitorId, getOrCreateSessionId, isNewVisitor } from "@/lib/visitor";

export default function Tracker() {
  const pathname = usePathname();
  const viewIdRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const sentRef = useRef<boolean>(false);

  useEffect(() => {
    // 봇 제외 (Lighthouse, HeadlessChrome, PageSpeed 포함)
    if (typeof navigator !== "undefined" && /bot|crawl|spider|prerender|headless|lighthouse|pagespeed/i.test(navigator.userAgent)) {
      return;
    }
    // 관리자 제외 — admin_flag 쿠키가 있으면 트래킹 안 함 (admin_session은 httpOnly라 JS에서 못 읽음)
    if (document.cookie.split(";").some((c) => c.trim() === "admin_flag=1")) {
      return;
    }
    // 작업용 브라우저 제외 — 코워크/로컬 Claude Code가 라이브에서 QA할 때 work_flag=1 쿠키를 심어둠
    if (document.cookie.split(";").some((c) => c.trim() === "work_flag=1")) {
      return;
    }

    viewIdRef.current = null;
    startRef.current = Date.now();
    maxScrollRef.current = 0;
    sentRef.current = false;

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
      keepalive: true,
    })
      .then((r) => r.json())
      .then((j) => { viewIdRef.current = j?.view_id ?? null; })
      .catch(() => {});

    // 스크롤 최대 도달률 기록
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.round((window.scrollY / total) * 100) : 100;
      if (pct > maxScrollRef.current) maxScrollRef.current = Math.min(pct, 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 이탈 시 1회 전송
    const flush = () => {
      if (sentRef.current || !viewIdRef.current) return;
      sentRef.current = true;
      const payload = JSON.stringify({
        type: "duration",
        view_id: viewIdRef.current,
        duration_ms: Date.now() - startRef.current,
        scroll_depth: maxScrollRef.current,
      });
      // sendBeacon은 페이지가 사라지는 중에도 전송이 보장된다
      navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }));
    };

    // visibilitychange(hidden)가 모바일에서 가장 확실하다. pagehide는 보조.
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      flush(); // SPA 내부 이동 시에도 여기서 전송됨
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
