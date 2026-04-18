-- =============================================================================
-- 20260420000001_init_auth_profiles.sql
--
-- LazyBible MVP — Week 1: 기본 인증·프로필·포인트·읽기 완료 구조
--
-- 이 마이그레이션은 다음을 생성한다:
--   1) bible_profiles (사용자 앱별 프로필)
--   2) daily_reading_completions (읽기 완료 이력)
--   3) points_ledger (포인트 원장)
--   4) 읽기 선행 가드 RLS 정책
--   5) 총 포인트·스트릭 자동 갱신 트리거
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. bible_profiles
-- -----------------------------------------------------------------------------
CREATE TABLE bible_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '📖',
  reading_goal_days INT DEFAULT 365 CHECK (reading_goal_days IN (30, 90, 180, 365)),

  -- 집계 필드 (트리거로 갱신)
  total_points INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  streak_updated_at TIMESTAMPTZ,
  last_read_date DATE,

  -- 메타
  entry_ref TEXT,  -- 가입 경로 (예: "hublink-bible-hero")
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bible_profiles_username ON bible_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_bible_profiles_entry_ref ON bible_profiles(entry_ref) WHERE entry_ref IS NOT NULL;

COMMENT ON TABLE bible_profiles IS 'LazyBible 앱별 사용자 프로필. auth.users를 확장';
COMMENT ON COLUMN bible_profiles.entry_ref IS 'PostHog/마케팅 분석용 유입 경로';
COMMENT ON COLUMN bible_profiles.total_points IS '집계 필드 — points_ledger 트리거로 자동 갱신';

-- RLS
ALTER TABLE bible_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile_select" ON bible_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "public_profile_select" ON bible_profiles
  FOR SELECT USING (username IS NOT NULL);  -- username 설정된 프로필은 공개

CREATE POLICY "own_profile_insert" ON bible_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_profile_update" ON bible_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. daily_reading_completions
-- -----------------------------------------------------------------------------
CREATE TABLE daily_reading_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  book_id TEXT NOT NULL,
  chapter_range TEXT NOT NULL,  -- "1-3" 또는 "5"
  read_duration_seconds INT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 한 유저가 같은 범위를 하루 두 번 완료 기록 못하도록
  UNIQUE(user_id, completed_date, book_id, chapter_range)
);

CREATE INDEX idx_drc_user_date ON daily_reading_completions(user_id, completed_date DESC);
CREATE INDEX idx_drc_recent ON daily_reading_completions(completed_at DESC)
  WHERE completed_at > NOW() - INTERVAL '24 hours';

COMMENT ON TABLE daily_reading_completions IS '읽기 완료 이력. 읽기 선행 가드의 기준 테이블';

-- RLS
ALTER TABLE daily_reading_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_completions_select" ON daily_reading_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_completions_insert" ON daily_reading_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 같은 그룹 멤버의 피드 조회 허용 (v_social_feed 뷰용)
CREATE POLICY "group_members_completions_select" ON daily_reading_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = daily_reading_completions.user_id
    )
  );
-- 주: group_members 테이블은 마이그레이션 004에서 생성. RLS 정책은 먼저 있어도 안전.

-- -----------------------------------------------------------------------------
-- 3. points_ledger
-- -----------------------------------------------------------------------------
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,                -- + 또는 -
  reason TEXT NOT NULL,                -- 'reading_complete', 'meditation', 'signup_bonus', ...
  related_id UUID,                     -- 관련 엔티티 (reading.id, meditation.id 등)
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (amount != 0)
);

CREATE INDEX idx_points_ledger_user ON points_ledger(user_id, created_at DESC);
CREATE INDEX idx_points_ledger_reason ON points_ledger(reason);

COMMENT ON TABLE points_ledger IS '포인트 원장. 적립·차감 모든 이력.';
COMMENT ON COLUMN points_ledger.reason IS
  '적립 사유: reading_complete(+10), meditation(+15), encouragement_sent(+5), signup_bonus(+20), signup_bonus_with_trial(+50), verse_shared(+10), etc.';

-- RLS — 읽기 선행 가드의 핵심
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_ledger_select" ON points_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- ⭐ 읽기 선행 가드: 포인트 INSERT는 다음 중 하나여야 함
--   1) 읽기 완료 자체 (reading_complete)
--   2) 가입 보너스 (signup_bonus*)
--   3) 오늘 읽기를 이미 완료한 상태
--   4) admin_grant (서비스 운영용, SECURITY DEFINER 함수에서만)
CREATE POLICY "ledger_insert_requires_reading" ON points_ledger
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      reason IN ('reading_complete', 'signup_bonus', 'signup_bonus_with_trial', 'admin_grant')
      OR EXISTS (
        SELECT 1 FROM daily_reading_completions
        WHERE user_id = auth.uid()
          AND completed_date = CURRENT_DATE
      )
    )
  );

-- -----------------------------------------------------------------------------
-- 4. Triggers — 총 포인트 자동 갱신
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_profile_total_points()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bible_profiles
    SET total_points = total_points + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bible_profiles
    SET total_points = total_points - OLD.amount,
        updated_at = NOW()
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_total_points
AFTER INSERT OR DELETE ON points_ledger
FOR EACH ROW
EXECUTE FUNCTION update_profile_total_points();

-- -----------------------------------------------------------------------------
-- 5. Triggers — 스트릭 자동 갱신
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_profile_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_new_streak INT;
BEGIN
  SELECT last_read_date, streak_days INTO v_last_date, v_new_streak
  FROM bible_profiles
  WHERE user_id = NEW.user_id;

  IF v_last_date IS NULL THEN
    -- 처음 읽기
    v_new_streak := 1;
  ELSIF NEW.completed_date = v_last_date THEN
    -- 같은 날 중복 완료 — 스트릭 변화 없음
    RETURN NEW;
  ELSIF NEW.completed_date = v_last_date + INTERVAL '1 day' THEN
    -- 연속
    v_new_streak := v_new_streak + 1;
  ELSE
    -- 끊김
    v_new_streak := 1;
  END IF;

  UPDATE bible_profiles
  SET streak_days = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_read_date = NEW.completed_date,
      streak_updated_at = NOW(),
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_streak
AFTER INSERT ON daily_reading_completions
FOR EACH ROW
EXECUTE FUNCTION update_profile_streak();

-- -----------------------------------------------------------------------------
-- 6. Trigger — 읽기 완료 시 포인트 자동 적립 (+10P)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_award_reading_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO points_ledger (user_id, amount, reason, related_id, metadata)
  VALUES (
    NEW.user_id,
    10,
    'reading_complete',
    NEW.id,
    jsonb_build_object('book_id', NEW.book_id, 'chapter_range', NEW.chapter_range)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_award_reading_points
AFTER INSERT ON daily_reading_completions
FOR EACH ROW
EXECUTE FUNCTION auto_award_reading_points();

-- -----------------------------------------------------------------------------
-- 7. 읽기 선행 가드 헬퍼 함수
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION has_completed_today_reading(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM daily_reading_completions
    WHERE user_id = p_user_id
      AND completed_date = CURRENT_DATE
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION has_completed_today_reading IS
  '읽기 선행 가드의 중앙 판정 함수. 앱 레이어·DB 레이어 모두에서 사용.';

-- -----------------------------------------------------------------------------
-- 8. updated_at 자동 갱신 (bible_profiles)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bible_profiles_updated_at
BEFORE UPDATE ON bible_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 완료: Week 1 스키마 준비 완료
-- 다음: 20260420000002_bible_content.sql (성경 본문 테이블)
-- =============================================================================
