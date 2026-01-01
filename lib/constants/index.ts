/**
 * 앱 전역 상수 정의
 */

import type { PlanInfo, CategoryInfo, EmotionOption } from '@/types';

// ============================================
// 플랜 정보
// ============================================

export const PLAN_OPTIONS: PlanInfo[] = [
  {
    type: '10min',
    label: '10분',
    description: '바쁜 하루, 짧게라도',
    dailyMinutes: 10,
    icon: '⚡',
  },
  {
    type: '1hour',
    label: '1시간',
    description: '여유로운 말씀 시간',
    dailyMinutes: 60,
    icon: '☕',
  },
  {
    type: '1day',
    label: '하루',
    description: '오늘 하루 말씀과 함께',
    dailyMinutes: 120,
    icon: '🌅',
  },
  {
    type: '1month',
    label: '1개월',
    description: '한 달 안에 완독',
    dailyMinutes: 180,
    icon: '📅',
  },
  {
    type: '3months',
    label: '3개월',
    description: '분기별 일독',
    dailyMinutes: 60,
    icon: '🗓️',
  },
  {
    type: '1year',
    label: '1년',
    description: '매일 조금씩 천천히',
    dailyMinutes: 15,
    icon: '🎯',
  },
];

// ============================================
// 카테고리 정보
// ============================================

export const CATEGORY_OPTIONS: CategoryInfo[] = [
  { type: 'all', label: '성경 전체', books: [] },
  { type: 'nt', label: '신약', books: [] },
  { type: 'ot', label: '구약', books: [] },
  { type: 'pentateuch', label: '모세오경', books: ['창세기', '출애굽기', '레위기', '민수기', '신명기'] },
  { type: 'poetry', label: '시가서', books: ['욥기', '시편', '잠언', '전도서', '아가'] },
  { type: 'gospels', label: '복음서', books: ['마태복음', '마가복음', '누가복음', '요한복음'] },
  { type: 'paul', label: '바울서신', books: ['로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서'] },
  { type: 'book', label: '책별 선택', books: [] },
];

// ============================================
// 은혜 태그
// ============================================

export const GRACE_TAGS = [
  '위로',
  '격려',
  '깨달음',
  '도전',
  '감사',
  '회개',
  '평안',
  '소망',
  '사랑',
  '용서',
  '인내',
  '믿음',
  '잘 모르겠음',
];

// ============================================
// 감정 옵션
// ============================================

export const EMOTIONS: EmotionOption[] = [
  { id: 'joy', label: '기쁨', secondary: ['감격', '설렘', '평온', '감사'] },
  { id: 'peace', label: '평안', secondary: ['안도', '위로', '고요', '쉼'] },
  { id: 'conviction', label: '찔림', secondary: ['회개', '부끄러움', '결심', '각성'] },
  { id: 'neutral', label: '무덤덤', secondary: ['피곤', '산만', '막연함'] },
  { id: 'confusion', label: '혼란', secondary: ['의문', '답답', '막막'] },
];

// ============================================
// 감사 태그
// ============================================

export const GRATITUDE_TAGS = [
  '오늘 말씀을 들을 수 있어서',
  '이 시간을 내어 준 나 자신에게',
  '함께 묵상하는 이들이 있어서',
  '하나님이 말씀하신다는 사실',
  '아직 은혜의 시간 안에 있어서',
  '특별히 감사한 것 없음',
];

// ============================================
// 결단 태그
// ============================================

export const DECISION_TAGS = [
  '오늘 하루 감사하며 살기',
  '누군가에게 친절히 대하기',
  '불평 대신 찬양하기',
  '잠시 멈추고 기도하기',
  '말을 아끼고 듣기',
  '용서하기',
  '내려놓기',
  '아직 결단 못함',
];

// ============================================
// 재생 속도 옵션
// ============================================

export const SPEED_OPTIONS = [1.0, 1.25, 1.5, 1.75, 2.0];

// ============================================
// 기본 설정
// ============================================

export const DEFAULT_SETTINGS = {
  defaultSpeed: 1.5,
  autoExpandText: false,
  lastPlanType: '1year' as const,
  lastCategory: 'all' as const,
};
