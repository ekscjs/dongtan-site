# CLAUDE.md — dongtan-site (bodymiso.com 공개 홈페이지)

## 한글 타이포그래피 — 줄바꿈 규칙 (필수)

**모든 새 화면·새 문구에 예외 없이 적용한다.** 반복 지적된 문제다.

`globals.css`의 `word-break: keep-all`은 **어절 내부**만 막는다. 어절 사이 공백에서 줄이 끊기는 위치는 통제하지 못하므로, "진행 방식" "다음 업데이트" 같은 **두 어절짜리 구가 줄 끝에서 갈라진다.** 한국어는 구가 갈라지면 읽는 흐름이 끊겨서 어색하다.

### 1. 문장형 텍스트 — 의미 단위를 `inline-block`으로 묶는다

inline-block 박스는 남은 공간에 안 들어가면 통째로 다음 줄로 내려간다.

```tsx
// BAD — 아무 데서나 끊긴다
<p>문의 남기시면 원장이 직접 연락드려 프로그램과 진행 방식을 안내합니다</p>

// GOOD
<p>
  <span className="inline-block">문의 남기시면 원장이 직접 연락드려</span>{" "}
  <span className="inline-block">프로그램과 진행 방식을 안내합니다</span>
</p>
```

묶는 기준: **한 호흡에 읽히는 구.** 서술어와 그 목적어("진행 방식을 안내합니다"), 수식어와 피수식어는 절대 가르지 않는다.

### 2. `·`로 나열하는 메타 라인 — 구분점을 텍스트가 아니라 레이아웃으로

```tsx
// BAD
<div className="flex items-center gap-2">
  표본 {n}명 · 마지막 업데이트 {a} · 다음 업데이트 예정 {b}
</div>

// GOOD
<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
  <span className="whitespace-nowrap">표본 {n}명</span>
  <span aria-hidden>·</span>
  <span className="whitespace-nowrap">마지막 업데이트 {a}</span>
  <span aria-hidden>·</span>
  <span className="whitespace-nowrap">다음 업데이트 예정 {b}</span>
</div>
```

날짜·수치·라벨이 붙은 한 덩어리는 `whitespace-nowrap`으로 절대 안 쪼개지게 한다.

### 2-1. 라벨-값 쌍이 2개 이상이면 `·` 나열 자체를 쓰지 않는다

`·`로 잇는 건 **같은 성격의 짧은 항목을 나열할 때만** 쓴다 (예: "기능개선 · 재활 · 체형교정").

"표본 10명 · 마지막 업데이트 2026-07-20 · 다음 업데이트 예정 2026년 12월"처럼
**서로 다른 사실을 라벨-값으로 붙여 나열하면** 한 문장처럼 읽혀서 어디서 끊어야 할지 안 보인다.
줄바꿈을 고쳐도 해결되지 않는다 — 애초에 세로 목록으로 배치해야 한다.

```tsx
<dl className="text-sm text-gray-400">
  <div className="flex gap-3 py-0.5">
    <dt className="w-28 shrink-0">마지막 업데이트</dt>
    <dd className="text-gray-500">2026-07-20</dd>
  </div>
  ...
</dl>
```

단, 카드 안의 보조 메타처럼 이미 시각적 구획이 있는 자리는 예외로 한 줄 유지해도 된다.

**같은 정보를 한 페이지에서 세 번 반복하지 않는다.** 위에 이미 있으면 하단에서 뺀다.

### 3. `<br>`로 해결하지 말 것

화면폭마다 끊기는 자리가 달라져서 데스크톱에서 되레 어색해진다. 반응형 `<br className="md:hidden">`도 유지보수가 안 되니 쓰지 않는다.

### 4. 보조 — `text-balance` / `text-pretty`

- 제목·헤드라인: `text-balance`
- 본문 단락: `text-pretty`

**보조일 뿐 1·2번을 대체하지 못한다.** 이것만 얹고 끝내지 말 것.

### 5. 확인

새 화면을 만들면 **모바일 폭(375px)에서 한 번 훑어보고** 구가 갈라진 곳이 없는지 확인한 뒤 완료 보고한다.

---

## 그 밖의 이 저장소 규칙

- **`notFound()`가 나올 수 있는 라우트에는 `loading.tsx`를 만들지 말 것.** `loading.tsx`가 존재하면 그것만으로 라우트가 스트리밍 모드로 커밋돼, `notFound()`를 던져도 상태코드가 200으로 고정된다(검증됨). 없는 페이지가 404를 못 내면 구글이 계속 크롤·색인한다.
  - 해당됨: `/blog`(범위 밖 page 번호), `/blog/[slug]`(없는 슬러그) — **여기엔 절대 금지**
  - 해당 안 됨: `/check`, `/check/pain` 처럼 동적 슬러그도 없고 `notFound()` 호출도 없는 라우트 — `loading.tsx` 있어도 무방하다. `src/app/check/loading.tsx`는 정상이니 지우지 말 것.
  - 새로 만들려면 **그 라우트가 404를 낼 수 있는지 먼저 확인**하고, 낼 수 있으면 클라이언트 측 대기 표시(`RouteProgress.tsx`)로 대신한다.
- SEO 검증은 **`curl`로 원본 HTML을 봐야 한다.** 브라우저 DOM·Playwright는 JS 렌더 후를 보므로 크롤러가 받는 것을 못 잡는다.
- `useSearchParams`를 쓰는 클라이언트 컴포넌트는 **반드시 `<Suspense>` 경계 안**에 둔다. 안 그러면 상위 트리가 통째로 클라이언트 렌더로 밀려 원본 HTML이 빈다(0726 사고).
- 배포된 커밋을 rebase / force-push 하지 않는다.
- 추측으로 여러 개를 동시에 바꾸지 않는다 — 무엇이 효과가 있었는지 구분이 안 된다.
