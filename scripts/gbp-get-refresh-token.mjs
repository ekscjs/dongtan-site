// GBP OAuth refresh token 발급 — 1회만 실행
// 사용법: GBP_CLIENT_ID=... GBP_CLIENT_SECRET=... node scripts/gbp-get-refresh-token.mjs
import http from "node:http";
import { exec } from "node:child_process";

const CLIENT_ID = process.env.GBP_CLIENT_ID;
const CLIENT_SECRET = process.env.GBP_CLIENT_SECRET;
const REDIRECT_URI = process.env.GBP_REDIRECT_URI || "http://localhost:5555/oauth2callback";
const PORT = Number(new URL(REDIRECT_URI).port) || 5555;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("GBP_CLIENT_ID / GBP_CLIENT_SECRET 환경변수가 필요합니다.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth" +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  "&response_type=code" +
  "&scope=" + encodeURIComponent("https://www.googleapis.com/auth/business.manage") +
  "&access_type=offline" +
  "&login_hint=" + encodeURIComponent("ekscjs5@gmail.com") +
  "&prompt=" + encodeURIComponent("select_account consent");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`인증 실패: ${error}`);
    console.error("OAuth 오류:", error);
    server.close();
    process.exit(1);
    return;
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("code 파라미터가 없습니다.");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("인증 완료. 터미널을 확인하세요. 이 창은 닫아도 됩니다.");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("\n토큰 교환 실패:", JSON.stringify(tokenJson, null, 2));
      server.close();
      process.exit(1);
      return;
    }

    if (!tokenJson.refresh_token) {
      console.error(
        "\n응답에 refresh_token이 없습니다. 이미 한 번 동의한 계정이면 https://myaccount.google.com/permissions 에서 앱 액세스를 제거하고 다시 시도하세요."
      );
      console.error(JSON.stringify(tokenJson, null, 2));
      server.close();
      process.exit(1);
      return;
    }

    console.log("\n=== 발급 완료 ===");
    console.log("GBP_REFRESH_TOKEN=" + tokenJson.refresh_token);
    console.log("==================\n");
  } catch (e) {
    console.error("토큰 교환 중 오류:", e);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`\n임시 서버가 http://localhost:${PORT} 에서 대기 중입니다.\n`);
  console.log("아래 URL을 브라우저에서 열어 로그인·동의하세요 (GBP 소유 계정으로 로그인할 것):\n");
  console.log(authUrl + "\n");

  const opener =
    process.platform === "win32"
      ? `start "" "${authUrl}"`
      : process.platform === "darwin"
      ? `open "${authUrl}"`
      : `xdg-open "${authUrl}"`;
  exec(opener, () => {});
});
