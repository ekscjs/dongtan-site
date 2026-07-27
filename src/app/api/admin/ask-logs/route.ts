import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(new URL(req.url).searchParams.get("days") ?? 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("ask_logs")
    .select("id, created_at, query, ip_hash")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ip_hash는 응답에 내보내지 않는다. 같은 사람 반복 여부만 계산해서 넘긴다.
  const counts = new Map<string, number>();
  (data ?? []).forEach((r) => counts.set(r.ip_hash, (counts.get(r.ip_hash) ?? 0) + 1));

  const rows = (data ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    query: r.query,
    repeat: (counts.get(r.ip_hash) ?? 1) > 1, // 같은 방문자가 2회 이상 질문했는지
  }));

  return NextResponse.json({ rows, total: rows.length });
}
