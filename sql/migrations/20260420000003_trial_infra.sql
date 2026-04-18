-- =============================================================================
-- 20260420000003_trial_infra.sql
--
-- LazyBible MVP — Week 2-3: 게스트 체험 + 검사 인프라
--
-- 이 마이그레이션은 다음을 생성한다:
--   1) assessments (검사 정의 — MBTI/DISC/은사 등)
--   2) trial_assessments (비회원 게스트 체험 결과)
--   3) user_assessments (로그인 유저 검사 결과)
--   4) claim_trial_assessments RPC (가입 시 이전)
--   5) 만료된 게스트 데이터 자동 삭제
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. assessments (검사 정의)
-- -----------------------------------------------------------------------------
CREATE TABLE assessments (
  id TEXT PRIMARY KEY,                 -- 'bible-mbti', 'bible-disc', 'bible-gifts'
  title_ko TEXT NOT NULL,
  description_ko TEXT,
  category TEXT NOT NULL,              -- 'personality', 'gifts', 'relationship', 'mission'
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  question_count INT NOT NULL,
  estimated_minutes INT NOT NULL,
  allow_guest BOOLEAN NOT NULL DEFAULT false,  -- 게스트 체험 허용 여부
  questions JSONB NOT NULL,            -- 문항 + 선택지
  result_types JSONB NOT NULL,         -- 결과 유형별 해설
  is_published BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,                    -- 신학 감수자
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE assessments IS '검사 정의. JSON 스키마는 content/assessments/*.json 참조.';

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 공개된 검사는 누구나 조회 (비로그인 포함)
CREATE POLICY "published_assessments_readable" ON assessments
  FOR SELECT USING (is_published = true);

-- 시드: 3종 검사 정의 (실제 questions/result_types JSON은 별도 seed 스크립트로)
INSERT INTO assessments (id, title_ko, description_ko, category, tier, question_count, estimated_minutes, allow_guest, questions, result_types, is_published) VALUES
('bible-mbti', '성경인물 MBTI', '16유형 중 나와 닮은 성경인물은?', 'personality', 'free', 12, 3, true, '{}'::jsonb, '{}'::jsonb, false),
('bible-disc', '성경인물 DISC', '나의 리더십 스타일은?', 'personality', 'free', 12, 3, true, '{}'::jsonb, '{}'::jsonb, false),
('bible-gifts', '은사 체크리스트', '고전 12장 기반 나의 영적 은사', 'gifts', 'free', 20, 5, true, '{}'::jsonb, '{}'::jsonb, false);
-- 주: questions/result_types/is_published 는 콘텐츠 준비 + 신학 감수 후 UPDATE

-- -----------------------------------------------------------------------------
-- 2. trial_assessments (게스트 체험 결과)
-- -----------------------------------------------------------------------------
CREATE TABLE trial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,              -- 'guest_<UUID>'
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  answers JSONB NOT NULL,
  result_type TEXT,
  ref_source TEXT,                     -- 'hublink-bible-mbti' 등
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 보안: guest_id 형식 검증
  CONSTRAINT valid_guest_id CHECK (guest_id ~ '^guest_[0-9a-f-]{36}$')
);

CREATE INDEX idx_trial_guest_id ON trial_assessments(guest_id);
CREATE INDEX idx_trial_unclaimed ON trial_assessments(guest_id)
  WHERE claimed_by_user_id IS NULL;
CREATE INDEX idx_trial_stale ON trial_assessments(created_at)
  WHERE claimed_by_user_id IS NULL;

COMMENT ON TABLE trial_assessments IS
  '비회원 게스트가 랜딩에서 체험한 검사 결과. 가입 시 user_assessments 로 이전 (claim).';

-- RLS — 게스트 전용 테이블
ALTER TABLE trial_assessments ENABLE ROW LEVEL SECURITY;

-- INSERT: 아무나 (하지만 guest_id 형식이 CHECK 통과해야)
CREATE POLICY "anyone_can_insert_trial" ON trial_assessments
  FOR INSERT WITH CHECK (true);

-- SELECT: 미claim 상태면 아무나 (guest_id로 필터링은 앱 측에서)
--         claim 되면 본인 또는 공개 불가
CREATE POLICY "trial_select_unclaimed" ON trial_assessments
  FOR SELECT USING (claimed_by_user_id IS NULL);

