# 작업지시서 — 홈 title 개편 + 서치콘솔 데이터 확장 (2026-08-02)

담당: 로컬 Claude Code (dongtan-site)
예상 소요: 10~15분
프로젝트: [내몸에미소 센터] bodymiso.com

---

## 배경 (왜 하는지)

1. 구글 모바일 검색결과에서 홈 제목이 **"내몸에미소 | 동탄 허리"** 로 잘려 노출됨.
   구글은 이미 검색결과 상단에 사이트명("내몸에미소")을 **별도 줄**로 표시하는데,
   title 앞머리에 브랜드명이 또 들어가 있어 앞 11자가 통째로 낭비되고
   정작 노출돼야 할 "체형·재활 운동센터"가 잘려나감.
   → **브랜드명을 뒤로 보내고 키워드를 앞으로.**

2. `/api/admin/search-console` 은 이미 정상 연동 상태(2026-08-02 라이브 200 확인).
   그러나 **28일 · 상위 20개** 고정이라 실제로 잡히는 검색어가 4건뿐이라
   키워드 전략 판단이 불가능. → **기간·건수 확장.**

---

## 작업 A — 홈 metadata 수정

**파일:** `src/app/layout.tsx`

### A-1. title (38행)

```diff
-  title: "내몸에미소 | 동탄 허리·체형·재활 운동센터",
+  title: "동탄 허리·무릎·어깨 통증 운동 | 내몸에미소",
```

의도:
- 부위 3개를 모두 담아 유입 모수를 좁히지 않음
- "재활"의 중증 뉘앙스를 피하고 "통증"으로 진입장벽 낮춤
- 모바일에서 잘려도 `동탄 허리·무릎·어깨` 까지는 살아남음

### A-2. description (39~40행) — **변경 없음, 현행 유지**

이미 "동탄에서 허리·무릎·어깨 통증..." 으로 시작해 방향이 맞고,
"누적 200명·재등록률 90%" 신뢰 신호도 살아 있음. 건드리지 말 것.

### A-3. keywords (41~50행)

부위·증상 키워드를 앞에 추가한다. 기존 항목은 지우지 말고 **뒤로 밀 것**.

```diff
   keywords: [
+    "동탄 허리 통증",
+    "동탄 무릎 통증",
+    "동탄 어깨 통증",
+    "동탄 통증 운동센터",
     "동탄 체형교정",
     "동탄 재활운동",
     "동탄 재활",
     "동탄 기능개선",
     "동탄 자세교정",
     "동탄 통증 운동",
     "동탄 재활 PT",
     "동탄 운동센터",
   ],
```

### A-4. openGraph.title (52행)

"기능개선"은 고객이 쓰는 말이 아님이 확인됨(관장 확인, 2026-08-02).

```diff
-    title: "내몸에미소 - 기능개선·재활·체형교정 전문",
+    title: "내몸에미소 — 동탄 허리·무릎·어깨 통증 운동",
```

> SNS 공유 카드는 브랜드명이 앞에 오는 게 맞으므로 순서는 그대로 둔다.
> twitter.title 이 별도로 존재하면 동일하게 맞출 것.

---

## 작업 B — 블로그 목록 title 개편

**배경:** `/blog` 가 구글 평균순위 **2.27위**인데 CTR이 **2.7%** (노출 73 / 클릭 2).
2위권이면 통상 15~20%가 나온다. 최상단 노출인데 안 눌린다 = 제목이 검색 의도와 안 맞는다는 신호.
현재 제목이 `블로그 | 내몸에미소` 로, 내용을 전혀 설명하지 못함.

**파일:** `src/app/blog/blogUrl.ts` (22~26행)

```diff
 export function buildBlogTitle(cat: Category, page: number): string {
-  const base = cat === "전체" ? "블로그" : cat;
-  const suffix = page > 1 ? ` (${page}페이지)` : "";
-  return `${base}${suffix} | 내몸에미소`;
+  const base =
+    cat === "임상노트"
+      ? "임상노트 — 실제 회원 몸의 변화 기록"
+      : cat === "몸 이야기"
+        ? "몸 이야기 — 통증·체형 운동 가이드"
+        : "허리·무릎·어깨 통증 운동 이야기";
+  const suffix = page > 1 ? ` (${page}페이지)` : "";
+  return `${base}${suffix} | 내몸에미소`;
 }
```

