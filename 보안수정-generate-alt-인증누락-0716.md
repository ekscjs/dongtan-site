# 작업지시서 — generate-alt 라우트 인증 누락 수정 (2026-07-16, 보안)

## 문제
`src/app/api/admin/generate-alt/route.ts`에 관리자 인증 체크가 없음. 로그인 없이 누구나
POST로 이미지 올려서 우리 Anthropic API 키로 Claude Vision을 호출할 수 있음(비용 남용 가능).

## 수정
`src/app/api/admin/leads/route.ts`에 이미 있는 것과 똑같은 패턴으로 인증 체크 추가:

```ts
import { cookies } from "next/headers";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "1";
}
```

`export async function POST(req: NextRequest) {` 바로 다음 줄에:

```ts
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
```

추가. (`NextResponse`는 이미 import돼 있음, `cookies`만 새로 import)

## 검증
1. 로그인 안 한 상태에서 `/api/admin/generate-alt`에 POST(이미지 첨부) 보내면 401 뜨는지.
2. 관리자로 로그인한 상태에서 admin 페이지의 alt문구 자동생성 기능이 그대로 잘 되는지(회귀 확인).
3. `npm run build` 통과.

## 커밋 / 푸시
```
git add -A
git commit -m "fix: generate-alt 라우트에 관리자 인증 체크 추가 (미인증 API 남용 방지)"
git push
```
