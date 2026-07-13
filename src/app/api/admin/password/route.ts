import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_auth")?.value === "1";
  if (!isAuthed) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "새 비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }

  const { data: settings } = await supabaseAdmin
    .from("admin_settings")
    .select("id, password_hash")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const currentValid = settings?.password_hash
    ? await bcrypt.compare(currentPassword, settings.password_hash)
    : currentPassword === process.env.ADMIN_PASSWORD;

  if (!currentValid) {
    return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  const { error } = settings?.id
    ? await supabaseAdmin
        .from("admin_settings")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", settings.id)
    : await supabaseAdmin.from("admin_settings").insert({ password_hash: newHash });

  if (error) {
    return NextResponse.json({ error: "저장 실패: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
