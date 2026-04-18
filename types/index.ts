/**
 * 핵심 타입 정의
 * LazyBibleRead - 게을러도성경일독
 */

// ============================================
// 성경 카탈로그 타입
// ============================================

export type Testament = 'OT' | 'NT';

export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  chaptersCount: number;
  testament: Testament;
  category: string;
  order: number;
}

export interface BibleCategory {
  id: string;
  name: string;
  testament: Testament;
  books: string[]; // book ids
}

// ============================================
// 진도 관련 타입
// ============================================

export type PlayMode = 'listen' | 'read' | 'recite';
export type ContentSource = 'pondang' | 'dramabible' | 'youtube' | 'text';

export interface BookProgress {
  completedChapters: number[];
  lastChapter?: number;
  lastVerse?: number;
  lastPositionSec?: number;
  lastMode?: PlayMode;
  lastSource?: ContentSource;
  updatedAt: number;
}

export interface ProgressState {
  progressByBook: Record<string, BookProgress>;
}

// ============================================
// 플랜 관련 타입
// ============================================

export type PlanType = '10min' | '1hour' | '1day' | '1month' | '3months' | '1year';
export type PlanScope = 'ALL' | 'OT' | 'NT';

export interface PlanInfo {
  type: PlanType;
  label: string;
  description: string;
  dailyMinutes: number;
  icon: string;
}

export type CategoryType =
  | 'all'
  | 'ot'
  | 'nt'
  | 'pentateuch'
  | 'poetry'
  | 'gospels'
  | 'paul'
  | 'book';

export interface CategoryInfo {
  type: CategoryType;
  label: string;
  books: string[];
}

export interface Plan {
  planId: string;
  scope: PlanScope;
  durationDays: number;
  dailyMinutes: number;
  preferMode: PlayMode;
  preferSource: ContentSource;
  startedAt: number;
}

// ============================================
// 세션 관련 타입
// ============================================

export interface SessionLog {
  id: string;
  bookId: string;
  mode: PlayMode;
  source: ContentSource;
  speed: number;
  startedAt: number;
  endedAt?: number;
  minutesTarget: number;
  completedChaptersAdded: number[];
  positionSec?: number;
}

export interface SessionParams {
  minutesTarget: number;
  mode?: PlayMode;
  source?: ContentSource;
  bookId?: string;
  startChapter?: number;
  speed?: number;
}

// ============================================
// 성경 본문 관련 타입
// ============================================

export interface Passage {
  id: string;
  title: string;
  category: CategoryType;
  book: string;
  bookCode: string;
  startChapter: number;
  endChapter: number;
  durationSec: number;
  audioUrl: string;
  text: string;
}

// ============================================
// 읽기 세션 관련 타입
// ============================================

export interface ReadingSession {
  id: string;
  passageId: string;
  planType: PlanType;
  mode: PlayMode;
  speed: number;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  progress: number;
}

// ============================================
// 묵상 관련 타입
// ============================================

export type MeditationStateTag = 'gratitude' | 'comfort' | 'repent' | 'decision' | 'question' | 'just_read';
export type MeditationActionTag = 'speak_to_spouse' | 'listen_again_5min' | 'blessing_prayer' | 'just_save';

export interface LazyNote {
  id: string;
  createdAt: number;
  stateTag: MeditationStateTag;
  oneLine?: string;
  actionTag?: MeditationActionTag;
  relatedBookId?: string;
  relatedChapter?: number;
}

export interface EmotionOption {
  id: string;
  label: string;
  secondary: string[];
}

export interface MeditationEntry {
  id: string;
  createdAt: string;
  passageId: string;
  passageTitle: string;
  graceTags: string[];
  emotionPrimary: string;
  emotionSecondary: string[];
  gratitudeTags: string[];
  decisionTag: string;
  autoSummary: string;
  userNote?: string;
}

// ============================================
// 그룹 관련 타입
// ============================================

export type GroupType = 'couple' | 'smallgroup';

export interface GroupCheckin {
  odayCheckins: {
    odayCheckins: {
      odayCheckins: {
        userId: string;
        status: 'done' | 'pending';
        at: number;
      }[];
    };
  };
}

export interface Group {
  id: string;
  type: GroupType;
  name: string;
  members: string[];
  todayCheckins: { userId: string; status: 'done' | 'pending'; at: number }[];
}

// ============================================
// 설정 관련 타입
// ============================================

export interface UserSettings {
  defaultSpeed: number;
  defaultMode: PlayMode;
  defaultSource: ContentSource;
  autoExpandText: boolean;
  lastPlanType: PlanType;
  lastCategory: CategoryType;
}

// ============================================
// UI 관련 타입
// ============================================

export interface ChipOption {
  id: string;
  label: string;
  selected?: boolean;
}

// ============================================
// 오늘의 말씀 타입
// ============================================

export interface TodayVerse {
  reference: string;
  text: string;
}

// ============================================
// v4.0 허브링크형 개인 페이지 타입
// ============================================

export type MenuKey = 'bible' | 'links' | 'together';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  statusMessage?: string;
  avatarUrl?: string;
  publicUrl: string;
  theme: ProfileTheme;
  badgeIds: string[];
  hunlinkId?: string;
  createdAt: string;
}

