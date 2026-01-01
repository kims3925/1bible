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
