import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30일

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 없거나 32자 미만입니다");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** 로그인 성공 시 쿠키에 넣을 토큰 생성 — `<만료초>.<난수>.<서명>` */
export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

/** 토큰 검증 — 서명 불일치·형식 오류·만료 전부 false */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const expected = sign(`${expStr}.${nonce}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual은 길이 다르면 throw
  if (!timingSafeEqual(a, b)) return false; // 타이밍 공격 방지 — === 쓰지 말 것
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  return exp > Math.floor(Date.now() / 1000);
}

/** 라우트에서 쓰는 인증 확인 — 환경변수 누락 시에도 절대 통과시키지 않는다 */
export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  } catch {
    return false; // secret() throw 포함 — fail-closed
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SEC;
