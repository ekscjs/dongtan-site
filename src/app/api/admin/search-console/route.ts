import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getGoogleAccessToken } from "@/lib/googleAuth";

// Google Search Console API — 서비스 계정 방식
// 환경변수 GOOGLE_SERVICE_ACCOUNT_JSON 에 JSON 문자열로 넣어야 함
// SEARCH_CONSOLE_SITE_URL = "sc-domain:bodymiso.com"

export async function GET(req: NextRequest) {
  // 관리자 인증 확인
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL ?? "sc-domain:bodymiso.com";

  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/webmasters.readonly");

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Search Console는 3일 지연
    // 기본 90일. ?days=180 처럼 조절 가능 (Search Console 최대 16개월)
    const days = Math.min(Number(req.nextUrl.searchParams.get("days")) || 90, 480);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    // 검색어 순위표 (Top 20)
    const queryRes = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["query"],
          rowLimit: 100,
          dataState: "final",
        }),
      }
    );

    // 페이지별 데이터
    const pageRes = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["page"],
          rowLimit: 50,
          dataState: "final",
        }),
      }
    );

    const [queryData, pageData] = await Promise.all([
      queryRes.json(),
      pageRes.json(),
    ]);

    return NextResponse.json({
      queries: queryData.rows ?? [],
      pages: pageData.rows ?? [],
      period: { start: fmt(startDate), end: fmt(endDate), days },
    });
  } catch (err) {
    console.error("[search-console]", err);
    return NextResponse.json(
      { error: String(err), queries: [], pages: [], period: null },
      { status: 200 } // 오류여도 200 반환해 UI가 graceful degradation
    );
  }
}
