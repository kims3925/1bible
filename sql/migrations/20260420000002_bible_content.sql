-- =============================================================================
-- 20260420000002_bible_content.sql
--
-- LazyBible MVP — Week 2: 성경 본문 + 메타데이터
--
-- 이 마이그레이션은 다음을 생성한다:
--   1) bible_books (66권 메타)
--   2) bible_verses (구절 본문 — 자체 번역본)
--   3) verse_highlights (오늘의 말씀 가중치)
--   4) user_progress_summary (진도 집계 캐시)
--   5) 진도 자동 갱신 트리거
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. bible_books (66권 메타)
-- -----------------------------------------------------------------------------
CREATE TABLE bible_books (
  id TEXT PRIMARY KEY,                -- 'GEN', 'EXO', 'JHN' (3글자 표준)
  name_ko TEXT NOT NULL,              -- "창세기"
  name_en TEXT NOT NULL,              -- "Genesis"
  name_ko_short TEXT NOT NULL,        -- "창"
  testament CHAR(2) NOT NULL CHECK (testament IN ('OT', 'NT')),
  category TEXT NOT NULL,             -- 'pentateuch', 'history', 'poetry', 'major-prophets', 'minor-prophets', 'gospels', 'acts', 'pauline', 'general', 'revelation'
  chapter_count INT NOT NULL,
  sort_order INT NOT NULL UNIQUE
);

COMMENT ON TABLE bible_books IS '성경 66권 메타데이터. 순서·분류·장 수.';

