# 작업지시서 — /blog 목록이 크롤러에게 빈 페이지로 나가는 문제 (2026-07-26)

> **우선순위: 최상.** 이건 새 기능이 아니고 **이미 두 번 고쳤다고 처리된 문제가 실제로는 안 고쳐진 것**이다.
> 관련 커밋 `0d7d7ef`(관리자 글목록 검색+페이지네이션), `08aaafa`(블로그 목록 서버렌더링 보완) 둘 다 목표 달성 실패.

## 증거 (원본 HTML 직접 확인, 2026-07-26)

브라우저 DOM이 아니라 **크롤러가 받는 원본 HTML**을 받아서 비교했다.

| URL | canonical | title | 본문 |
|---|---|---|---|
| `/blog/pain-site-not-the-cause` (개별 글) | `.../blog/pain-site-not-the-cause` ✅ | 글 제목 ✅ | 본문·내부링크 **전부 있음** ✅ |
| **`/blog` (목록)** | **`https://www.bodymiso.com`** ❌ | **홈 title** ❌ | **완전히 비어 있음** ❌ |

개별 글 페이지는 정상이므로 "측정 도구가 메타데이터를 못 읽는 것"이 아니다. **`/blog` 만 실제로 빈 HTML을 내보내고 있다.**

즉 **구글 크롤러는 블로그 목록에서 글 링크를 단 하나도 못 받는다.** 페이지네이션을 붙였어도 크롤러 입장에서는 링크가 0개다.

## 원인 (코드 확인 완료)

`src/app/blog/BlogPageClient.tsx`:

```tsx
function BlogPageContent({ posts }) {
  const searchParams = useSearchParams();     // ← 여기가 원인
  const category = normalizeCategory(searchParams.get("cat"));
  const pageParam = Number(searchParams.get("page")) || 1;
  ...
}

export default function BlogPageClient({ initialPosts }) {
  return (
    <Suspense>                                {/* ← fallback 없음 */}
      <BlogPageContent posts={initialPosts} />
    </Suspense>
  );
}
```

Next.js App Router에서 클라이언트 컴포넌트가 **`useSearchParams()`를 호출하면 그 서브트리는 서버 프리렌더 대상에서 제외**되고, 서버는 대신 가장 가까운 Suspense fallback을 내보낸다. 여기 `<Suspense>`에는 **fallback이 아예 없으므로 서버가 내보내는 HTML은 빈 문자열**이다.

`initialPosts`를 서버에서 넘겨준 것까지는 맞는데, **넘겨준 데이터를 그리는 컴포넌트가 서버 렌더에서 통째로 빠져 있어서** 의미가 없었다. 브라우저에서는 JS가 실행돼 정상으로 보이기 때문에 화면·DOM 검증으로는 절대 안 잡힌다.

## 고치는 방향

**클라이언트에서 `useSearchParams()`를 없앤다.** 서버 컴포넌트(`page.tsx`)의 `resolveView()`가 이미 `category`·`page`를 다 계산하고 있으므로, 그 결과를 props로 내려주면 된다. 그러면 Suspense 경계도 필요 없어지고 전체가 서버에서 렌더된다.

### 1. `src/app/blog/page.tsx`

`resolveView()`에서 이미 구한 값으로 **페이지 슬라이싱까지 서버에서** 끝내고 내려보낸다.

```tsx
export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const view = await resolveView(sp);
  if (!view.ok) notFound();

  const filtered = view.category === "전체"
    ? view.posts
    : view.posts.filter((p) => getPostCategory(p.tag ?? null) === view.category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pagePosts = filtered.slice((view.page - 1) * PER_PAGE, view.page * PER_PAGE);

  return (
    <BlogPageClient
      pagePosts={pagePosts}
      category={view.category}
      currentPage={view.page}
      totalPages={totalPages}
    />
  );
}
```

### 2. `src/app/blog/BlogPageClient.tsx`