export interface ProfileTheme {
  bgColor: string;
  cardColor: string;
  textColor: string;
  accentColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  fontFamily: string;
  avatarShape: 'circle' | 'square';
}

export interface UserLink {
  id: string;
  userId: string;
  label: string;
  url: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  type: 'link' | 'sns' | 'internal';
}

export interface MenuVisibility {
  groupId: string;
  menuKey: MenuKey;
  isVisible: boolean;
  setByManagerId?: string;
}

export interface SocialInteraction {
  fromUser: string;
  toUser: string;
  type: 'like' | 'cheer' | 'follow';
  createdAt: string;
}

// ============================================
// 매니저 대시보드 타입
// ============================================

export type ManagerTab =
  | 'dashboard'
  | 'plan'
  | 'menu-control'
  | 'group'
  | 'analytics'
  | 'challenge'
  | 'notifications'
  | 'content'
  | 'settings';

export interface GroupMember {
  id: string;
  name: string;
  avatarUrl?: string;
  progress: number;
  streak: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

// ============================================
// v6.0 콘텐츠 블록 시스템
// ============================================

export type BlockType =
  | 'profile'
  | 'social-buttons'
  | 'badges'
  | 'namecard'
  | 'bible-reading'
  | 'assessment'
  | 'together'
  | 'internal-links'
  | 'external-links'
  | 'custom-survey';

export type BlockVisibility = 'public' | 'private';

export interface ContentBlock {
  id: string;
  userId: string;
  type: BlockType;
  title: string;
  config: Record<string, unknown>;
  sortOrder: number;
  isExpanded: boolean;
  visibility: BlockVisibility;
  isActive: boolean;
}

export interface BlockLayout {
  userId: string;
  blockOrderJson: string[];
  lastUpdated: string;
}

// ============================================
// v6.0 공유하기
// ============================================

export type ShareContentType =
  | 'reading-complete'
  | 'assessment-result'
  | 'meditation'
  | 'challenge-achieve'
  | 'badge-earn'
  | 'game-result';

export interface ShareCard {
  id: string;
  userId: string;
  contentType: ShareContentType;
  title: string;
  description: string;
  imageUrl?: string;
  shareCount: number;
  createdAt: string;
}

// ============================================
// v6.0 검사/체크리스트
// ============================================

export type AssessmentTier = 'free' | 'premium';
export type AssessmentCategory = 'personality' | 'spiritual' | 'self' | 'relationship' | 'mission';

export interface Assessment {
  id: string;
  type: string;
  title: string;
  icon: string;
  category: AssessmentCategory;
  description: string;
  questionCount: number;
  tier: AssessmentTier;
  pointCost: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { id: string; label: string; value: number }[];
}

export interface UserAssessment {
  id: string;
  userId: string;
  assessmentId: string;
  answers: Record<string, string>;
  result: AssessmentResult;
  shared: boolean;
  completedAt: string;
}

export interface AssessmentResult {
  type: string;
  label: string;
  characterName: string;
  characterDescription: string;
  verseReference: string;
  verseText: string;
  traits: string[];
  shareText: string;
}

// ============================================
// v6.0 설문조사형 AI 콘텐츠
// ============================================

export type SurveyInputType = 'checkbox' | 'radio' | 'text';

export interface CustomSurvey {
  id: string;
  userId: string;
  title: string;
  questions: SurveyQuestion[];
  aiResponse?: string;
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  inputType: SurveyInputType;
  options?: string[];
}

// ============================================
// v6.0 포인트 시스템
// ============================================

export type PointReason =
  | 'reading_complete'
  | 'meditation_note'
  | 'encouragement_sent'
  | 'assessment_complete'
  | 'quiz_correct'
  | 'content_shared'
  | 'member_invited'
  | 'challenge_win'
  | 'challenge_loss'
  | 'shop_purchase'
  | 'donation';

export interface PointEntry {
  id: string;
  userId: string;
  amount: number;
  reason: PointReason;
  description: string;
  requiresReading: boolean;
  createdAt: string;
}

export interface PointShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'theme' | 'frame' | 'music' | 'title' | 'donation' | 'assessment';
  price: number;
  stock?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
}

// ============================================
// v6.0 성경 게임존
// ============================================

export type GameType = 'quiz' | 'bingo' | 'treasure' | 'relay' | 'cards';

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  score: number;
  pointsEarned: number;
  completedAt: string;
}

export interface QuizQuestion {
  id: string;
  bookId: string;
  chapter: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BingoBoard {
  id: string;
  userId: string;
  cells: { bookId: string; completed: boolean }[];
  completedLines: number;
}

// ============================================
// v6.0 단체 선물
// ============================================

export type GiftType = 'bonus_points' | 'badge' | 'theme' | 'branding';

export interface GroupGift {
  id: string;
  groupId: string;
  giftType: GiftType;
  condition: string;
  description: string;
  awardedAt?: string;
}

// ============================================
// v6.0 읽기 선행 구조
// ============================================

export interface ReadingLockState {
  todayReadingCompleted: boolean;
  todayReadingDate: string;
  unlockedFeatures: string[];
}
