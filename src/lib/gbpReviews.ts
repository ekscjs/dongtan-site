// GBP v4 reviews API — 목록 조회 + 답글 작성
import { getGbpAccessToken } from "./gbpAuth";

export type StarRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "STAR_RATING_UNSPECIFIED";

export type GbpReview = {
  reviewId: string;
  reviewer?: { displayName?: string };
  starRating: StarRating;
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
};

const STAR_TO_NUMBER: Record<StarRating, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  STAR_RATING_UNSPECIFIED: 0,
};

export function starRatingToNumber(rating: StarRating): number {
  return STAR_TO_NUMBER[rating] ?? 0;
}

// GET .../reviews?orderBy=updateTime desc&pageSize=50 — nextPageToken 있으면 끝까지 따라간다
export async function listGbpReviews(): Promise<GbpReview[]> {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;
  if (!accountId || !locationId) {
    throw new Error("GBP_ACCOUNT_ID / GBP_LOCATION_ID 환경변수 없음");
  }

  const accessToken = await getGbpAccessToken();
  const reviews: GbpReview[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
    );
    url.searchParams.set("orderBy", "updateTime desc");
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json();
    if (!res.ok) throw new Error(`GBP reviews.list 실패 (${res.status}): ${JSON.stringify(json)}`);

    reviews.push(...((json.reviews ?? []) as GbpReview[]));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return reviews;
}

// PUT .../reviews/{reviewId}/reply — 없으면 생성, 있으면 덮어쓴다
export async function replyToGbpReview(reviewId: string, comment: string): Promise<void> {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;
  if (!accountId || !locationId) {
    throw new Error("GBP_ACCOUNT_ID / GBP_LOCATION_ID 환경변수 없음");
  }

  const accessToken = await getGbpAccessToken();
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GBP reviews.updateReply 실패 (${res.status}): ${JSON.stringify(json)}`);
}
