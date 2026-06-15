import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const program = String(body.program ?? "").trim();
    const preferred = String(body.preferred ?? "").trim() || null;
    const message = String(body.message ?? "").trim() || null;
    const source = String(body.source ?? "").trim() || null;

    if (!name || name.length > 40) {
      return NextResponse.json({ error: "이름을 확인해주세요." }, { status: 400 });
    }
    if (!phone || phone.replace(/[^0-9]/g, "").length < 9) {
      return NextResponse.json({ error: "연락처를 확인해주세요." }, { status: 400 });
    }
    if (!program) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("leads")
      .insert([{ name, phone, program, preferred, message, source }]);

    if (error) {
      console.error("lead insert error:", error.message);
      return NextResponse.json({ error: "저장 중 문제가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
