import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      anon_id,
      sitting_hours,
      main_area,
      worse_when,
      forward_head,
      round_shoulder,
      uneven_stance,
      temporary_relief,
      pain_severity,
      answers_raw,
      result_type,
      risk_label,
      risk_score,
      is_retest,
    } = body;

    await supabaseAdmin.from("self_check_results").insert({
      anon_id: anon_id || null,
      sitting_hours: sitting_hours || null,
      main_area: main_area || null,
      worse_when: worse_when || null,
      forward_head: forward_head || null,
      round_shoulder: round_shoulder || null,
      uneven_stance: uneven_stance || null,
      temporary_relief: temporary_relief || null,
      pain_severity: pain_severity || null,
      answers_raw: answers_raw ?? null,
      result_type: result_type || null,
      risk_label: risk_label || null,
      risk_score: risk_score ?? null,
      is_retest: is_retest ?? false,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // 저장 실패는 조용히 처리 (사용자 경험 방해 금지)
    console.error("[self-check]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
