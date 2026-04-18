-- =============================================================================
-- 20260420000004_auth_onboarding_church.sql
--
-- LazyBible MVP — Week 4: 그룹·교회 문의·후기 CMS·소셜
--
-- 이 마이그레이션은 다음을 생성한다:
--   1) groups + group_members (함께읽기)
--   2) church_inquiries (Church SaaS 리드)
--   3) testimonials (랜딩 후기 CMS)
--   4) encouragements (응원 보내기)
--   5) meditations (묵상 기록)
--   6) share_cards (공유 이력)
--   7) v_social_feed (피드 뷰)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. groups + group_members
-- -----------------------------------------------------------------------------
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'small' CHECK (type IN ('couple', 'small', 'church')),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  max_members INT DEFAULT 50,
  is_public BOOLEAN NOT NULL DEFAULT false,
  brand_config JSONB DEFAULT '{}'::jsonb,  -- 교회 로고·색상 (Church SaaS)
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_invite ON groups(invite_code);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_groups_select" ON groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "member_groups_select" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_groups_all" ON groups
  FOR ALL USING (owner_id = auth.uid());

-- 그룹 멤버
CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON group_members(user_id);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_membership_select" ON group_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "same_group_members_select" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "join_via_invite" ON group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "leader_manage_members" ON group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('manager', 'leader')
    )
  );

-- -----------------------------------------------------------------------------
-- 2. church_inquiries (Church SaaS 리드)
-- -----------------------------------------------------------------------------
CREATE TABLE church_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  church_size TEXT CHECK (church_size IN ('<50', '50-200', '200-500', '500+')),
  desired_start_date DATE,
  message TEXT,
  source_ref TEXT,                     -- 'hublink-bible-church'
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial', 'converted', 'lost')),
  assigned_to UUID REFERENCES auth.users(id),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_church_inquiries_status ON church_inquiries(status, created_at DESC);
CREATE INDEX idx_church_inquiries_source ON church_inquiries(source_ref);

ALTER TABLE church_inquiries ENABLE ROW LEVEL SECURITY;

-- INSERT: 누구나 (문의 폼은 로그인 불필요)
CREATE POLICY "anyone_can_submit_inquiry" ON church_inquiries
  FOR INSERT WITH CHECK (true);

-- SELECT/UPDATE: admin 역할만 (별도 app_metadata.role = 'admin' 체크)
CREATE POLICY "admin_church_inquiries_all" ON church_inquiries
  FOR ALL USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- -----------------------------------------------------------------------------
-- 3. testimonials (랜딩 후기 CMS)
-- -----------------------------------------------------------------------------
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,                           -- "교회 담임", "부부학교 1기"
  content TEXT NOT NULL,
  streak_days INT,
  avatar_emoji TEXT,
  image_url TEXT,
  category TEXT CHECK (category IN ('individual', 'couple', 'small_group', 'church')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_published ON testimonials(is_published, sort_order)
  WHERE is_published = true;

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 공개된 후기는 누구나 조회
CREATE POLICY "published_testimonials_select" ON testimonials
  FOR SELECT USING (is_published = true);

-- 관리는 admin
CREATE POLICY "admin_testimonials_all" ON testimonials
  FOR ALL USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- -----------------------------------------------------------------------------
-- 4. encouragements (응원 보내기)
-- -----------------------------------------------------------------------------
CREATE TABLE encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,          -- 'reading_complete', 'streak', 'meditation'
  context_id UUID,
  message TEXT,                        -- 선택 입력, 없으면 기본 👏
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 context에 같은 사람이 중복 응원 못함
  UNIQUE(from_user_id, to_user_id, context_type, context_id)
);

CREATE INDEX idx_encouragements_to_user ON encouragements(to_user_id, created_at DESC);

ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_encouragements_select" ON encouragements
  FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));

CREATE POLICY "send_encouragement_insert" ON encouragements
  FOR INSERT WITH CHECK (
    from_user_id = auth.uid()
    AND has_completed_today_reading(auth.uid())
  );

-- 응원 포인트 자동 지급 트리거
CREATE OR REPLACE FUNCTION award_encouragement_points()
RETURNS TRIGGER AS $$
BEGIN
  -- 보낸 사람 +5P
  INSERT INTO points_ledger (user_id, amount, reason, related_id)
  VALUES (NEW.from_user_id, 5, 'encouragement_sent', NEW.id);

  -- 받는 사람 +3P
  INSERT INTO points_ledger (user_id, amount, reason, related_id)
  VALUES (NEW.to_user_id, 3, 'encouragement_received', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_award_encouragement_points
AFTER INSERT ON encouragements
FOR EACH ROW
EXECUTE FUNCTION award_encouragement_points();

-- -----------------------------------------------------------------------------
-- 5. meditations (묵상 기록)
-- -----------------------------------------------------------------------------
CREATE TABLE meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_id UUID REFERENCES daily_reading_completions(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL,                -- ['감사', '결단', '회개']
  note TEXT,                           -- 선택 입력
  verse_ref TEXT,                      -- "고후 6:10" (오늘의 말씀 연결 시)
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'group', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meditations_user ON meditations(user_id, created_at DESC);

ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_meditations_select" ON meditations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "public_meditations_select" ON meditations
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "group_meditations_select" ON meditations
  FOR SELECT USING (
    visibility = 'group'
    AND EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = meditations.user_id
    )
  );

CREATE POLICY "meditation_insert_requires_reading" ON meditations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND has_completed_today_reading(auth.uid())
  );