CREATE POLICY "trial_select_own_claimed" ON trial_assessments
  FOR SELECT USING (claimed_by_user_id = auth.uid());

-- UPDATE/DELETE: SECURITY DEFINER 함수 통해서만

-- -----------------------------------------------------------------------------
-- 3. user_assessments (로그인 유저 검사 결과)
-- -----------------------------------------------------------------------------
CREATE TABLE user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  answers JSONB NOT NULL,
  result_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'claimed_from_guest'
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'group', 'public')),
  shared_at TIMESTAMPTZ,
  share_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 한 유저가 같은 검사는 여러 번 할 수 있지만 최신 결과만 "활성"
  -- 이 UNIQUE는 걸지 않음 — 재도전 허용
);

CREATE INDEX idx_user_assessments_user ON user_assessments(user_id, assessment_id, created_at DESC);

-- RLS
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_assessments_select" ON user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_assessments_insert" ON user_assessments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      -- 검사 제출도 읽기 선행 가드 적용 (예외: claim_from_guest)
      source = 'claimed_from_guest'
      OR has_completed_today_reading(auth.uid())
    )
  );

CREATE POLICY "public_assessments_select" ON user_assessments
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "group_assessments_select" ON user_assessments
  FOR SELECT USING (
    visibility = 'group'
    AND EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = user_assessments.user_id
    )
  );
-- 주: group_members 는 마이그레이션 004에서 생성.

CREATE POLICY "own_assessments_update" ON user_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. claim_trial_assessments RPC — 가입 시 게스트 데이터 이전
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION claim_trial_assessments(
  p_guest_id TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_claimed_count INT;
  v_copied_count INT;
  v_assessment_ids TEXT[];
BEGIN
  -- 1) guest_id 형식 검증
  IF p_guest_id !~ '^guest_[0-9a-f-]{36}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_guest_id_format',
      'claimed_count', 0,
      'copied_count', 0
    );
  END IF;

  -- 2) user_id 존재 검증
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found',
      'claimed_count', 0,
      'copied_count', 0
    );
  END IF;

  -- 3) trial_assessments 마킹
  UPDATE trial_assessments
  SET claimed_by_user_id = p_user_id,
      claimed_at = NOW()
  WHERE guest_id = p_guest_id
    AND claimed_by_user_id IS NULL
  RETURNING assessment_id INTO v_assessment_ids;

  GET DIAGNOSTICS v_claimed_count = ROW_COUNT;

  -- 4) user_assessments 로 복사 (이미 있는 검사는 스킵)
  INSERT INTO user_assessments (user_id, assessment_id, answers, result_type, source, created_at)
  SELECT
    p_user_id,
    ta.assessment_id,
    ta.answers,
    COALESCE(ta.result_type, 'unknown'),
    'claimed_from_guest',
    ta.created_at
  FROM trial_assessments ta
  WHERE ta.guest_id = p_guest_id
    AND ta.claimed_by_user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_assessments ua
      WHERE ua.user_id = p_user_id
        AND ua.assessment_id = ta.assessment_id
        AND ua.source = 'claimed_from_guest'
    );

  GET DIAGNOSTICS v_copied_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_count', v_claimed_count,
    'copied_count', v_copied_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'claimed_count', 0,
    'copied_count', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION claim_trial_assessments IS
  '가입 시 게스트 체험 데이터를 정식 계정으로 이전. /auth/callback 에서 호출.';

-- 호출 권한 — authenticated 만
REVOKE EXECUTE ON FUNCTION claim_trial_assessments(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_trial_assessments(TEXT, UUID) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. 만료 게스트 데이터 자동 삭제 (30일 후)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cleanup_stale_trial_assessments()
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM trial_assessments
  WHERE claimed_by_user_id IS NULL
    AND created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_stale_trial_assessments IS
  'pg_cron 또는 Edge Function에서 매일 새벽 실행. 미claim 게스트 데이터 30일 후 삭제.';

-- pg_cron 예시 (Supabase에서 활성화 필요):
-- SELECT cron.schedule('cleanup-trial', '0 3 * * *', 'SELECT cleanup_stale_trial_assessments();');

-- =============================================================================
-- 완료: Week 2-3 게스트 체험 인프라
-- 다음: 20260420000004_auth_onboarding_church.sql (그룹·교회 문의·후기)
-- =============================================================================
