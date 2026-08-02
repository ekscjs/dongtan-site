// GBP(Google Business Profile) 전용 인증 — 사용자 OAuth 리프레시 토큰 방식.
// src/lib/googleAuth.ts의 getGoogleAccessToken()은 서비스 계정 JWT 방식(GA4·서치콘솔 전용)이라
// GBP에는 안 통한다. 절대 그 함수를 고쳐서 겸용하지 말 것 — 주간리포트가 깨진다.
export async function getGbpAccessToken(): Promise<string> {
  const clientId = process.env.GBP_CLIENT_ID;
  const clientSecret = process.env.GBP_CLIENT_SECRET;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN 환경변수 없음");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GBP 액세스 토큰 갱신 실패: ${JSON.stringify(json)}`);
  return json.access_token as string;
}