-- 묵상 작성 시 +15P 자동 적립
CREATE OR REPLACE FUNCTION award_meditation_points()
RETURNS TRIGGER AS $$
BEGIN
  -- 하루 1회만 적립 (중복 방지)
  IF NOT EXISTS (
    SELECT 1 FROM points_ledger
    WHERE user_id = NEW.user_id
      AND reason = 'meditation'
      AND created_at::DATE = CURRENT_DATE
  ) THEN
    INSERT INTO points_ledger (user_id, amount, reason, related_id)
    VALUES (NEW.user_id, 15, 'meditation', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_award_meditation_points
AFTER INSERT ON meditations
FOR EACH ROW
EXECUTE FUNCTION award_meditation_points();

-- -----------------------------------------------------------------------------
-- 6. share_cards (공유 이력)
-- -----------------------------------------------------------------------------
CREATE TABLE share_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,          -- 'verse', 'meditation', 'assessment', 'streak'
  content_ref_id UUID,
  card_image_url TEXT,
  format TEXT CHECK (format IN ('9:16', '1:1', '1.91:1')),
  platform TEXT,                       -- 'kakao', 'instagram', 'link_copy'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_cards_user ON share_cards(user_id, created_at DESC);

ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_share_cards_all" ON share_cards
  FOR ALL USING (auth.uid() = user_id);

-- 공유 포인트: 하루 1회만 +10P
CREATE OR REPLACE FUNCTION award_share_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM points_ledger
    WHERE user_id = NEW.user_id
      AND reason = 'verse_shared'
      AND created_at::DATE = CURRENT_DATE
  ) AND has_completed_today_reading(NEW.user_id) THEN
    INSERT INTO points_ledger (user_id, amount, reason, related_id)
    VALUES (NEW.user_id, 10, 'verse_shared', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_award_share_points
AFTER INSERT ON share_cards
FOR EACH ROW
EXECUTE FUNCTION award_share_points();

-- -----------------------------------------------------------------------------
-- 7. v_social_feed (소셜 피드 뷰)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_social_feed AS
-- 읽기 완료
SELECT
  drc.id,
  drc.user_id,
  bp.display_name AS user_name,
  bp.avatar_emoji AS user_avatar,
  'reading_complete' AS type,
  jsonb_build_object(
    'book_id', drc.book_id,
    'chapter_range', drc.chapter_range,
    'book_name', bb.name_ko
  ) AS metadata,
  drc.completed_at AS created_at
FROM daily_reading_completions drc
JOIN bible_profiles bp ON bp.user_id = drc.user_id
JOIN bible_books bb ON bb.id = drc.book_id
WHERE drc.completed_at > NOW() - INTERVAL '24 hours'

UNION ALL

-- 스트릭 마일스톤
SELECT
  gen_random_uuid() AS id,  -- 뷰용 더미 id
  bp.user_id,
  bp.display_name,
  bp.avatar_emoji,
  'streak_milestone',
  jsonb_build_object('streak_days', bp.streak_days),
  bp.streak_updated_at
FROM bible_profiles bp
WHERE bp.streak_days IN (7, 14, 30, 50, 100, 200, 365)
  AND bp.streak_updated_at > NOW() - INTERVAL '24 hours'

UNION ALL

-- 새 묵상 (공개·그룹 범위만)
SELECT
  m.id,
  m.user_id,
  bp.display_name,
  bp.avatar_emoji,
  'new_meditation',
  jsonb_build_object(
    'tags', m.tags,
    'verse_ref', m.verse_ref,
    'visibility', m.visibility
  ),
  m.created_at
FROM meditations m
JOIN bible_profiles bp ON bp.user_id = m.user_id
WHERE m.created_at > NOW() - INTERVAL '24 hours'
  AND m.visibility IN ('public', 'group')

ORDER BY created_at DESC;

COMMENT ON VIEW v_social_feed IS
  '24시간 내 소셜 활동 통합 피드. 앱에서 그룹·팔로우 필터링 추가.';

-- -----------------------------------------------------------------------------
-- 8. 데이터 무결성 검증 함수 (운영용)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_points_integrity(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_ledger_sum INT;
  v_profile_total INT;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_ledger_sum
  FROM points_ledger WHERE user_id = p_user_id;

  SELECT total_points INTO v_profile_total
  FROM bible_profiles WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ledger_sum', v_ledger_sum,
    'profile_total', v_profile_total,
    'match', v_ledger_sum = v_profile_total,
    'diff', v_ledger_sum - v_profile_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 완료: Week 4 — 그룹·교회·묵상·공유 전체 인프라 구축
--
-- 이후 마이그레이션은 다음을 담당:
--   - 005: 게임존 (퀴즈·빙고·보물찾기)
--   - 006: 챌린지 (보증금·미션·대항전)
--   - 007: 콘텐츠 블록 시스템
--   - 008: EL MUSIC + 결제
-- =============================================================================
