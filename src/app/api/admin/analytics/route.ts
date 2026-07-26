import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  // 관리자 인증 확인
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // KST(UTC+9) 기준 날짜 계산 — 서버는 UTC로 도니, 날짜 경계는 한국 기준으로 따로 맞춰야 함
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  // 특정 시각의 KST 날짜 문자열(YYYY-MM-DD)
  const kstDateStr = (d: Date) => new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
  // daysAgo일 전 KST 자정에 해당하는 실제 UTC 시각
  const kstMidnightUtc = (daysAgo: number) => {
    const shifted = new Date(Date.now() + KST_OFFSET_MS);
    shifted.setUTCHours(0, 0, 0, 0);
    shifted.setUTCDate(shifted.getUTCDate() - daysAgo);
    return new Date(shifted.getTime() - KST_OFFSET_MS);
  };

  // 날짜 범위 계산
  const todayStart = kstMidnightUtc(0);
  const weekStart = kstMidnightUtc(7);
  const monthStart = kstMidnightUtc(30);
  const eightWeeksStart = kstMidnightUtc(55); // 오늘 포함 8주 커버

  const fmt = (d: Date) => d.toISOString();

  // Supabase는 한 쿼리당 최대 1000행까지만 반환하므로, .range()로 끝까지 나눠 받아온다
  const PAGE_SIZE = 1000;
  async function fetchAllRows<T>(
    buildQuery: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
  ): Promise<T[]> {
    const rows: T[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await (buildQuery() as unknown as {
        range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
      }).range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      const batch = data ?? [];
      rows.push(...batch);
      if (batch.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return rows;
  }

  try {
    // 병렬 쿼리
    const [
      todayRows,
      weekRows,
      monthRows,
      sourceRows,
      pageRows,
      exitRows,
      newVsReturnRows,
    ] = await Promise.all([
      // 오늘 방문자 (고유 visitor_id)
      fetchAllRows<{ visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("visitor_id")
          .gte("created_at", fmt(todayStart))
          .not("visitor_id", "is", null)
      ),

      // 주간 방문자
      fetchAllRows<{ visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("visitor_id")
          .gte("created_at", fmt(weekStart))
          .not("visitor_id", "is", null)
      ),

      // 월간 방문자
      fetchAllRows<{ visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("visitor_id")
          .gte("created_at", fmt(monthStart))
          .not("visitor_id", "is", null)
      ),

      // 유입경로 비율 (최근 30일)
      fetchAllRows<{ source: string }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("source")
          .gte("created_at", fmt(monthStart))
      ),

      // 인기 페이지 Top 10 (최근 30일)
      fetchAllRows<{ page: string }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("page")
          .gte("created_at", fmt(monthStart))
          .not("page", "like", "/admin%")
      ),

      // 이탈 지점 — 세션의 마지막 페이지 (최근 30일)
      fetchAllRows<{ page: string; session_id: string | null; created_at: string }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("page, session_id, created_at")
          .gte("created_at", fmt(monthStart))
          .not("page", "like", "/admin%")
          .order("created_at", { ascending: false })
      ),

      // 신규 vs 재방문 (최근 30일)
      fetchAllRows<{ is_new_visitor: boolean; visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("is_new_visitor, visitor_id")
          .gte("created_at", fmt(monthStart))
          .not("visitor_id", "is", null)
      ),
    ]);

    // 신청(leads) 날짜별 건수 (최근 30일) — page_views와 조인해 전환율 계산
    const leadsRows = await fetchAllRows<{ created_at: string }>(() =>
      supabaseAdmin
        .from("leads")
        .select("created_at")
        .gte("created_at", fmt(monthStart))
    );

    // 카카오 상담 버튼 클릭 (최근 8주 — 주별 막대 + 최근 내역용)
    const kakaoRows = await fetchAllRows<{ created_at: string; page: string | null; source: string | null }>(() =>
      supabaseAdmin
        .from("kakao_clicks")
        .select("created_at, page, source")
        .gte("created_at", fmt(eightWeeksStart))
        .order("created_at", { ascending: false })
    );

    // 날짜별 방문자 집계 (visitor_id 포함, 최근 30일)
    const dailyWithVisitorRows = await fetchAllRows<{ created_at: string; visitor_id: string | null }>(() =>
      supabaseAdmin
        .from("page_views")
        .select("created_at, visitor_id")
        .gte("created_at", fmt(monthStart))
        .order("created_at", { ascending: true })
    );

    // 전체 기간 (연간 차트용)
    const allTimeRows = await fetchAllRows<{ created_at: string; visitor_id: string | null }>(() =>
      supabaseAdmin
        .from("page_views")
        .select("created_at, visitor_id")
        .order("created_at", { ascending: true })
    );

    const dailyVisitors: Record<string, Set<string>> = {};
    for (const row of dailyWithVisitorRows) {
      const date = kstDateStr(new Date(row.created_at));
      if (!dailyVisitors[date]) dailyVisitors[date] = new Set();
      if (row.visitor_id) dailyVisitors[date].add(row.visitor_id);
    }
    const dailyChart = Object.entries(dailyVisitors)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visitors]) => ({ date, count: visitors.size }));

    // 날짜별 페이지뷰 총량 (신청 전환율 분모 — 방문자 수가 아닌 페이지뷰 수 기준)
    const pageviewCountsByDate: Record<string, number> = {};
    for (const row of dailyWithVisitorRows) {
      const date = kstDateStr(new Date(row.created_at));
      pageviewCountsByDate[date] = (pageviewCountsByDate[date] ?? 0) + 1;
    }

    // 날짜별 신청(leads) 건수
    const leadsCountsByDate: Record<string, number> = {};
    for (const row of leadsRows) {
      const date = kstDateStr(new Date(row.created_at));
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

    // 카카오 상담 버튼 클릭 — 총합은 30일 기준 유지(클릭률 분모인 페이지뷰와 기간 일치)
    const monthStartStr = kstDateStr(monthStart);
    const kakaoTotal = kakaoRows.filter(
      (r) => kstDateStr(new Date(r.created_at)) >= monthStartStr
    ).length;

    // 카카오 상담 버튼 클릭 — 주별 집계 (KST 월요일~일요일, 클릭 0인 주도 포함)
    const kstMondayStr = (d: Date) => {
      const shifted = new Date(d.getTime() + KST_OFFSET_MS);
      const dow = shifted.getUTCDay(); // 0=일 … 6=토
      const diff = dow === 0 ? 6 : dow - 1; // 월요일까지 되감을 일수
      shifted.setUTCDate(shifted.getUTCDate() - diff);
      return shifted.toISOString().slice(0, 10);
    };

    // 최근 8주치 월요일 목록(오래된 주 → 최신 주)
    const weekKeys: string[] = [];
    for (let i = 7; i >= 0; i--) {
      weekKeys.push(kstMondayStr(kstMidnightUtc(i * 7)));
    }

    const kakaoWeekCounts: Record<string, number> = {};
    for (const key of weekKeys) kakaoWeekCounts[key] = 0; // 제로필
    for (const row of kakaoRows) {
      const key = kstMondayStr(new Date(row.created_at));
      if (key in kakaoWeekCounts) kakaoWeekCounts[key] += 1;
    }

    const kakaoWeekly = weekKeys.map((key) => {
      const mon = new Date(key + "T00:00:00Z");
      const sun = new Date(mon.getTime() + 6 * 86400000);
      const label = (d: Date) => (d.getUTCMonth() + 1) + "/" + d.getUTCDate();
      return { label: label(mon) + "~" + label(sun), count: kakaoWeekCounts[key] };
    });

    // 카카오 상담 버튼 최근 클릭 내역 (최대 10건)
    const kakaoRecent = kakaoRows.slice(0, 10).map((r) => ({
      datetime: new Date(new Date(r.created_at).getTime() + KST_OFFSET_MS)
        .toISOString().slice(0, 16).replace("T", " "), // "2026-07-23 14:05" (KST)
      page: r.page ?? "unknown",
      source: r.source ?? "direct",
    }));

    // 월별 방문자 집계 (연간 차트)
    const monthlyVisitors: Record<string, Set<string>> = {};
    for (const row of allTimeRows) {
      const month = kstDateStr(new Date(row.created_at)).slice(0, 7); // YYYY-MM (KST)
      if (!monthlyVisitors[month]) monthlyVisitors[month] = new Set();
      if (row.visitor_id) monthlyVisitors[month].add(row.visitor_id);
    }
    const yearlyChart = Object.entries(monthlyVisitors)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visitors]) => ({ date, count: visitors.size }));

    // 유입경로 집계
    const sourceCounts: Record<string, number> = {};
    for (const row of sourceRows) {
      sourceCounts[row.source] = (sourceCounts[row.source] ?? 0) + 1;
    }
    const sourceChart = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count }));

    // 인기 페이지 집계
    const pageCounts: Record<string, number> = {};
    for (const row of pageRows) {
      pageCounts[row.page] = (pageCounts[row.page] ?? 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // 이탈 지점: 각 세션의 마지막 페이지
    const sessionLastPage: Record<string, { page: string; ts: string }> = {};
    for (const row of exitRows) {
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
    for (const row of newVsReturnRows) {
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
    const postsRows = await fetchAllRows<{ title: string | null; slug: string | null }>(() =>
      supabaseAdmin.from("posts").select("title, slug")
    );
    const slugToTitle: Record<string, string> = {};
    for (const post of postsRows) {
      if (post.slug && post.title) slugToTitle[post.slug] = post.title;
    }

    return NextResponse.json({
      summary: {
        today: countUnique(todayRows),
        week: countUnique(weekRows),
        month: countUnique(monthRows),
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
      kakaoWeekly,
      kakaoRecent,
      kakaoTotal,
    });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
