import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listGbpReviews, replyToGbpReview, starRatingToNumber, type GbpReview } from "@/lib/gbpReviews";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// 답글 문안 규칙 — 작업지시서-GBP-리뷰답글-자동화-0801.md 4번 그대로
const REPLY_SYSTEM_PROMPT = `너는 내몸에미소(경기도 화성시 동탄) 건강센터의 구글 비즈니스 프로필 리뷰 답글을 쓴다.

반드시 지킬 것:
- 150자 내외. 길면 아무도 안 읽고 템플릿 티만 난다
- 화자는 브랜드("저희"). 원장 개인이 아니다
- 리뷰 내용에서 구체적으로 한 가지를 집어 언급한다 (어느 부위가 편해졌다고 했는지, 무엇이 좋았다는지)
- 존댓말, 담백하게. 과장된 감사 표현 반복 금지
- 별점만 있고 본문 없는 리뷰는 2~3문장으로 짧게
- 부정 리뷰는 반박하지 말고 오프라인 대화를 제안한다(예: "센터로 편하게 말씀해주시면 바로 확인하겠습니다")

절대 금지:
- 작성자 실명 호명 금지. "○○님, 감사합니다" 식으로 이름을 부르지 말 것. "회원님" 또는 호칭 없이 쓰되, "회원님"을 매번 기계적으로 첫머리에 붙이지도 말 것
- 회원의 성과를 센터 공으로 가져오지 말 것. 좋아진 건 본인이 한 것
- 질환명 확정("회전근개 파열이 좋아지셨다니" 등) 금지
- 약물·주사·시술·수술 언급 금지
- 치료 효과 보장·단정("완치", "재발 없습니다" 류) 금지
- 수치 전후비교(개선율·각도 변화 등) 언급 금지
- 리뷰어의 몸 상태를 리뷰 본문에 없는 내용까지 확정해서 쓰지 말 것 — 리뷰어 본인이 쓴 범위 안에서만 받는다
- 사인오프 반복 금지("내몸에미소 드림", "항상 건강하세요" 같은 마무리를 매번 똑같이 쓰지 말 것) — 마무리 문장은 매번 다르게
- 링크·전화번호·가격 넣지 말 것

답글 텍스트만 출력한다. 설명·따옴표·마크다운 없이.`;

const STAR_LABEL: Record<string, string> = {
  ONE: "1점", TWO: "2점", THREE: "3점", FOUR: "4점", FIVE: "5점", STAR_RATING_UNSPECIFIED: "(별점 없음)",
};

async function generateReplyDraft(review: GbpReview): Promise<string> {
  const comment = review.comment?.trim();
  const userMessage = comment
    ? `[별점] ${STAR_LABEL[review.starRating] ?? review.starRating}\n[리뷰 본문]\n${comment}`
    : `[별점] ${STAR_LABEL[review.starRating] ?? review.starRating}\n[리뷰 본문] (본문 없음, 별점만 남김)`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: REPLY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  return (message.content[0] as { type: string; text: string }).text.trim();
}

type QueuedNotice = { starLabel: string; comment: string | null; draft: string };

