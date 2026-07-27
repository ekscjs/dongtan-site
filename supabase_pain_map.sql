-- 내몸에미소: 통증지도(/check/pain) 결과 익명 저장 테이블
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.
-- 개인정보(이름·연락처) 없음 — 순수 익명. anon_id는 방문자 트래킹 visitor_id 재사용.

create table if not exists public.pain_map_results (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  anon_id       text,          -- localStorage _miso_vid 재사용

  areas         text[],        -- 선택한 부위 키 배열 예: {neck,back}
  area_count    int,           -- 선택 부위 수

  -- 부위별 체크 답변 원본. 예: {"neck":[true,false,...],"back":[...]}
  answers_raw   jsonb,

  -- 매칭된 결과 카드 제목 배열. 예: {거북목·라운드숄더 패턴,경추 가동성 저하}
  findings      text[],
  -- 우선순위 1(주의) 카드 수
  priority1_count int,

  entry_area    text           -- ?area= 로 들어온 경우 그 값, 아니면 null
);

create index if not exists pain_map_results_created_at_idx
  on public.pain_map_results (created_at desc);
create index if not exists pain_map_results_anon_id_idx
  on public.pain_map_results (anon_id);

alter table public.pain_map_results enable row level security;
