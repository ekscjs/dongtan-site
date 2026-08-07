-- 내몸에미소: 움직임 설계도(패턴 카드) 아카이브 테이블
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.
--
-- 설계 원칙 (2026-07-29 확정)
--   · 원리는 공개 / 처방은 비공개 — 컬럼 단위로 분리한다
--   · 공개는 반드시 뷰(movement_blueprints_public)를 통해서만 나간다
--   · 원본 테이블은 anon 키로 한 줄도 못 읽는다 (비공개 컬럼 유출 차단)
--   · 회원 개인식별 정보는 이 테이블에 넣지 않는다 (member_ids만, 이름 금지)

create table if not exists public.movement_blueprints (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- ── 식별 ──────────────────────────────────────────────
  code              text not null unique,   -- 내부 코드. 예: SH-01(어깨 각도제한형), KN-02(무릎 발아치기원)
  slug              text unique,            -- 공개 URL 조각. 예: shoulder-angle-limited
  region            text not null,          -- 목어깨 / 허리골반 / 무릎발목 / 전신
  pattern_name      text not null,          -- 공개용 한국어 이름. 예: "어깨가 안 올라간다 — 각도 제한형"
  sibling_code      text,                   -- 짝 카드(감별 비교쌍). SH-01 <-> SH-02, KN-01 <-> KN-02

  -- ── 공개 영역 (뷰로 노출) ─────────────────────────────
  pub_signal        text,   -- 감별 신호를 일반인 언어로. 수치 기준선은 넣지 않는다
  pub_root          text,   -- 뿌리(원인) 설명
  pub_first_target  text,   -- 먼저 잡는 곳 (부위 수준까지만. 동작명 금지)
  pub_why_order     text,   -- 왜 이 순서인지 — 공개 페이지의 핵심 본문
  pub_quote         text,   -- 관장 실제 문장 인용
  post_slugs        text[] default '{}',  -- 연결 임상노트 slug (내부링크 허브용)
  is_public         boolean not null default false,
  published_at      timestamptz,

  -- ── 비공개 영역 (뷰에서 제외 · 절대 공개 금지) ────────
  prv_trigger       text,   -- 점수 조합 → 이 패턴으로 판정하는 기준선 (분기 로직)
  prv_protocol      text,   -- 회차별 동작·세팅·중량
  prv_progress_gate text,   -- 다음 단계로 넘어가는 판정 기준
  prv_constraints   text,   -- 주1회 등 조건 제약 시 무엇을 미루는가
  prv_notes         text,
  member_ids        text[] default '{}',  -- members.id 참조. 이름·연락처는 넣지 않는다

  -- ── 운영 ──────────────────────────────────────────────
  evidence_count    int not null default 0,  -- 이 패턴으로 판정된 실제 케이스 수
  status            text not null default 'draft'  -- draft / reviewed / confirmed
    check (status in ('draft','reviewed','confirmed'))
);

create index if not exists movement_blueprints_region_idx on public.movement_blueprints (region);
create index if not exists movement_blueprints_public_idx on public.movement_blueprints (is_public, published_at desc);

-- updated_at 자동 갱신
create or replace function public.touch_movement_blueprints()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists movement_blueprints_touch on public.movement_blueprints;
create trigger movement_blueprints_touch
  before update on public.movement_blueprints
  for each row execute function public.touch_movement_blueprints();

-- ── 공개 뷰: 공개 컬럼만, is_public=true 만 ────────────────
create or replace view public.movement_blueprints_public as
select
  id, slug, region, pattern_name, sibling_code,
  pub_signal, pub_root, pub_first_target, pub_why_order, pub_quote,
  post_slugs, evidence_count, published_at
from public.movement_blueprints
where is_public = true
  and status = 'confirmed'
  and (published_at is null or published_at <= now());

-- ── 권한 ──────────────────────────────────────────────────
-- 원본 테이블: anon 접근 완전 차단 (RLS on + 정책 없음 = 아무것도 못 읽음)
alter table public.movement_blueprints enable row level security;
revoke all on public.movement_blueprints from anon;

-- 공개 뷰만 anon 읽기 허용
alter view public.movement_blueprints_public set (security_invoker = off);
grant select on public.movement_blueprints_public to anon;

-- service_role(서버·스크립트)은 원본 전체 접근 (기본적으로 RLS 우회)

-- ── 검증 쿼리 (Run 후 이어서 실행해 확인) ─────────────────
-- select count(*) from public.movement_blueprints;              -- 0
-- select * from public.movement_blueprints_public;              -- 0행 (아직 confirmed 없음)
-- select table_name, privilege_type, grantee
--   from information_schema.role_table_grants
--  where table_name in ('movement_blueprints','movement_blueprints_public');
--   → movement_blueprints 에 anon 행이 없어야 정상
