// GBP account/location ID 조회 (0-C) — 신형 분리 API 사용 (gen-lang-client-0240544169, 300 QPM 승인됨)
// 사용법: node --env-file=.env.local scripts/gbp-get-ids.mjs
const CLIENT_ID = process.env.GBP_CLIENT_ID;
const CLIENT_SECRET = process.env.GBP_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GBP_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

async function safeFetchJson(label, url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`\n[${label}] JSON 파싱 실패. status: ${res.status}`);
    console.error(`content-type: ${res.headers.get("content-type")}`);
    console.error(text.slice(0, 1000));
    process.exit(1);
  }
  return { res, json };
}

async function getAccessToken() {
  const { res, json } = await safeFetchJson("token refresh", "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("액세스 토큰 갱신 실패:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  return json.access_token;
}

async function main() {
  const accessToken = await getAccessToken();
  console.log("액세스 토큰 발급 완료 (길이:", accessToken.length, ")");
  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const { res: accountsRes, json: accountsJson } = await safeFetchJson(
    "mybusinessaccountmanagement v1/accounts",
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: authHeaders }
  );

  console.log("\n=== mybusinessaccountmanagement v1/accounts ===");
  console.log("status:", accountsRes.status);
  console.log(JSON.stringify(accountsJson, null, 2));

  if (!accountsRes.ok) {
    process.exit(1);
  }

  const accounts = accountsJson.accounts || [];
  if (accounts.length === 0) {
    console.error(
      "\naccounts가 비어 있습니다. → 로그인한 계정이 GBP 소유 계정이 아닐 가능성이 높습니다.\n"
    );
    process.exit(1);
  }

  for (const acc of accounts) {
    const accountId = acc.name.split("/")[1];
    const locUrl =
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations` +
      "?readMask=" + encodeURIComponent("name,title,storeCode,storefrontAddress");

    const { res: locRes, json: locJson } = await safeFetchJson(
      `mybusinessbusinessinformation v1/accounts/${accountId}/locations`,
      locUrl,
      { headers: authHeaders }
    );

    console.log(`\n=== locations for account ${accountId} (${acc.accountName ?? ""}) ===`);
    console.log("status:", locRes.status);
    console.log(JSON.stringify(locJson, null, 2));
  }
}

main();
