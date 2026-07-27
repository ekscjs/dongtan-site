import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleAccessToken } from "@/lib/googleAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);
const GA4_PROPERTY_ID = "541281945";

// KST(UTC+9) 날짜 헬퍼 — src/app/api/admin/analytics/route.ts 와 동일 로직을 그대로 복사.
// 공통 lib로 빼는 리팩터링은 이번 범위 아님.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const kstDateStr = (d: Date) => new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
const kstMidnightUtc = (daysAgo: number) => {
  const shifted = new Date(Date.now() + KST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  shifted.setUTCDate(shifted.getUTCDate() - daysAgo);
  return new Date(shifted.getTime() - KST_OFFSET_MS);
};

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

type SourceCount = { source: string; count: number };
type TopPage = { page: string; title: string; count: number };
type SearchQuery = { query: string; clicks: number; impressions: number; ctr: number; position: number };
type SearchPage = { page: string; clicks: number; impressions: number };
type Ga4Channel = { channel: string; sessions: number };
type Ga4Device = { device: string; sessions: number };

function delta(current: number, prev: number): string {
  const diff = current - prev;
  if (diff > 0) return `▲${diff}`;
  if (diff < 0) return `▼${Math.abs(diff)}`;
  return "-";
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  const fmt = (d: Date) => d.toISOString();

  // 집계 기간: 최근 7 "완결된" 일 — 오늘은 데이터가 덜 쌓였으므로 어제까지.
  const periodStart = kstMidnightUtc(7); // 7일 전 KST 자정
  const periodEnd = kstMidnightUtc(0); // 오늘 KST 자정 (배타적 상한)
  const prevPeriodStart = kstMidnightUtc(14); // 비교 대상: 그 전 7일
  const periodStartStr = kstDateStr(periodStart);
  const periodEndStr = kstDateStr(kstMidnightUtc(1)); // 어제(포함된 마지막 날)

  let visitors = 0;
  let pageviews = 0;
  let visitorsPrev = 0;
  let leads = 0;
  let kakaoClicks = 0;
  let selfChecks = 0;
  let sources: SourceCount[] = [];
  let topPages: TopPage[] = [];

  try {
    const [pageViewRows, prevVisitorRows, leadsRows, kakaoRows, selfCheckRows, postsRows] = await Promise.all([
      fetchAllRows<{ page: string; source: string | null; visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("page, source, visitor_id")
          .gte("created_at", fmt(periodStart))
          .lt("created_at", fmt(periodEnd))
      ),
      fetchAllRows<{ visitor_id: string | null }>(() =>
        supabaseAdmin
          .from("page_views")
          .select("visitor_id")
          .gte("created_at", fmt(prevPeriodStart))
          .lt("created_at", fmt(periodStart))
          .not("visitor_id", "is", null)
      ),
      fetchAllRows<{ id: number }>(() =>
        supabaseAdmin.from("leads").select("id").gte("created_at", fmt(periodStart)).lt("created_at", fmt(periodEnd))
      ),
      fetchAllRows<{ id: string }>(() =>
        supabaseAdmin
          .from("kakao_clicks")
          .select("id")
          .gte("created_at", fmt(periodStart))
          .lt("created_at", fmt(periodEnd))
      ),
      fetchAllRows<{ id: number }>(() =>
        supabaseAdmin
          .from("self_check_results")
          .select("id")
          .gte("created_at", fmt(periodStart))
          .lt("created_at", fmt(periodEnd))
      ),
      fetchAllRows<{ title: string | null; slug: string | null }>(() => supabaseAdmin.from("posts").select("title, slug")),
    ]);

    visitors = new Set(pageViewRows.map((r) => r.visitor_id).filter(Boolean)).size;
    pageviews = pageViewRows.length;
    visitorsPrev = new Set(prevVisitorRows.map((r) => r.visitor_id).filter(Boolean)).size;
    leads = leadsRows.length;
    kakaoClicks = kakaoRows.length;
    selfChecks = selfCheckRows.length;

    const sourceCounts: Record<string, number> = {};
    for (const r of pageViewRows) {
      if (!r.source) continue;
      sourceCounts[r.source] = (sourceCounts[r.source] ?? 0) + 1;
    }
    sources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count }));

    const slugToTitle: Record<string, string> = {};
    for (const p of postsRows) if (p.slug && p.title) slugToTitle[p.slug] = p.title;

    const pageCounts: Record<string, number> = {};
    for (const r of pageViewRows) {
      if (r.page.startsWith("/admin")) continue;
      pageCounts[r.page] = (pageCounts[r.page] ?? 0) + 1;
    }
    topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({
        page,
        title: page.startsWith("/blog/") ? slugToTitle[page.replace("/blog/", "")] ?? page : page,
        count,
      }));
  } catch (e) {
    errors.push(`supabase: ${e instanceof Error ? e.message : String(e)}`);
  }

  let queries: SearchQuery[] = [];
  let topSearchPages: SearchPage[] = [];
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL ?? "sc-domain:bodymiso.com";
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/webmasters.readonly");

    // Search Console은 최신 데이터가 3일 지연되므로 그만큼 당겨서 7일 구간을 잡는다.
    const scEnd = new Date();
    scEnd.setDate(scEnd.getDate() - 3);
    const scStart = new Date(scEnd);
    scStart.setDate(scStart.getDate() - 7);
    const scFmt = (d: Date) => d.toISOString().split("T")[0];

    const [queryRes, pageRes] = await Promise.all([
      fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: scFmt(scStart), endDate: scFmt(scEnd), dimensions: ["query"], rowLimit: 10, dataState: "final" }),
      }),
      fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: scFmt(scStart), endDate: scFmt(scEnd), dimensions: ["page"], rowLimit: 5, dataState: "final" }),
      }),
    ]);
    const [queryData, pageData] = await Promise.all([queryRes.json(), pageRes.json()]);

    type ScRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
    if (queryData.error) throw new Error(JSON.stringify(queryData.error));
    queries = ((queryData.rows ?? []) as ScRow[]).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 1000) / 10,
      position: Math.round(r.position * 10) / 10,
    }));
    topSearchPages = ((pageData.rows ?? []) as ScRow[]).map((r) => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    }));
  } catch (e) {
    errors.push(`searchConsole: ${e instanceof Error ? e.message : String(e)}`);
  }

  let ga4Channels: Ga4Channel[] = [];
  let ga4Devices: Ga4Device[] = [];
  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/analytics.readonly");
    const dateRanges = [{ startDate: "7daysAgo", endDate: "today" }];

    async function runReport(body: object) {
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    }

    const [channelData, deviceData] = await Promise.all([
      runReport({
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      runReport({
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
    ]);

    type Ga4Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };
    if (channelData.error) throw new Error(JSON.stringify(channelData.error));
    ga4Channels = ((channelData.rows ?? []) as Ga4Row[]).map((r) => ({
      channel: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value),
    }));
    ga4Devices = ((deviceData.rows ?? []) as Ga4Row[]).map((r) => ({
      device: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value),
    }));
  } catch (e) {
    errors.push(`ga4: ${e instanceof Error ? e.message : String(e)}`);
  }

  const reportJson = {
    period: { start: periodStartStr, end: periodEndStr },
    visitors,
    pageviews,
    visitorsPrev,
    leads,
    kakaoClicks,
    selfChecks,
    sources,
    topPages,
    queries,
    topSearchPages,
    ga4Channels,
    ga4Devices,
    errors,
  };

  const sourceRowsHtml = sources
    .map((s) => `<tr><td style="padding:4px 12px 4px 0;color:#888;">${s.source}</td><td>${s.count}</td></tr>`)
    .join("");
  const topPagesHtml = topPages
    .map((p) => `<tr><td style="padding:4px 12px 4px 0;color:#888;">${p.title}</td><td>${p.count}</td></tr>`)
    .join("");
  const queriesHtml = queries
    .map(
      (q) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#888;">${q.query}</td><td>${q.clicks}</td><td>${q.impressions}</td><td>${q.ctr}%</td><td>${q.position}위</td></tr>`
    )
    .join("");
  const errorsHtml = errors.length
    ? `<p style="color:#d33;font-size:13px;">수집 실패: ${errors.map((e) => e.replace(/</g, "&lt;")).join(" / ")}</p>`
    : "";

  const html = `
    <h2>주간 리포트 (${periodStartStr} ~ ${periodEndStr})</h2>
    ${errorsHtml}
    <table style="border-collapse:collapse;font-size:15px;margin-bottom:20px;">
      <tr><td style="padding:6px 16px 6px 0;color:#888;">방문자</td><td><b>${visitors}명</b> (지난주 대비 ${delta(visitors, visitorsPrev)})</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">페이지뷰</td><td><b>${pageviews}회</b></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">상담 신청</td><td><b>${leads}건</b></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">카카오 버튼 클릭</td><td><b>${kakaoClicks}회</b></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">셀프체크 실행</td><td><b>${selfChecks}회</b></td></tr>
    </table>
    <h3 style="margin-bottom:6px;">유입경로</h3>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px;">${sourceRowsHtml || "<tr><td>데이터 없음</td></tr>"}</table>
    <h3 style="margin-bottom:6px;">인기글 Top 5</h3>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px;">${topPagesHtml || "<tr><td>데이터 없음</td></tr>"}</table>
    <h3 style="margin-bottom:6px;">검색어 Top 10 (Search Console)</h3>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr style="color:#888;"><td style="padding:4px 12px 4px 0;">검색어</td><td>클릭</td><td>노출</td><td>CTR</td><td>순위</td></tr>
      ${queriesHtml || "<tr><td>데이터 없음</td></tr>"}
    </table>
    <p style="margin-top:24px;color:#888;font-size:13px;"><a href="https://www.bodymiso.com/admin/analytics">관리자 페이지에서 자세히 보기</a></p>
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      <pre id="report-json">${JSON.stringify(reportJson)}</pre>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "내몸에미소 <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: `[주간 리포트] ${periodEndStr} · 방문자 ${visitors}명 · 신청 ${leads}건`,
      html,
    });
  } catch (e) {
    console.error("[weekly-report] resend error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: true, visitors, leads });
}
