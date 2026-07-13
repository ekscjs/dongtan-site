import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
  }

  const { data: settings } = await supabaseAdmin
    .from("admin_settings")
    .select("id, password_hash")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  let valid = false;

  if (settings?.password_hash) {
    valid = await bcrypt.compare(password, settings.password_hash);
  } else {
    // 마이그레이션 기간 폴백 — DB에 해시가 아직 없으면 기존 env var로 검증
    valid = password === process.env.ADMIN_PASSWORD;
    if (valid) {
      // 최초 로그인 성공 시 자동 시드 (admin_settings 테이블이 아직 없으면 조용히 스킵 —
      // 로그인 자체는 env var 폴백으로 이미 성공했으므로 실패해도 무방)
      try {
        const hash = await bcrypt.hash(password, 10);
        const { error } = await supabaseAdmin.from("admin_settings").insert({ password_hash: hash });
        if (error) console.warn("admin_settings 자동 시드 실패:", error.message);
      } catch (e) {
        console.warn("admin_settings 자동 시드 오류:", e);
      }
    }
  }

  if (!valid) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: "/",
  });
  // JS에서 읽을 수 있는 플래그 쿠키 (Tracker 관리자 제외용)
  cookieStore.set("admin_flag", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
