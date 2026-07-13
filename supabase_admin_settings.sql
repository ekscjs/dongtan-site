-- 내몸에미소: 관리자 비밀번호(해시) 저장 테이블
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.
-- 별도 시드 불필요 — 첫 로그인(기존 ADMIN_PASSWORD로) 성공 시 앱이 자동으로 해시를 심어줌.

create table if not exists public.admin_settings (
  id            bigint generated always as identity primary key,
  password_hash text not null,
  updated_at    timestamptz not null default now()
);

-- RLS 켜고 공개 정책은 만들지 않음 → service role key(서버 API)만 접근 가능.
alter table public.admin_settings enable row level security;
