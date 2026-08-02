// Google Business Profile (구 GMB) v4 localPosts API — accounts/locations 조회는 신형 분리 API로
// 승인됐지만, localPosts는 레거시 v4에만 있다 (작업지시서-GBP-게시물-자동발행-0727.md 참고)

async function getGbpAccessToken(): Promise<string> {
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

export type GbpPostInput = {
  slug: string;
  summary: string;
  imageUrl: string | null;
};

export type GbpPostResult = {
  localPostId: string;
  raw: unknown;
};

// POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
// 예약 발행 필드 없음 — 호출 즉시 게시된다.
export async function postToGoogleBusinessProfile(input: GbpPostInput): Promise<GbpPostResult> {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;
  if (!accountId || !locationId) {
    throw new Error("GBP_ACCOUNT_ID / GBP_LOCATION_ID 환경변수 없음");
  }

  const accessToken = await getGbpAccessToken();

  const body: Record<string, unknown> = {
    languageCode: "ko",
    summary: input.summary,
    callToAction: {
      actionType: "LEARN_MORE",
      url: `https://www.bodymiso.com/blog/${input.slug}`,
    },
    topicType: "STANDARD",
  };
  if (input.imageUrl) {
    body.media = [{ mediaFormat: "PHOTO", sourceUrl: input.imageUrl }];
  }

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(`GBP localPosts.create 실패 (${res.status}): ${JSON.stringify(json)}`);

  const localPostId = String(json.name ?? "").split("/").pop() ?? "";
  return { localPostId, raw: json };
}
