-- 내몸에미소: 신청/예약 리드 테이블 (호흡 원데이 · 체험예약 공용)
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.

create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  program     text not null,                 -- 예: '호흡원데이', '체험예약'
  name        text not null,
  phone       text not null,
  preferred   text,                          -- 희망 시간대/날짜
  message     text,                          -- 남기고 싶은 말
  source      text,                          -- 유입 경로 (class-breathing, check 등)
  status      text not null default 'new'    -- new / contacted / done
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- RLS 켜고 공개 정책은 만들지 않음 → 일반 방문자는 직접 접근 불가.
-- 서버 API(SUPABASE_SERVICE_ROLE_KEY)만 읽고 쓸 수 있어 연락처가 안전하게 보호됩니다.
alter table public.leads enable row level security;
