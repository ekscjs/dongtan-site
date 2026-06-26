import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Google Search Console API — 서비스 계정 방식
// 환경변수 GOOGLE_SERVICE_ACCOUNT_JSON 에 JSON 문자열로 넣어야 함
// SEARCH_CONSOLE_SITE_URL = "sc-domain:bodymiso.com"

async function getAccessToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON 환경변수 없음");

  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const unsigned = `${header}.${payload}`;

  // Node.js crypto로 RS256 서명
  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(sa.private_key, "base64url");

  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("액세스 토큰 발급 실패");
  return tokenData.access_token;
}

export async function GET(req: NextRequest) {
  // 관리자 인증 확인
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL ?? "sc-domain:bodymiso.com";

  try {
    const token = await getAccessToken();

    // 최근 28일 날짜 범위
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Search Console는 3일 지연
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28);

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
          rowLimit: 20,
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
          rowLimit: 10,
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
      period: { start: fmt(startDate), end: fmt(endDate) },
    });
  } catch (err) {
    console.error("[search-console]", err);
    return NextResponse.json(
      { error: String(err), queries: [], pages: [], period: null },
      { status: 200 } // 오류여도 200 반환해 UI가 graceful degradation
    );
  }
}
