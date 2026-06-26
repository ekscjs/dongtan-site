-- =============================================
-- 애널리틱스 테이블 생성
-- Supabase > SQL Editor에서 실행
-- =============================================

-- 1. 페이지뷰 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page        text NOT NULL,                    -- 경로 예) /blog/back-pain
  referrer    text,                             -- 유입 URL 전체
  source      text NOT NULL DEFAULT 'direct',  -- google | naver | kakao | instagram | direct | other
  visitor_id  text,                             -- 익명 방문자 식별자 (로컬스토리지 기반)
  session_id  text,                             -- 세션 식별자
  is_new_visitor boolean DEFAULT true,          -- 재방문 여부
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 2. 인덱스 (조회 성능)
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_source_idx ON page_views (source);
CREATE INDEX IF NOT EXISTS page_views_page_idx ON page_views (page);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON page_views (visitor_id);

-- 3. RLS 비활성화 (서비스 롤 키로만 insert)
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 'page_views 테이블 생성 완료' AS result;
