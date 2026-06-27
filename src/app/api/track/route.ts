import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function detectSource(referrer: string | null): string {
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname;
    if (host.includes("google")) return "google";
    if (host.includes("naver")) return "naver";
    if (host.includes("kakao") || host.includes("pf.kakao")) return "kakao";
    if (host.includes("instagram") || host.includes("ig.me")) return "instagram";
    if (host.includes("bodymiso.com")) return "internal";
    return "other";
  } catch {
    return "direct";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer, visitor_id, session_id, is_new_visitor, event, properties } = body;

    // 이벤트 트래킹 분기 (event 필드가 있으면 events 테이블에 저장)
    if (event && typeof event === "string") {
      await supabaseAdmin.from("events").insert({
        event_name: event,
        properties: properties ?? {},
      });
      return NextResponse.json({ ok: true });
    }

    // 관리자 페이지·API 경로는 추적 제외
    if (!page || page.startsWith("/admin") || page.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const source = detectSource(referrer ?? null);

    await supabaseAdmin.from("page_views").insert({
      page,
      referrer: referrer || null,
      source,
      visitor_id: visitor_id || null,
      session_id: session_id || null,
      is_new_visitor: is_new_visitor ?? true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // 트래킹 실패는 조용히 처리 (사용자 경험 방해 금지)
    console.error("[track]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
