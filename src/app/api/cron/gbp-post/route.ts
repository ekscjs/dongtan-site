import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { postToGoogleBusinessProfile } from "@/lib/gbp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 매주 화요일 10:00 KST — vercel.json crons 참고
// gbp_post_queue에서 발행 예정일이 된 건을 찾아 GBP에 즉시 POST하고 결과를 기록한다.
// 문안 작성은 이 코드의 책임이 아니다 — 큐에 이미 완성된 summary가 들어있어야 한다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const kstDateStr = (d: Date) => new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

type QueueRow = {
  id: number;
  slug: string;
  summary: string;
  image_url: string | null;
  scheduled_date: string;
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = kstDateStr(new Date());

  const { data: dueRows, error: fetchError } = await supabaseAdmin
    .from("gbp_post_queue")
    .select("id, slug, summary, image_url, scheduled_date")
    .eq("published", false)
    .lte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(1); // 밀린 건이 여러 개여도 한 번에 1건만 — 같은 날 여러 건이 뜨면 스팸으로 보인다. 나머지는 다음 실행으로 자연 이월

  if (fetchError) {
    return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
  }

  const targets = (dueRows ?? []) as QueueRow[];
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, posted: 0, message: "오늘 발행할 게 없음" });
  }

  const results: { id: number; slug: string; ok: boolean; localPostId?: string; error?: string }[] = [];

  for (const row of targets) {
    try {
      const { localPostId } = await postToGoogleBusinessProfile({
        slug: row.slug,
        summary: row.summary,
        imageUrl: row.image_url,
      });

      await supabaseAdmin
        .from("gbp_post_queue")
        .update({
          published: true,
          published_at: new Date().toISOString(),
          local_post_id: localPostId,
          error: null,
        })
        .eq("id", row.id);

      results.push({ id: row.id, slug: row.slug, ok: true, localPostId });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await supabaseAdmin.from("gbp_post_queue").update({ error: message }).eq("id", row.id);
      results.push({ id: row.id, slug: row.slug, ok: false, error: message });
    }
  }

  return NextResponse.json({ ok: true, posted: results.filter((r) => r.ok).length, results });
}