주의: 이 함수는 `src/app/blog/page.tsx` 의 `generateMetadata` 에서만 쓰이는지
호출부를 먼저 확인할 것. 화면에 보이는 헤딩으로도 쓰이고 있으면 **metadata 전용으로 분리**하고
화면 헤딩은 기존 문구("블로그")를 유지한다.

---

## 작업 C — 서치콘솔 조회 범위 확장

**파일:** `src/app/api/admin/search-console/route.ts`

### C-1. 기간을 28일 → 90일로, 쿼리스트링으로 조절 가능하게

```diff
-    // 최근 28일 날짜 범위
     const endDate = new Date();
     endDate.setDate(endDate.getDate() - 3); // Search Console는 3일 지연
+    // 기본 90일. ?days=180 처럼 조절 가능 (Search Console 최대 16개월)
+    const days = Math.min(Number(req.nextUrl.searchParams.get("days")) || 90, 480);
     const startDate = new Date(endDate);
-    startDate.setDate(startDate.getDate() - 28);
+    startDate.setDate(startDate.getDate() - days);
```

### C-2. rowLimit 확대

- 검색어(query) 블록: `rowLimit: 20` → **`rowLimit: 100`**
- 페이지(page) 블록: `rowLimit: 10` → **`rowLimit: 50`**

> 검색어가 4건밖에 안 잡히는 주된 원인은 구글의 저빈도 쿼리 익명 처리다.
> 기간을 늘리면 누적 노출이 임계를 넘어 일부가 풀린다. rowLimit 확대는 그에 대한 대비.

### C-3. 응답에 기간 길이 포함

```diff
-      period: { start: fmt(startDate), end: fmt(endDate) },
+      period: { start: fmt(startDate), end: fmt(endDate), days },
```

`period` 타입을 쓰는 곳(`src/app/admin/analytics/page.tsx`)에서 타입 에러가 나면
`days?: number` 로 옵셔널 추가할 것.

---

## 작업 D — analytics 화면 오해 문구 수정

**파일:** `src/app/admin/analytics/page.tsx` (279행, 886~888행)

라우트가 오류 시에도 200을 반환하도록 설계돼 있어, 실제로는 연동돼 있는데도
일시적 실패 시 **"Search Console 미연동"** 이라는 잘못된 안내가 뜬다.
(연동은 2026-08-02 정상 확인됨)

- 279행 `error: "Search Console 미연동"` → `error: "Search Console 데이터를 불러오지 못했습니다"`
- 886행 제목 `Search Console 미연동` → `검색어 데이터 없음`
- 887행 본문 → `아직 구글에 잡힌 검색어가 적거나 일시적 오류입니다. 잠시 후 다시 시도해 주세요.`

---

## 검증 (반드시 이 순서로)

1. `npm run build` 통과 — 타입 에러 없을 것
2. 배포 후 **원본 HTML로** title 확인 (브라우저 DOM 말고 curl):

```powershell
curl -s https://www.bodymiso.com/ | Select-String -Pattern "<title>"
curl -s https://www.bodymiso.com/blog | Select-String -Pattern "<title>"
```

기대값:
- `/` → `동탄 허리·무릎·어깨 통증 운동 | 내몸에미소`
- `/blog` → `허리·무릎·어깨 통증 운동 이야기 | 내몸에미소`

3. `/admin/analytics` 접속해 검색어 표가 기존보다 많은 행을 보이는지 확인
   (28일 4건 → 90일 기준 증가 예상. 안 늘면 데이터 자체가 없는 것이니 정상)

---

## 하지 말 것

- description 본문 수정 (현행이 맞음)
- 기존 keywords 항목 삭제 (뒤로 밀기만)
- 개별 블로그 글(`/blog/[slug]`)의 title 포맷 변경 — 이번 범위 아님
- canonical, verification, metadataBase 등 다른 metadata 필드 손대기

---

## 완료 후

커밋 메시지 예시:

```
feat: 홈·블로그 title SEO 개편 + 서치콘솔 조회범위 90일 확장
```

작업 끝나면 코워크(naemiso-brand 대화)에 "0802 title 지시서 완료" 라고만 알려주면 됨.

---

## 다음 단계 (2~3주 뒤, 코워크 담당)

90일치 검색어가 쌓이면 그 데이터로 **"체형교정 vs 통증" 키워드 축을 최종 확정**한다.
현재는 표본 4건이라 확정 불가 상태이며, 이번 작업은 어떤 키워드를 택하든
손해가 없는 **구조 개선**(브랜드명 위치)만 선반영한 것이다.