-- 66권 시드 데이터
INSERT INTO bible_books (id, name_ko, name_en, name_ko_short, testament, category, chapter_count, sort_order) VALUES
-- 구약 39권
('GEN', '창세기', 'Genesis', '창', 'OT', 'pentateuch', 50, 1),
('EXO', '출애굽기', 'Exodus', '출', 'OT', 'pentateuch', 40, 2),
('LEV', '레위기', 'Leviticus', '레', 'OT', 'pentateuch', 27, 3),
('NUM', '민수기', 'Numbers', '민', 'OT', 'pentateuch', 36, 4),
('DEU', '신명기', 'Deuteronomy', '신', 'OT', 'pentateuch', 34, 5),
('JOS', '여호수아', 'Joshua', '수', 'OT', 'history', 24, 6),
('JDG', '사사기', 'Judges', '삿', 'OT', 'history', 21, 7),
('RUT', '룻기', 'Ruth', '룻', 'OT', 'history', 4, 8),
('1SA', '사무엘상', '1 Samuel', '삼상', 'OT', 'history', 31, 9),
('2SA', '사무엘하', '2 Samuel', '삼하', 'OT', 'history', 24, 10),
('1KI', '열왕기상', '1 Kings', '왕상', 'OT', 'history', 22, 11),
('2KI', '열왕기하', '2 Kings', '왕하', 'OT', 'history', 25, 12),
('1CH', '역대상', '1 Chronicles', '대상', 'OT', 'history', 29, 13),
('2CH', '역대하', '2 Chronicles', '대하', 'OT', 'history', 36, 14),
('EZR', '에스라', 'Ezra', '스', 'OT', 'history', 10, 15),
('NEH', '느헤미야', 'Nehemiah', '느', 'OT', 'history', 13, 16),
('EST', '에스더', 'Esther', '에', 'OT', 'history', 10, 17),
('JOB', '욥기', 'Job', '욥', 'OT', 'poetry', 42, 18),
('PSA', '시편', 'Psalms', '시', 'OT', 'poetry', 150, 19),
('PRO', '잠언', 'Proverbs', '잠', 'OT', 'poetry', 31, 20),
('ECC', '전도서', 'Ecclesiastes', '전', 'OT', 'poetry', 12, 21),
('SNG', '아가', 'Song of Songs', '아', 'OT', 'poetry', 8, 22),
('ISA', '이사야', 'Isaiah', '사', 'OT', 'major-prophets', 66, 23),
('JER', '예레미야', 'Jeremiah', '렘', 'OT', 'major-prophets', 52, 24),
('LAM', '예레미야애가', 'Lamentations', '애', 'OT', 'major-prophets', 5, 25),
('EZK', '에스겔', 'Ezekiel', '겔', 'OT', 'major-prophets', 48, 26),
('DAN', '다니엘', 'Daniel', '단', 'OT', 'major-prophets', 12, 27),
('HOS', '호세아', 'Hosea', '호', 'OT', 'minor-prophets', 14, 28),
('JOL', '요엘', 'Joel', '욜', 'OT', 'minor-prophets', 3, 29),
('AMO', '아모스', 'Amos', '암', 'OT', 'minor-prophets', 9, 30),
('OBA', '오바댜', 'Obadiah', '옵', 'OT', 'minor-prophets', 1, 31),
('JON', '요나', 'Jonah', '욘', 'OT', 'minor-prophets', 4, 32),
('MIC', '미가', 'Micah', '미', 'OT', 'minor-prophets', 7, 33),
('NAM', '나훔', 'Nahum', '나', 'OT', 'minor-prophets', 3, 34),
('HAB', '하박국', 'Habakkuk', '합', 'OT', 'minor-prophets', 3, 35),
('ZEP', '스바냐', 'Zephaniah', '습', 'OT', 'minor-prophets', 3, 36),
('HAG', '학개', 'Haggai', '학', 'OT', 'minor-prophets', 2, 37),
('ZEC', '스가랴', 'Zechariah', '슥', 'OT', 'minor-prophets', 14, 38),
('MAL', '말라기', 'Malachi', '말', 'OT', 'minor-prophets', 4, 39),
-- 신약 27권
('MAT', '마태복음', 'Matthew', '마', 'NT', 'gospels', 28, 40),
('MRK', '마가복음', 'Mark', '막', 'NT', 'gospels', 16, 41),
('LUK', '누가복음', 'Luke', '눅', 'NT', 'gospels', 24, 42),
('JHN', '요한복음', 'John', '요', 'NT', 'gospels', 21, 43),
('ACT', '사도행전', 'Acts', '행', 'NT', 'acts', 28, 44),
('ROM', '로마서', 'Romans', '롬', 'NT', 'pauline', 16, 45),
('1CO', '고린도전서', '1 Corinthians', '고전', 'NT', 'pauline', 16, 46),
('2CO', '고린도후서', '2 Corinthians', '고후', 'NT', 'pauline', 13, 47),
('GAL', '갈라디아서', 'Galatians', '갈', 'NT', 'pauline', 6, 48),
('EPH', '에베소서', 'Ephesians', '엡', 'NT', 'pauline', 6, 49),
('PHP', '빌립보서', 'Philippians', '빌', 'NT', 'pauline', 4, 50),
('COL', '골로새서', 'Colossians', '골', 'NT', 'pauline', 4, 51),
('1TH', '데살로니가전서', '1 Thessalonians', '살전', 'NT', 'pauline', 5, 52),
('2TH', '데살로니가후서', '2 Thessalonians', '살후', 'NT', 'pauline', 3, 53),
('1TI', '디모데전서', '1 Timothy', '딤전', 'NT', 'pauline', 6, 54),
('2TI', '디모데후서', '2 Timothy', '딤후', 'NT', 'pauline', 4, 55),
('TIT', '디도서', 'Titus', '딛', 'NT', 'pauline', 3, 56),
('PHM', '빌레몬서', 'Philemon', '몬', 'NT', 'pauline', 1, 57),
('HEB', '히브리서', 'Hebrews', '히', 'NT', 'general', 13, 58),
('JAS', '야고보서', 'James', '약', 'NT', 'general', 5, 59),
('1PE', '베드로전서', '1 Peter', '벧전', 'NT', 'general', 5, 60),
('2PE', '베드로후서', '2 Peter', '벧후', 'NT', 'general', 3, 61),
('1JN', '요한일서', '1 John', '요일', 'NT', 'general', 5, 62),
('2JN', '요한이서', '2 John', '요이', 'NT', 'general', 1, 63),
('3JN', '요한삼서', '3 John', '요삼', 'NT', 'general', 1, 64),
('JUD', '유다서', 'Jude', '유', 'NT', 'general', 1, 65),
('REV', '요한계시록', 'Revelation', '계', 'NT', 'revelation', 22, 66);

