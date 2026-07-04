-- =============================================
-- 카카오 상담 버튼 클릭 이벤트 테이블 (page_views와 동일한 패턴)
-- Supabase > SQL Editor에서 실행
-- =============================================

CREATE TABLE IF NOT EXISTS kakao_clicks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page        text NOT NULL,                    -- 클릭 당시 경로 예) /programs
  referrer    text,                             -- 유입 URL 전체
  source      text NOT NULL DEFAULT 'direct',  -- google | naver | kakao | instagram | direct | other
  visitor_id  text,                             -- 익명 방문자 식별자 (page_views와 동일 기준)
  session_id  text,                             -- 세션 식별자
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS kakao_clicks_created_at_idx ON kakao_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS kakao_clicks_page_idx ON kakao_clicks (page);
CREATE INDEX IF NOT EXISTS kakao_clicks_visitor_id_idx ON kakao_clicks (visitor_id);

-- RLS 비활성화 (서비스 롤 키로만 insert, page_views와 동일)
ALTER TABLE kakao_clicks DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT 'kakao_clicks 테이블 생성 완료' AS result;