- `useSearchParams` **import·호출 전부 삭제**
- `Suspense` 래퍼와 `BlogPageContent` 분리 **삭제** — `BlogPageClient` 하나로 합친다
- props로 받은 `category` / `currentPage` / `totalPages` / `pagePosts` 를 그대로 사용. 클라이언트에서 필터링·슬라이싱 **다시 하지 않는다**(서버 계산과 어긋날 여지 제거)
- `"use client"` 는 **유지** — 스크롤 복원 `useEffect` 3개가 계속 필요하다. 클라이언트 컴포넌트라도 `useSearchParams`만 없으면 서버 프리렌더된다
- 카테고리·페이지 이동 링크는 지금처럼 `buildBlogUrl()`로 만든 `<Link>` 유지(실제 URL 이동이라 서버가 다시 계산해줌)
- `isFirstPageEffect` 기반 스크롤 로직의 의존성 배열은 `[currentPage, category]` 그대로 두면 props 변화로 동작한다

### 3. 확인만 할 것 (수정 아님)

`src/app/blog/[slug]/page.tsx` 및 다른 페이지에서 `useSearchParams`를 쓰면서 Suspense fallback이 비어 있는 곳이 또 있는지 훑는다.

```bash
grep -rn "useSearchParams" src/
```

**나온 파일마다 "이 페이지의 원본 HTML에 콘텐츠가 필요한가?"를 판단해서 보고할 것.** 필요한데 비어 있으면 같은 문제다. 이번 커밋에서 같이 고칠지는 보고 후 판단한다.

---

## 검증 항목 (전부 통과해야 완료 — DOM·화면 확인은 검증으로 인정하지 않음)

1. `npx tsc --noEmit`, `npm run build` 통과
2. `grep -rn "useSearchParams" src/app/blog/` → **결과 없음**
3. **원본 HTML 검증 (이게 핵심)** — 로컬 dev 서버에서:
   ```bash
   curl -s http://localhost:3000/blog | grep -c 'href="/blog/'
   ```
   → **10 이상**(PER_PAGE만큼 글 링크). 0이면 실패.
4. canonical 확인:
   ```bash
   curl -s http://localhost:3000/blog | grep -o '<link rel="canonical"[^>]*>'
   ```
   → `http://localhost:3000/blog` (또는 SITE 상수 기준 `https://www.bodymiso.com/blog`). **홈 주소가 나오면 실패**
5. title 확인 — `curl -s http://localhost:3000/blog | grep -o '<title>[^<]*'` 가 홈 title이 아니라 블로그 title
6. 페이지 2 검증: `curl -s "http://localhost:3000/blog?page=2" | grep -c 'href="/blog/'` → 글 링크 존재 + canonical이 `?page=2` 반영
7. 카테고리 검증: `curl -s "http://localhost:3000/blog?cat=임상노트" | grep -c 'href="/blog/'` → 해당 카테고리 글만
8. 404 회귀 확인: `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/blog?page=9999"` → **404**(d4e3e1d에서 만든 동작 유지)
9. 브라우저에서 기능 회귀 확인 — 카테고리 전환, 페이지 이동, 글 상세 갔다가 뒤로가기 시 스크롤 복원이 전부 그대로 동작
10. 커밋 후 **push**. 배포 후 라이브 원본 HTML로 3·4번 재확인:
    ```bash
    curl -s https://www.bodymiso.com/blog | grep -c 'href="/blog/'
    curl -s https://www.bodymiso.com/blog | grep -o '<link rel="canonical"[^>]*>'
    ```
11. 배포 확인 후 서치콘솔에서 `https://www.bodymiso.com/blog` **색인 재요청**

---

# 파트 2 — 삭제된 로딩 스켈레톤 복원 (같은 커밋에 포함)

## 문제

관장이 모바일에서 확인: "센터 소개에서 상단 블로그를 클릭하면 센터소개가 잠깐 그대로 있다가 블로그로 넘어간다. 흐름이 자연스럽지 않다."

원인 — **스켈레톤이 실제로 삭제됐다.** git 이력으로 확인:

| 커밋 | 삭제된 파일 |
|---|---|
| `d4e3e1d` (/blog 범위밖 페이지 404) | `src/app/blog/loading.tsx` |
| `b7f2574` (없는 글 슬러그 404) | `src/app/blog/[slug]/loading.tsx` |

