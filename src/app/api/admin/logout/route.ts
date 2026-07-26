import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete("admin_auth"); // 구 쿠키 잔재 정리
  cookieStore.delete("admin_flag");
  return NextResponse.json({ ok: true });
}
