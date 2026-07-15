# 작업 지시서 — 관리자 글목록 페이지네이션 + 발행 즉시반영

## 1. 관리자 글목록 페이지네이션

파일: `src/app/admin/page.tsx`

- 현재: `posts.map(...)`으로 전체 글을 테이블에 통째로 렌더링. 글 100개면 100개 다 스크롤해야 함.
- 수정: 공개 블로그 페이지(`src/app/blog/page.tsx`)에 이미 있는 "더보기" 패턴과 동일하게:
  - `visibleCount` state 추가 (기본값 20)
  - 테이블은 `posts.slice(0, visibleCount)`만 렌더링
  - 테이블 하단에 "더보기 (N개 남음)" 버튼 추가, 클릭 시 `visibleCount += 20`
- `/api/admin/posts`는 그대로 전체 데이터 반환 유지할 것 (상단 대시보드 카드의 공개/예약/비공개 개수 집계에 전체 목록이 필요함 — API를 자르면 카운트 숫자가 틀어짐)

## 2. 발행/수정/삭제 직후 공개 사이트에 즉시 반영

파일: `src/app/api/posts/route.ts` — `export const revalidate = 60;` 때문에 최대 60초 캐시됨 (쿠키 문제 아님, ISR 캐시임)

수정 대상:
- `src/app/api/admin/posts/route.ts` (POST — 새 글 저장)
- `src/app/api/admin/posts/[id]/route.ts` (PUT — 수정/발행, DELETE — 삭제)

각 라우트에서 Supabase 작업 성공 후:
```ts
import { revalidatePath } from "next/cache";
// ...성공 응답 리턴 직전에:
revalidatePath("/api/posts");
revalidatePath("/blog");
```

이렇게 하면 관리자가 저장/발행/삭제하는 즉시 공개 블로그 캐시가 무효화되어 새로고침 없이도 바로 반영됨. 일반 방문자에 대한 60초 캐싱 이점(Supabase 부하 감소)은 그대로 유지됨 — `revalidate = 60` 자체는 지우지 않음.

## 완료 후 확인
- 관리자 화면에서 글 20개 넘게 있을 때 "더보기" 정상 작동하는지
- 새 글 발행 직후 (몇 초 이내) /blog 새로고침 없이도 새 글이 바로 보이는지 (같은 탭 재방문 기준)
- 기존 대시보드 카드 숫자(공개/예약/비공개) 정확한지 (전체 데이터 기준 유지 확인)
- npm run build 통과 확인 후 git commit + push