현재 남은 `loading.tsx`는 `src/app/check/loading.tsx` 하나뿐이다.

`loading.tsx`가 없으면 Next.js는 새 페이지의 서버 렌더가 끝날 때까지 **이전 페이지를 그대로 화면에 두기 때문에**, /blog처럼 Supabase 조회가 있는 페이지로 이동할 때 "센터소개가 남아 있다가 갑자기 바뀌는" 현상이 생긴다. 관장이 본 게 정확히 이거다.

## 왜 지웠었는지 (그리고 지금은 왜 되살릴 수 있는지)

`loading.tsx`가 있으면 Suspense 경계가 생겨 HTML 셸이 먼저 나가고, 그 뒤 body에서 `notFound()`를 호출해도 **상태코드가 이미 200으로 확정돼 있어 404로 못 바꾼다.** 404를 살리려고 스켈레톤을 포기한 것으로 보인다.

**지금은 두 페이지 모두 `notFound()`를 `generateMetadata` 안에서 던지도록 이미 바뀌어 있다** (`blog/page.tsx:61`, `blog/[slug]/page.tsx:123`). `generateMetadata`는 `<head>`를 쓰기 전에 완료되어야 하므로 **어떤 HTML도 flush되기 전에 상태코드가 결정된다.** 따라서 스켈레톤을 되살려도 404가 깨지지 않는다. 단 이건 반드시 검증으로 확인한다(아래 12·13번).

## 작업

두 파일을 **git 이력에서 그대로 복원**한다. 새로 디자인하지 말 것 — 기존 것이 레이아웃(CLS)까지 맞춰져 있다.

```bash
git show d4e3e1d^:src/app/blog/loading.tsx > src/app/blog/loading.tsx
git show 'b7f2574^:src/app/blog/[slug]/loading.tsx' > 'src/app/blog/[slug]/loading.tsx'
```

복원 후 파트 1에서 바뀐 마크업과 스켈레톤 구조가 어긋나지 않는지 확인한다(글 카드 개수·높이). 어긋나면 스켈레톤 쪽을 맞춘다.

**다른 페이지(`/about`, `/programs`, `/reviews` 등)에는 추가하지 않는다** — 데이터 조회가 없어 이동이 즉시 끝나고, 불필요한 스켈레톤은 오히려 깜빡임을 만든다. `/research-notes`는 데이터 조회가 있으면 보고만 하고 이번 커밋에서는 건드리지 말 것.

## 파트 2 검증 항목 (파트 1의 1~11번에 이어서)

12. **404 회귀가 핵심** — 스켈레톤 복원 후에도 상태코드가 유지되는지:
    ```bash
    curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/blog?page=9999"    # 404
    curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/blog/없는슬러그"     # 404
    ```
    **하나라도 200이 나오면 스켈레톤 복원을 되돌리고 보고할 것.** 404가 SEO상 더 중요하다.
13. 파트 1의 3·4번(원본 HTML 글 링크 수, canonical)을 **스켈레톤 복원 후 다시** 실행 — 스켈레톤 때문에 원본 HTML이 셸만 나가면 안 된다. 링크 수가 다시 0이 되면 실패
14. 브라우저(가능하면 모바일 뷰포트)에서 `/about` → 상단 "칼럼" 클릭 → **이전 페이지가 남아 있지 않고 스켈레톤이 즉시 보이는지** 확인
15. 글 상세 진입 시에도 스켈레톤이 보이는지 확인

## 앞으로 지킬 것 (같은 실수 3번째 방지)

SEO·크롤러 관련 작업의 검증은 **반드시 `curl`로 받은 원본 HTML**에서 한다.
브라우저 화면, 개발자도구 DOM, Playwright 스냅샷은 **JS 실행 후**를 보기 때문에 "크롤러가 받는 것"을 절대 잡아내지 못한다.
이 문제가 두 커밋 연속 "완료" 처리된 원인이 정확히 이것이다.
