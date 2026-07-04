import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  // 관리자 인증 확인
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 날짜 범위 계산
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);

  const fmt = (d: Date) => d.toISOString();

  try {
    // 병렬 쿼리
    const [
      todayRes,
      weekRes,
      monthRes,
      dailyRes,
      sourceRes,
      pageRes,
      exitRes,
      newVsReturnRes,
    ] = await Promise.all([
      // 오늘 방문자 (고유 visitor_id)
      supabaseAdmin
        .from("page_views")
        .select("visitor_id", { count: "exact" })
        .gte("created_at", fmt(todayStart))
        .not("visitor_id", "is", null),

      // 주간 방문자
      supabaseAdmin
        .from("page_views")
        .select("visitor_id", { count: "exact" })
        .gte("created_at", fmt(weekStart))
        .not("visitor_id", "is", null),

      // 월간 방문자
      supabaseAdmin
        .from("page_views")
        .select("visitor_id", { count: "exact" })
        .gte("created_at", fmt(monthStart))
        .not("visitor_id", "is", null),

      // 날짜별 페이지뷰 (최근 30일) — created_at 날짜만 추출
      supabaseAdmin
        .from("page_views")
        .select("created_at")
        .gte("created_at", fmt(monthStart))
        .order("created_at", { ascending: true }),

      // 유입경로 비율 (최근 30일)
      supabaseAdmin
        .from("page_views")
        .select("source")
        .gte("created_at", fmt(monthStart)),

      // 인기 페이지 Top 10 (최근 30일)
      supabaseAdmin
        .from("page_views")
        .select("page")
        .gte("created_at", fmt(monthStart))
        .not("page", "like", "/admin%"),

      // 이탈 지점 — 세션의 마지막 페이지 (최근 30일)
      supabaseAdmin
        .from("page_views")
        .select("page, session_id, created_at")
        .gte("created_at", fmt(monthStart))
        .not("page", "like", "/admin%")
        .order("created_at", { ascending: false }),

      // 신규 vs 재방문 (최근 30일)
      supabaseAdmin
        .from("page_views")
        .select("is_new_visitor, visitor_id")
        .gte("created_at", fmt(monthStart))
        .not("visitor_id", "is", null),
    ]);

    // 신청(leads) 날짜별 건수 (최근 30일) — page_views와 조인해 전환율 계산
    const leadsRes = await supabaseAdmin
      .from("leads")
      .select("created_at")
      .gte("created_at", fmt(monthStart));

    // 카카오 상담 버튼 클릭 (최근 30일)
    const kakaoRes = await supabaseAdmin
      .from("kakao_clicks")
      .select("created_at")
      .gte("created_at", fmt(monthStart));

    // 날짜별 방문자 집계
    const dailyMap: Record<string, Set<string>> = {};
    for (const row of dailyRes.data ?? []) {
      const date = row.created_at.slice(0, 10); // YYYY-MM-DD
      if (!dailyMap[date]) dailyMap[date] = new Set();
      // page_views에서 visitor_id가 없으면 created_at으로 대체
    }
    // visitor_id 포함 쿼리로 재집계
    const dailyWithVisitor = await supabaseAdmin
      .from("page_views")
      .select("created_at, visitor_id")
      .gte("created_at", fmt(monthStart))
      .order("created_at", { ascending: true });

    // 전체 기간 (연간 차트용)
    const allTimeRes = await supabaseAdmin
      .from("page_views")
      .select("created_at, visitor_id")
      .order("created_at", { ascending: true });

    const dailyVisitors: Record<string, Set<string>> = {};
    for (const row of dailyWithVisitor.data ?? []) {
      const date = row.created_at.slice(0, 10);
      if (!dailyVisitors[date]) dailyVisitors[date] = new Set();
      if (row.visitor_id) dailyVisitors[date].add(row.visitor_id);
    }
    const dailyChart = Object.entries(dailyVisitors)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visitors]) => ({ date, count: visitors.size }));

    // 날짜별 페이지뷰 총량 (신청 전환율 분모 — 방문자 수가 아닌 페이지뷰 수 기준)
    const pageviewCountsByDate: Record<string, number> = {};
    for (const row of dailyWithVisitor.data ?? []) {
      const date = row.created_at.slice(0, 10);
      pageviewCountsByDate[date] = (pageviewCountsByDate[date] ?? 0) + 1;
    }

    // 날짜별 신청(leads) 건수
    const leadsCountsByDate: Record<string, number> = {};
    for (const row of leadsRes.data ?? []) {
      const date = row.created_at.slice(0, 10);
      leadsCountsByDate[date] = (leadsCountsByDate[date] ?? 0) + 1;
    }

    // leads × page_views 조인 → 날짜별 전환율
    const conversionDates = new Set([
      ...Object.keys(pageviewCountsByDate),
      ...Object.keys(leadsCountsByDate),
    ]);
    const conversionChart = Array.from(conversionDates)
      .sort((a, b) => a.localeCompare(b))
      .map((date) => {
        const pageviews = pageviewCountsByDate[date] ?? 0;
        const leads = leadsCountsByDate[date] ?? 0;
        const rate = pageviews > 0 ? Math.round((leads / pageviews) * 1000) / 10 : 0;
        return { date, pageviews, leads, rate };
      });
    const conversionTotals = {
      pageviews: Object.values(pageviewCountsByDate).reduce((s, n) => s + n, 0),
      leads: Object.values(leadsCountsByDate).reduce((s, n) => s + n, 0),
    };
    const conversionRate = conversionTotals.pageviews > 0
      ? Math.round((conversionTotals.leads / conversionTotals.pageviews) * 1000) / 10
      : 0;

    // 카카오 상담 버튼 클릭 — 날짜별 집계
    const kakaoCountsByDate: Record<string, number> = {};
    for (const row of kakaoRes.data ?? []) {
      const date = row.created_at.slice(0, 10);
      kakaoCountsByDate[date] = (kakaoCountsByDate[date] ?? 0) + 1;
    }
    const kakaoChart = Object.entries(kakaoCountsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    const kakaoTotal = Object.values(kakaoCountsByDate).reduce((s, n) => s + n, 0);

    // 월별 방문자 집계 (연간 차트)
    const monthlyVisitors: Record<string, Set<string>> = {};
    for (const row of allTimeRes.data ?? []) {
      const month = row.created_at.slice(0, 7); // YYYY-MM
      if (!monthlyVisitors[month]) monthlyVisitors[month] = new Set();
      if (row.visitor_id) monthlyVisitors[month].add(row.visitor_id);
    }
    const yearlyChart = Object.entries(monthlyVisitors)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visitors]) => ({ date, count: visitors.size }));

    // 유입경로 집계
    const sourceCounts: Record<string, number> = {};
    for (const row of sourceRes.data ?? []) {
      sourceCounts[row.source] = (sourceCounts[row.source] ?? 0) + 1;
    }
    const sourceChart = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count }));

    // 인기 페이지 집계
    const pageCounts: Record<string, number> = {};
    for (const row of pageRes.data ?? []) {
      pageCounts[row.page] = (pageCounts[row.page] ?? 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // 이탈 지점: 각 세션의 마지막 페이지
    const sessionLastPage: Record<string, { page: string; ts: string }> = {};
    for (const row of exitRes.data ?? []) {
      if (!row.session_id) continue;
      if (!sessionLastPage[row.session_id]) {
        sessionLastPage[row.session_id] = { page: row.page, ts: row.created_at };
      }
    }
    const exitCounts: Record<string, number> = {};
    for (const { page } of Object.values(sessionLastPage)) {
      exitCounts[page] = (exitCounts[page] ?? 0) + 1;
    }
    const exitPages = Object.entries(exitCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // 신규 vs 재방문
    const visitorFirstSeen: Record<string, boolean> = {};
    let newCount = 0;
    let returnCount = 0;
    for (const row of newVsReturnRes.data ?? []) {
      if (!row.visitor_id || row.visitor_id in visitorFirstSeen) continue;
      visitorFirstSeen[row.visitor_id] = row.is_new_visitor;
      if (row.is_new_visitor) newCount++;
      else returnCount++;
    }

    // 고유 방문자 수 (dedup)
    const countUnique = (rows: { visitor_id: string | null }[]) => {
      const s = new Set(rows.map((r) => r.visitor_id).filter(Boolean));
      return s.size;
    };

    // 블로그 글 제목 맵
    const postsRes = await supabaseAdmin.from("posts").select("title, slug");
    const slugToTitle: Record<string, string> = {};
    for (const post of postsRes.data ?? []) {
      if (post.slug && post.title) slugToTitle[post.slug] = post.title;
    }

    return NextResponse.json({
      summary: {
        today: countUnique(todayRes.data ?? []),
        week: countUnique(weekRes.data ?? []),
        month: countUnique(monthRes.data ?? []),
      },
      dailyChart,
      yearlyChart,
      sourceChart,
      topPages,
      exitPages,
      newVsReturn: { new: newCount, return: returnCount },
      slugToTitle,
      conversionChart,
      conversionTotals: { ...conversionTotals, rate: conversionRate },
      kakaoChart,
      kakaoTotal,
    });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
