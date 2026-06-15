import { createClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트 — 서비스 롤 키 사용. 절대 클라이언트(브라우저)로 import 금지.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
