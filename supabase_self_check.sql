-- 내몸에미소: 셀프체크(체형 유형 진단) 답변 익명 저장 테이블
-- 사용법: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 한 번만 실행하면 됩니다.
-- 개인정보(이름·연락처) 없음 — 순수 익명. anon_id는 기존 방문자 트래킹의 visitor_id 재사용.

create table if not exists public.self_check_results (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  anon_id           text,                      -- 방문자 트래킹의 visitor_id (localStorage _miso_vid) 재사용

  -- src/app/check/data.ts questions 순서대로 의미 있는 필드명 (선택한 옵션의 label 텍스트)
  sitting_hours     text,   -- Q1. 하루에 앉아 있는 시간
  main_area         text,   -- Q2. 가장 불편한 곳
  worse_when        text,   -- Q3. 언제 더 불편한지
  forward_head      text,   -- Q4. 거북목 (귀가 어깨보다 앞)
  round_shoulder    text,   -- Q5. 라운드 숄더
  uneven_stance     text,   -- Q6. 짝다리/골반 불균형
  temporary_relief  text,   -- Q7. 스트레칭/마사지 후 재발 여부
  pain_severity     text,   -- Q8. 현재 불편함 정도

  answers_raw       jsonb,  -- 원본 답변(선택지 인덱스) 배열 — 스키마 변경 시 복구용

  result_type       text,   -- neck / pelvis / back / whole
  risk_label        text,   -- 낮음 / 보통 / 주의
  risk_score        int,

  is_retest         boolean not null default false
);

create index if not exists self_check_results_created_at_idx on public.self_check_results (created_at desc);
create index if not exists self_check_results_anon_id_idx on public.self_check_results (anon_id);

-- RLS 켜고 공개 정책은 만들지 않음 → 일반 방문자는 직접 접근 불가.
-- 서버 API(SUPABASE_SERVICE_ROLE_KEY)만 읽고 쓸 수 있어 안전하게 보호됩니다.
alter table public.self_check_results enable row level security;
