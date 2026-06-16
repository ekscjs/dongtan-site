import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 알림 메일 발송 (실패해도 신청은 정상 처리)
    resend.emails.send({
      from: "내몸에미소 <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: `[신청] ${name} — ${program}`,
      html: `
        <h2>새 신청이 들어왔어요 🌿</h2>
        <table style="border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:6px 16px 6px 0;color:#888;">이름</td><td><b>${name}</b></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888;">연락처</td><td><b>${phone}</b></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#888;">프로그램</td><td>${program}</td></tr>
          ${preferred ? `<tr><td style="padding:6px 16px 6px 0;color:#888;">희망일시</td><td>${preferred}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:6px 16px 6px 0;color:#888;">메모</td><td>${message}</td></tr>` : ""}
        </table>
        <p style="margin-top:20px;color:#888;font-size:13px;">👉 <a href="https://www.bodymiso.com/admin/leads">관리자 페이지에서 확인</a></p>
      `,
    }).catch((e) => console.error("resend error:", e));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
