import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GA4_PROPERTY_ID = "541281945";

async function getAccessToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON 환경변수 없음");

  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const unsigned = `${header}.${payload}`;
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
  if (!tokenData.access_token) throw new Error(`액세스 토큰 발급 실패: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

async function runReport(token: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getAccessToken();

    const dateRange = [{ startDate: "30daysAgo", endDate: "today" }];

    const [countryData, cityData, deviceData, pageData, channelData] = await Promise.all([
      // 국가별 방문자
      runReport(token, {
        dateRanges: dateRange,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      // 도시별 방문자
      runReport(token, {
        dateRanges: dateRange,
        dimensions: [{ name: "city" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      // 기기 카테고리
      runReport(token, {
        dateRanges: dateRange,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      // 페이지별 참여 시간 Top 10
      runReport(token, {
        dateRanges: dateRange,
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
        ],
        dimensionFilter: {
          notExpression: {
            filter: {
              fieldName: "pagePath",
              stringFilter: { matchType: "BEGINS_WITH", value: "/admin" },
            },
          },
        },
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      // 채널별 유입 (직접/검색/SNS 등)
      runReport(token, {
        dateRanges: dateRange,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
    ]);

    // 국가 데이터 파싱
    const countries = (countryData.rows ?? []).map((row: { dimensionValues: {value:string}[]; metricValues: {value:string}[] }) => ({
      country: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
    }));

    // 도시 데이터 파싱
    const cities = (cityData.rows ?? []).map((row: { dimensionValues: {value:string}[]; metricValues: {value:string}[] }) => ({
      city: row.dimensionValues[0].value === "(not set)" ? "미분류" : row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
    }));

    // 기기 데이터 파싱
    const deviceMap: Record<string, string> = {
      mobile: "모바일",
      desktop: "데스크탑",
      tablet: "태블릿",
    };
    const devices = (deviceData.rows ?? []).map((row: { dimensionValues: {value:string}[]; metricValues: {value:string}[] }) => ({
      device: deviceMap[row.dimensionValues[0].value] ?? row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
    }));

    // 페이지 데이터 파싱
    const pages = (pageData.rows ?? []).map((row: { dimensionValues: {value:string}[]; metricValues: {value:string}[] }) => ({
      path: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      avgDuration: parseFloat(row.metricValues[1].value),
      engagementRate: parseFloat(row.metricValues[2].value),
    }));

    // 채널 데이터 파싱 (GA4 기본 채널 그룹 → 한글)
    const channelMap: Record<string, string> = {
      "Direct": "직접 방문",
      "Organic Search": "검색",
      "Organic Social": "SNS",
      "Paid Search": "유료 검색",
      "Paid Social": "유료 SNS",
      "Referral": "외부 링크",
      "Email": "이메일",
      "Unassigned": "미분류",
    };
    const channels = (channelData.rows ?? []).map((row: { dimensionValues: {value:string}[]; metricValues: {value:string}[] }) => ({
      channel: channelMap[row.dimensionValues[0].value] ?? row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
    }));

    return NextResponse.json({ countries, cities, devices, pages, channels });
  } catch (err) {
    console.error("[ga4]", err);
    return NextResponse.json(
      { error: String(err), countries: [], devices: [], pages: [], channels: [] },
      { status: 200 }
    );
  }
}
