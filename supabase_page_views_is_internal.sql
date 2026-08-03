-- =============================================
-- page_views 내부(작업용) 트래픽 제외
-- Supabase > SQL Editor에서 실행
-- 작업지시서: 작업지시서-자체트래커-작업용브라우저트래픽제외-0803.md
-- =============================================

-- 1. is_internal 컬럼 추가 (기본값 false — 기존 행은 전부 실방문자로 유지)
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;

-- 2. 과거 오염 데이터 백필 — 코워크 QA 동선으로 확정된 visitor_id
--    (6/26~8/3 사이 30개 날짜, 130회 이상, 7/31 하루 24페이지뷰 등 실사용자 패턴 아님)
UPDATE page_views
SET is_internal = true
WHERE visitor_id = 'f0692a2d-ec8e-4782-9d0a-1128813aeb0d';

-- 3. 인덱스 (집계 쿼리 필터 성능)
CREATE INDEX IF NOT EXISTS page_views_is_internal_idx ON page_views (is_internal);

-- 확인
SELECT 'is_internal 컬럼 추가 및 백필 완료' AS result;