-- -----------------------------------------------------------------------------
-- 2. bible_verses (구절 본문)
-- -----------------------------------------------------------------------------
CREATE TABLE bible_verses (
  book_id TEXT NOT NULL REFERENCES bible_books(id),
  chapter INT NOT NULL CHECK (chapter > 0),
  verse INT NOT NULL CHECK (verse > 0),

  text_ko TEXT NOT NULL,              -- 자체 한국어 번역본
  text_en TEXT,                        -- KJV 원문
  text_ko_source TEXT NOT NULL DEFAULT 'LazyBible-CC-BY-SA-4.0',
  text_en_source TEXT DEFAULT 'KJV-PublicDomain',

  -- 감수 메타
  reviewed_by UUID,                    -- 신학 감수자 user_id
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- 계산 메타
  char_count INT GENERATED ALWAYS AS (length(text_ko)) STORED,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (book_id, chapter, verse)
);

CREATE INDEX idx_bible_verses_book_chapter ON bible_verses(book_id, chapter);

COMMENT ON TABLE bible_verses IS
  '성경 본문. 자체 한국어 번역본. 개역개정·새번역 등 저작권 번역본은 절대 저장 금지.';
COMMENT ON COLUMN bible_verses.text_ko_source IS
  '반드시 LazyBible 자체 번역본 또는 Public Domain 번역만 허용';

-- RLS — 본문은 누구나 읽기 가능 (비로그인 포함)
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_verses" ON bible_verses
  FOR SELECT USING (true);

-- INSERT/UPDATE는 서비스 역할만 (admin / seed 스크립트)
-- RLS 통과 못하므로 기본적으로 차단됨

-- -----------------------------------------------------------------------------
-- 3. verse_highlights (오늘의 말씀 가중치)
-- -----------------------------------------------------------------------------
CREATE TABLE verse_highlights (
  book_id TEXT NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  weight INT NOT NULL DEFAULT 5,       -- 0~10, 높을수록 자주 노출
  tags TEXT[],                         -- ['위로', '약속', '지혜']
  note TEXT,                           -- 왜 주요 구절인지

  PRIMARY KEY (book_id, chapter, verse),
  FOREIGN KEY (book_id, chapter, verse) REFERENCES bible_verses(book_id, chapter, verse)
);

CREATE INDEX idx_verse_highlights_weight ON verse_highlights(weight DESC);

COMMENT ON TABLE verse_highlights IS
  '홈의 "오늘의 말씀"에서 우선 노출할 구절. 초기 30~50개 정도 시드.';

-- 초기 하이라이트 시드 (예시)
INSERT INTO verse_highlights (book_id, chapter, verse, weight, tags, note) VALUES
('JHN', 3, 16, 10, ARRAY['사랑', '구원'], '가장 널리 알려진 복음 구절'),
('PSA', 23, 1, 9, ARRAY['인도', '평안'], '시편 23편 여호와는 나의 목자'),
('PSA', 23, 4, 9, ARRAY['위로', '동행'], '사망의 음침한 골짜기'),
('PHP', 4, 13, 9, ARRAY['능력', '격려'], '내게 능력 주시는 자'),
('ROM', 8, 28, 8, ARRAY['섭리', '합력'], '합력하여 선을 이룸'),
('2CO', 6, 10, 7, ARRAY['역설', '기쁨'], '근심하는 자 같으나 항상 기뻐하고'),
('MAT', 11, 28, 9, ARRAY['위로', '쉼'], '수고하고 무거운 짐 진 자들'),
('1CO', 13, 13, 8, ARRAY['사랑', '믿음'], '그 중의 제일은 사랑'),
('PRO', 3, 5, 8, ARRAY['의뢰', '지혜'], '네 명철을 의지하지 말라'),
('ISA', 40, 31, 8, ARRAY['새힘', '인내'], '오직 여호와를 앙망하는 자');

-- -----------------------------------------------------------------------------
-- 4. user_progress_summary (진도 집계 캐시)
-- -----------------------------------------------------------------------------
CREATE TABLE user_progress_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  read_chapter_count INT NOT NULL DEFAULT 0,
  overall_pct NUMERIC(5,4) NOT NULL DEFAULT 0,
  nt_pct NUMERIC(5,4) NOT NULL DEFAULT 0,
  ot_pct NUMERIC(5,4) NOT NULL DEFAULT 0,
  read_chapters_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["GEN-1", "GEN-2", "JHN-3"]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_progress_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_progress_select" ON user_progress_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_progress_insert" ON user_progress_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 공개 프로필 조회 허용 (username 있는 유저)
