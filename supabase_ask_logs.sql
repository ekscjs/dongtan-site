-- 내몸에미소: 증상 AI 컨시어지(/ask) 쿼리 로그 테이블
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.
-- 개인정보 없음 — 증상 문구와 IP 해시(비식별)만 저장. 요청 빈도 제한 및 콘텐츠 갭 분석용.

create table if not exists public.ask_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  query       text not null,
  ip_hash     text not null
);

create index if not exists ask_logs_created_at_idx on public.ask_logs (created_at desc);
create index if not exists ask_logs_ip_hash_created_at_idx on public.ask_logs (ip_hash, created_at desc);

-- RLS 켜고 공개 정책은 만들지 않음 → 일반 방문자는 직접 접근 불가.
-- 서버 API(SUPABASE_SERVICE_ROLE_KEY)만 읽고 쓸 수 있습니다.
alter table public.ask_logs enable row level security;
