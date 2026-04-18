-- ===================================================
-- 게스트 체험 검사 테이블 + claim RPC 함수
-- Supabase Dashboard → SQL Editor에서 실행
-- Idempotent (반복 실행 안전)
-- ===================================================

-- 1. 게스트 검사 임시 저장 테이블
CREATE TABLE IF NOT EXISTS trial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,                              -- 쿠키 기반 게스트 ID (guest_xxxxx)
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('mbti', 'disc', 'gifts')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,           -- 문항별 응답
  result JSONB NOT NULL DEFAULT '{}'::jsonb,            -- 결과 (유형, 점수 등)
  claimed_by UUID REFERENCES auth.users(id),            -- 가입 시 이전된 사용자 ID
  claimed_at TIMESTAMPTZ,                               -- 이전 시각
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 게스트 ID로 빠른 조회
CREATE INDEX IF NOT EXISTS idx_trial_assessments_guest_id
  ON trial_assessments(guest_id);

-- 인덱스: 미이전 데이터 조회 (claim 시)
CREATE INDEX IF NOT EXISTS idx_trial_assessments_unclaimed
  ON trial_assessments(guest_id) WHERE claimed_by IS NULL;

-- 30일 이상 미이전 데이터 자동 정리용 (선택적 cron)
-- CREATE INDEX IF NOT EXISTS idx_trial_assessments_created
--   ON trial_assessments(created_at) WHERE claimed_by IS NULL;

-- 2. RLS 정책
ALTER TABLE trial_assessments ENABLE ROW LEVEL SECURITY;

-- 누구나 삽입 가능 (게스트이므로 anon 포함)
DROP POLICY IF EXISTS "Anyone can insert trial" ON trial_assessments;
CREATE POLICY "Anyone can insert trial"
  ON trial_assessments FOR INSERT
  WITH CHECK (true);

-- 자신의 게스트 데이터만 조회 (프론트에서 guest_id 기준)
DROP POLICY IF EXISTS "Anyone can read own trial" ON trial_assessments;
CREATE POLICY "Anyone can read own trial"
  ON trial_assessments FOR SELECT
  USING (true);

-- claim은 RPC로만 실행 (SECURITY DEFINER)
GRANT INSERT, SELECT ON trial_assessments TO anon, authenticated;

-- 3. 가입 시 게스트 데이터를 user_assessments로 이전하는 RPC 함수
CREATE OR REPLACE FUNCTION claim_trial_assessments(
  p_guest_id TEXT,
  p_user_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
  v_trial RECORD;
BEGIN
  -- trial_assessments에서 미이전 데이터 조회
  FOR v_trial IN
    SELECT * FROM trial_assessments
    WHERE guest_id = p_guest_id AND claimed_by IS NULL
  LOOP
    -- user_assessments에 삽입 (테이블이 아직 없을 수 있으므로 trial에 mark만)
    -- Phase 2에서 user_assessments 테이블 생성 후 INSERT 로직 추가

    -- trial_assessments에 claim 표시
    UPDATE trial_assessments
    SET claimed_by = p_user_id, claimed_at = NOW()
    WHERE id = v_trial.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 4. church_inquiries 테이블 (교회 문의)
CREATE TABLE IF NOT EXISTS church_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,              -- 전화 또는 이메일
  church_size TEXT,                        -- '<50', '50-200', '200-500', '500+'
  desired_start_date DATE,
  message TEXT,
  source_ref TEXT,                         -- ref 파라미터 값
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial', 'converted', 'lost')),
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE church_inquiries ENABLE ROW LEVEL SECURITY;

-- 누구나 문의 제출 가능
DROP POLICY IF EXISTS "Anyone can insert inquiry" ON church_inquiries;
CREATE POLICY "Anyone can insert inquiry"
  ON church_inquiries FOR INSERT
  WITH CHECK (true);

-- 읽기는 인증된 관리자만 (추후 admin RLS 정교화)
DROP POLICY IF EXISTS "Authenticated can read inquiries" ON church_inquiries;
CREATE POLICY "Authenticated can read inquiries"
  ON church_inquiries FOR SELECT
  USING (auth.uid() IS NOT NULL);

GRANT INSERT ON church_inquiries TO anon, authenticated;
GRANT SELECT ON church_inquiries TO authenticated;
