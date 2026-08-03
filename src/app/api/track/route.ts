import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function detectSource(referrer: string | null, page?: string | null): string {
  if (!referrer) {
    // referrer가 없는 접속 = 출처 불명.
    // 다만 블로그 개별 글로 바로 진입한 경우는 검색 유입일 가능성이 매우 높다
    // (아무도 /blog/{슬러그}를 주소창에 직접 치지 않는다).
    if (page && /^\/blog\/[^/]+$/.test(page)) return "search_est";
    return "unknown";
  }
  try {
    const host = new URL(referrer).hostname;
    if (host.includes("google")) return "google";
    if (host.includes("naver")) return "naver";
    if (host.includes("kakao")) return "kakao";
    if (host.includes("instagram") || host.includes("ig.me")) return "instagram";
    if (host.includes("bodymiso.com")) return "internal";
    return "other";
  } catch {
    return "unknown";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer, visitor_id, session_id, is_new_visitor, event, properties, type } = body;

    // 작업용 브라우저 방어선 — 클라이언트 우회 대비 서버에서도 work_flag 쿠키를 한 번 더 확인
    const isInternal = req.cookies.get("work_flag")?.value === "1";

    // 이벤트 트래킹 분기 (event 필드가 있으면 events 테이블에 저장)
    if (event && typeof event === "string") {
      await supabaseAdmin.from("events").insert({
        event_name: event,
        properties: properties ?? {},
      });
      return NextResponse.json({ ok: true });
    }

    // 카카오 상담 버튼 클릭 (kakao_clicks 테이블 — page_views와 동일한 패턴)
    if (type === "kakao_click") {
      await supabaseAdmin.from("kakao_clicks").insert({
        page: page || "unknown",
        referrer: referrer || null,
        source: detectSource(referrer ?? null, page ?? null),
        visitor_id: visitor_id || null,
        session_id: session_id || null,
      });
      return NextResponse.json({ ok: true });
    }

    // 체류시간·스크롤 갱신 (이탈 시점에 sendBeacon으로 1회 도착)
    if (type === "duration") {
      const { view_id, duration_ms, scroll_depth } = body;
      if (!view_id) return NextResponse.json({ ok: true });
      await supabaseAdmin
        .from("page_views")
        .update({
          duration_ms: Math.min(Math.max(Number(duration_ms) || 0, 0), 30 * 60 * 1000), // 30분 상한
          scroll_depth: Math.min(Math.max(Number(scroll_depth) || 0, 0), 100),
        })
        .eq("id", view_id);
      return NextResponse.json({ ok: true });
    }

    // 관리자 페이지·API 경로는 추적 제외
    if (!page || page.startsWith("/admin") || page.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const source = detectSource(referrer ?? null, page ?? null);

    const { data } = await supabaseAdmin
      .from("page_views")
      .insert({
        page,
        referrer: referrer || null,
        source,
        visitor_id: visitor_id || null,
        session_id: session_id || null,
        is_new_visitor: is_new_visitor ?? true,
        is_internal: isInternal,
      })
      .select("id")
      .single();

    return NextResponse.json({ ok: true, view_id: data?.id });
  } catch (err) {
    // 트래킹 실패는 조용히 처리 (사용자 경험 방해 금지)
    console.error("[track]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