CREATE POLICY "public_progress_select" ON user_progress_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bible_profiles
      WHERE user_id = user_progress_summary.user_id
        AND username IS NOT NULL
    )
  );

-- -----------------------------------------------------------------------------
-- 5. Trigger — 진도 집계 자동 갱신
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_user_progress_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_read_chapters JSONB;
  v_chapter_count INT;
  v_nt_count INT;
  v_ot_count INT;
BEGIN
  -- 해당 유저의 모든 읽기 완료 → 고유 (book, chapter) 리스트
  WITH expanded AS (
    SELECT DISTINCT
      drc.book_id,
      generate_series(
        CAST(SPLIT_PART(drc.chapter_range, '-', 1) AS INT),
        CAST(COALESCE(NULLIF(SPLIT_PART(drc.chapter_range, '-', 2), ''), SPLIT_PART(drc.chapter_range, '-', 1)) AS INT)
      ) AS chapter
    FROM daily_reading_completions drc
    WHERE drc.user_id = NEW.user_id
  ),
  with_testament AS (
    SELECT e.book_id, e.chapter, bb.testament
    FROM expanded e
    JOIN bible_books bb ON bb.id = e.book_id
  )
  SELECT
    jsonb_agg(book_id || '-' || chapter ORDER BY book_id, chapter),
    COUNT(*),
    COUNT(*) FILTER (WHERE testament = 'NT'),
    COUNT(*) FILTER (WHERE testament = 'OT')
  INTO v_read_chapters, v_chapter_count, v_nt_count, v_ot_count
  FROM with_testament;

  INSERT INTO user_progress_summary (
    user_id, read_chapter_count, overall_pct, nt_pct, ot_pct, read_chapters_json, updated_at
  ) VALUES (
    NEW.user_id,
    COALESCE(v_chapter_count, 0),
    COALESCE(v_chapter_count, 0)::NUMERIC / 1189,
    COALESCE(v_nt_count, 0)::NUMERIC / 260,
    COALESCE(v_ot_count, 0)::NUMERIC / 929,
    COALESCE(v_read_chapters, '[]'::jsonb),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    read_chapter_count = EXCLUDED.read_chapter_count,
    overall_pct = EXCLUDED.overall_pct,
    nt_pct = EXCLUDED.nt_pct,
    ot_pct = EXCLUDED.ot_pct,
    read_chapters_json = EXCLUDED.read_chapters_json,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_progress_summary
AFTER INSERT ON daily_reading_completions
FOR EACH ROW
EXECUTE FUNCTION refresh_user_progress_summary();

-- -----------------------------------------------------------------------------
-- 6. Helper: 오늘의 구절 선택
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION select_today_verse(
  p_user_id UUID,
  p_book_id TEXT,
  p_chapter INT
) RETURNS TABLE (
  book_id TEXT,
  chapter INT,
  verse INT,
  text_ko TEXT,
  reference TEXT
) AS $$
DECLARE
  v_seed INT;
BEGIN
  -- 유저 + 날짜로 시드 생성 (같은 날 같은 유저는 같은 구절)
  v_seed := abs(hashtext(p_user_id::TEXT || CURRENT_DATE::TEXT));

  RETURN QUERY
  WITH candidates AS (
    SELECT
      bv.book_id,
      bv.chapter,
      bv.verse,
      bv.text_ko,
      bb.name_ko_short || ' ' || bv.chapter || ':' || bv.verse AS reference,
      COALESCE(vh.weight, 3) AS weight
    FROM bible_verses bv
    JOIN bible_books bb ON bb.id = bv.book_id
    LEFT JOIN verse_highlights vh
      ON vh.book_id = bv.book_id
      AND vh.chapter = bv.chapter
      AND vh.verse = bv.verse
    WHERE bv.book_id = p_book_id
      AND bv.chapter = p_chapter
    ORDER BY weight DESC, bv.verse
    LIMIT 5
  )
  SELECT c.book_id, c.chapter, c.verse, c.text_ko, c.reference
  FROM candidates c
  OFFSET (v_seed % GREATEST((SELECT COUNT(*) FROM candidates), 1))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- 완료: Week 2 성경 본문 스키마 준비 완료
-- 다음: 20260420000003_trial_infra.sql (게스트 체험)
-- =============================================================================
