# [내몸에미소 센터] 작업지시서 — 관리자 미소코치 질문 로그 화면

작성일: 2026-07-27
실행 순서: `작업지시서-미소코치-이름변경및말투개선-0727.md` 이후 (화면 문구가 "미소코치"여야 함)

---

## 배경 / 목적

`ask_logs` 테이블에 **방문자가 실제로 입력한 증상 문구가 이미 쌓이고 있다.**
그런데 관리자 화면에는 **건수 카운트 3개**(`ai_ask_submit` / `ai_ask_click_post` / `ai_ask_click_tool`)만
있고 **질문 내용을 볼 방법이 없다.**

이건 블로그 글감·FAQ의 1차 자료다. 지금 방치돼 있다.

**이 화면이 3단계(미소코치 멀티턴 고도화)를 할지 말지 판단하는 근거가 된다.**
질문 성격을 봐야 후속 질문 기능이 필요한지 알 수 있다.

---

## 개인정보

`ask_logs`에는 `query`(증상 문구)와 `ip_hash`(비식별 해시)만 있다.
**`ip_hash`는 화면에 절대 노출하지 않는다.** 반복 방문 판별용으로 서버에서만 쓴다.

---

## 작업 1. API 라우트 신설

**새 파일:** `src/app/api/admin/ask-logs/route.ts`

`src/app/api/admin/leads/route.ts`와 **같은 인증 패턴**을 쓴다 (`isAdmin()` from `@/lib/adminAuth`).

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(new URL(req.url).searchParams.get("days") ?? 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("ask_logs")
    .select("id, created_at, query, ip_hash")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ip_hash는 응답에 내보내지 않는다. 같은 사람 반복 여부만 계산해서 넘긴다.
  const counts = new Map<string, number>();
  (data ?? []).forEach((r) => counts.set(r.ip_hash, (counts.get(r.ip_hash) ?? 0) + 1));

  const rows = (data ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    query: r.query,
    repeat: (counts.get(r.ip_hash) ?? 1) > 1, // 같은 방문자가 2회 이상 질문했는지
  }));

  return NextResponse.json({ rows, total: rows.length });
}
```

**`ip_hash`가 응답 JSON에 절대 포함되지 않도록** 반드시 확인한다.

---

## 작업 2. 화면 신설

**새 파일:** `src/app/admin/ask-logs/page.tsx`

`src/app/admin/leads/page.tsx`의 구조·스타일을 그대로 따른다.
(클라이언트 컴포넌트, fetch로 데이터 로드, 로딩·에러 처리)

### 화면 구성

**상단 요약**

- 총 질문 수 (기간 내)
- 재질문 방문자 비율 — `repeat: true` 비율
  → **이 숫자가 높으면 멀티턴(후속 질문) 기능의 근거가 된다**

**기간 필터**

`7일 / 30일 / 90일` 버튼 3개. 기본 30일. `?days=` 로 API에 전달.

**검색창**

입력한 문구가 포함된 질문만 필터링. **클라이언트에서 필터링한다** (최대 500건이라 서버 쿼리 불필요).

**목록**

| 날짜 | 질문 | |
|---|---|---|
| 07-26 14:22 | 앉으면 허리가 아파요 | 재질문 뱃지 |

- 최신순
- 질문 문구는 자르지 말고 전문을 보여준다 (글감이 잘리면 의미 없음)
- `repeat: true`면 회색 뱃지 "재질문"
- 각 행 오른쪽에 **복사 버튼** — 질문 문구를 클립보드로. 글감 옮길 때 쓴다

**빈 상태**

"아직 질문이 없습니다. 미소코치 유입이 늘면 여기에 쌓입니다."

---

## 작업 3. 관리자 메뉴에 링크 추가

**파일:** `src/app/admin/page.tsx`

기존 메뉴 카드(글 목록 / 문의 / 애널리틱스 등) 옆에 카드를 하나 추가한다.

- 제목: **미소코치 질문 로그**
- 설명: 방문자가 실제로 물어본 증상 — 글감·FAQ 자료
- 링크: `/admin/ask-logs`

기존 카드와 동일한 스타일을 쓴다.

---

## 작업 4. 애널리틱스 화면에서 연결

**파일:** `src/app/admin/analytics/page.tsx` (742행 부근 "미소코치 사용 현황" 묶음)

카드 묶음 헤더 옆에 링크를 단다:

```tsx
<Link href="/admin/ask-logs" className="text-sm text-[#7B2D8B] hover:underline">
  질문 내용 보기 →
</Link>
```

숫자를 보다가 바로 내용으로 넘어갈 수 있게 한다.

---

## 하면 안 되는 것

- `ip_hash` 화면 노출 ❌
- 질문 문구 자르기(truncate) ❌ — 전문을 봐야 글감이 나온다
- 삭제 기능 ❌ (이번엔 불필요. 나중에 필요하면 추가)
- 로그인 없이 접근 가능한 경로 ❌ — `isAdmin()` 반드시 통과시킬 것
- 이 화면을 검색엔진에 노출 ❌ — `src/app/admin/layout.tsx`에 이미
  `robots: { index: false, follow: false }` 가 걸려 있으니 그대로 상속받게 두면 된다

---

## 검증

1. `npm run build` — 타입 에러 0
2. **로그아웃 상태**에서 `/api/admin/ask-logs` 직접 호출 → `401` 확인 (인증 우회 없는지)
3. 로그인 후 `/admin/ask-logs` 접속 → 목록 표시
4. 응답 JSON에 `ip_hash`가 **없는지** 브라우저 네트워크 탭에서 확인
5. 기간 필터 7/30/90일 각각 동작
6. 검색창에 "허리" 입력 → 해당 질문만 남는지
7. 복사 버튼 → 클립보드에 질문 문구 들어가는지
8. `/admin` 메인에 새 카드 보이는지

---

## 관장님이 할 일

없음.
배포 후 `www.bodymiso.com/admin` → **미소코치 질문 로그** 들어가서
질문 목록을 한 번 훑어봐 주세요.

**보실 때 이걸 봐주시면 됩니다:**
- 블로그에 없는 주제가 반복해서 올라오는가 → 새 글감
- 같은 질문이 여러 번 → FAQ 후보
- 재질문 비율이 높은가 → 3단계 멀티턴 도입 근거
