import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      anon_id,
      areas,
      area_count,
      answers_raw,
      findings,
      priority1_count,
      entry_area,
    } = body;

    await supabaseAdmin.from("pain_map_results").insert({
      anon_id: anon_id || null,
      areas: Array.isArray(areas) ? areas : null,
      area_count: area_count ?? null,
      answers_raw: answers_raw ?? null,
      findings: Array.isArray(findings) ? findings : null,
      priority1_count: priority1_count ?? null,
      entry_area: entry_area || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // 저장 실패는 조용히 처리 (사용자 경험 방해 금지)
    console.error("[pain-map]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