async function sendPendingReviewEmail(items: QueuedNotice[]) {
  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:10px 0;border-top:1px solid #eee;">
        <div style="color:#888;font-size:13px;margin-bottom:4px;">${it.starLabel}</div>
        <div style="margin-bottom:8px;">${(it.comment ?? "(본문 없음)").replace(/</g, "&lt;")}</div>
        <div style="color:#555;font-size:13px;background:#f7f7f7;padding:8px 10px;border-radius:6px;">
          <b>AI 초안</b><br/>${it.draft.replace(/</g, "&lt;")}
        </div>
      </td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: "내몸에미소 <onboarding@resend.dev>",
    to: process.env.NOTIFY_EMAIL!,
    subject: `[GBP 리뷰 검토 필요] 낮은 별점 ${items.length}건 대기중`,
    html: `
      <h2>낮은 별점 리뷰 — 답글 검토 필요</h2>
      <p style="color:#888;font-size:13px;">자동 발행하지 않고 대기 상태로 저장했습니다. GBP에서 직접 답글을 달아주시거나, 초안을 수정해서 코워크에 전달해주세요.
      (승인 화면은 아직 없습니다 — 리뷰가 더 쌓이면 만듭니다.)</p>
      <table style="border-collapse:collapse;width:100%;">${rows}</table>
      <p style="margin-top:16px;"><a href="https://business.google.com/">Google Business Profile에서 확인</a></p>
    `,
  });
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from("gbp_reviews")
    .select("review_id");
  if (existingError) {
    return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
  }
  const existingIds = new Set((existingRows ?? []).map((r) => r.review_id as string));

  let reviews: GbpReview[];
  try {
    reviews = await listGbpReviews();
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  const now = new Date().toISOString();
  const pendingForEmail: QueuedNotice[] = [];
  const results: { reviewId: string; action: string }[] = [];

  for (const review of reviews) {
    const starNumber = starRatingToNumber(review.starRating);
    const baseFields = {
      star_rating: starNumber,
      reviewer_name: review.reviewer?.displayName ?? null,
      comment: review.comment ?? null,
      create_time: review.createTime,
      update_time: review.updateTime,
      fetched_at: now,
    };
    const isNew = !existingIds.has(review.reviewId);

    if (!isNew) {
      // 이미 알고 있는 리뷰 — 답글 관련 컬럼은 절대 건드리지 않고 메타데이터만 갱신
      await supabaseAdmin.from("gbp_reviews").update(baseFields).eq("review_id", review.reviewId);
      results.push({ reviewId: review.reviewId, action: "metadata_refreshed" });
      continue;
    }

    if (review.reviewReply) {
      // 이전에 수동으로 단 답글(예: 2026-07-27 코워크 작업분) — 덮어쓰지 않고 기록만
      await supabaseAdmin.from("gbp_reviews").insert({
        review_id: review.reviewId,
        ...baseFields,
        reply_draft: review.reviewReply.comment,
        reply_status: "published",
        published_at: review.reviewReply.updateTime,
        error: null,
      });
      results.push({ reviewId: review.reviewId, action: "existing_reply_recorded" });
      continue;
    }

    // 신규 리뷰, 답글 없음 → 초안 생성
    let draft: string;
    try {
      draft = await generateReplyDraft(review);
    } catch (e) {
      await supabaseAdmin.from("gbp_reviews").insert({
        review_id: review.reviewId,
        ...baseFields,
        reply_draft: null,
        reply_status: "pending",
        error: `draft 생성 실패: ${e instanceof Error ? e.message : String(e)}`,
      });
      results.push({ reviewId: review.reviewId, action: "draft_failed" });
      continue;
    }

    if (starNumber >= 4) {
      try {
        await replyToGbpReview(review.reviewId, draft);
        await supabaseAdmin.from("gbp_reviews").insert({
          review_id: review.reviewId,
          ...baseFields,
          reply_draft: draft,
          reply_status: "published",
          published_at: now,
          error: null,
        });
        results.push({ reviewId: review.reviewId, action: "published" });
      } catch (e) {
        await supabaseAdmin.from("gbp_reviews").insert({
          review_id: review.reviewId,
          ...baseFields,
          reply_draft: draft,
          reply_status: "pending",
          error: e instanceof Error ? e.message : String(e),
        });
        results.push({ reviewId: review.reviewId, action: "publish_failed" });
      }
    } else {
      await supabaseAdmin.from("gbp_reviews").insert({
        review_id: review.reviewId,
        ...baseFields,
        reply_draft: draft,
        reply_status: "pending",
        error: null,
      });
      pendingForEmail.push({
        starLabel: STAR_LABEL[review.starRating] ?? review.starRating,
        comment: review.comment ?? null,
        draft,
      });
      results.push({ reviewId: review.reviewId, action: "pending_low_rating" });
    }
  }

  if (pendingForEmail.length > 0) {
    try {
      await sendPendingReviewEmail(pendingForEmail);
    } catch (e) {
      console.error("[gbp-reviews] 알림 메일 발송 실패:", e);
    }
  }

  return NextResponse.json({ ok: true, total: reviews.length, results });
}
