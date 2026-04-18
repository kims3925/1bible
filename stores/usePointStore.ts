/**
 * v6.0 포인트 시스템 스토어
 * 포인트 적립/사용/이력 + 읽기 선행 잠금/해금
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PointEntry, PointReason, Badge, PointShopItem } from '@/types';

interface PointState {
  // 포인트
  totalPoints: number;
  history: PointEntry[];

  // 읽기 선행 구조
  todayReadingCompleted: boolean;
  todayReadingDate: string;

  // 배지
  earnedBadges: string[];

  // 포인트 적립/사용
  earnPoints: (amount: number, reason: PointReason, description: string) => void;
  spendPoints: (amount: number, reason: PointReason, description: string) => boolean;

  // 읽기 선행 구조
  completeReading: () => void;
  isFeatureUnlocked: () => boolean;
  resetDailyReading: () => void;

  // 배지
  earnBadge: (badgeId: string) => void;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const usePointStore = create<PointState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      history: [],
      todayReadingCompleted: false,
      todayReadingDate: '',
      earnedBadges: [],

      earnPoints: (amount, reason, description) => {
        const { todayReadingCompleted, totalPoints, history } = get();
        // 읽기 완료 포인트는 항상 적립 가능, 나머지는 읽기 완료 필요
        if (reason !== 'reading_complete' && !todayReadingCompleted) return;

        const entry: PointEntry = {
          id: `pt-${Date.now()}`,
          userId: '',
          amount,
          reason,
          description,
          requiresReading: reason !== 'reading_complete',
          createdAt: new Date().toISOString(),
        };
        set({
          totalPoints: totalPoints + amount,
          history: [entry, ...history].slice(0, 100),
        });
      },

      spendPoints: (amount, reason, description) => {
        const { totalPoints, todayReadingCompleted, history } = get();
        if (!todayReadingCompleted) return false;
        if (totalPoints < amount) return false;

        const entry: PointEntry = {
          id: `pt-${Date.now()}`,
          userId: '',
          amount: -amount,
          reason,
          description,
          requiresReading: true,
          createdAt: new Date().toISOString(),
        };
        set({
          totalPoints: totalPoints - amount,
          history: [entry, ...history].slice(0, 100),
        });
        return true;
      },

      completeReading: () => {
        const today = getTodayKey();
        const { todayReadingDate } = get();
        if (todayReadingDate === today) return; // 이미 완료
        set({ todayReadingCompleted: true, todayReadingDate: today });
        // 자동 포인트 적립
        get().earnPoints(10, 'reading_complete', '오늘 분량 읽기 완료');
      },

      isFeatureUnlocked: () => {
        const { todayReadingCompleted, todayReadingDate } = get();
        const today = getTodayKey();
        // 날짜가 바뀌면 리셋
        if (todayReadingDate !== today) return false;
        return todayReadingCompleted;
      },

      resetDailyReading: () => {
        const today = getTodayKey();
        const { todayReadingDate } = get();
        if (todayReadingDate !== today) {
          set({ todayReadingCompleted: false, todayReadingDate: '' });
        }
      },

      earnBadge: (badgeId) => {
        const { earnedBadges } = get();
        if (earnedBadges.includes(badgeId)) return;
        set({ earnedBadges: [...earnedBadges, badgeId] });
      },
    }),
    { name: 'lazy-bible-points' }
  )
);

// 포인트 상점 아이템 (상수 데이터)
export const SHOP_ITEMS: PointShopItem[] = [
  { id: 'theme-gold', name: '새벽기도 골드 테마', description: '금빛 성경 테마', icon: '🎨', category: 'theme', price: 300 },
  { id: 'theme-ocean', name: '갈릴리 바다 테마', description: '시원한 바다 테마', icon: '🌊', category: 'theme', price: 300 },
  { id: 'frame-fire', name: '불꽃 프레임', description: '열정의 불꽃 프로필 프레임', icon: '🔥', category: 'frame', price: 200 },
  { id: 'frame-peace', name: '평안 프레임', description: '평화로운 올리브 프레임', icon: '🕊️', category: 'frame', price: 200 },
  { id: 'frame-crown', name: '왕관 프레임', description: '왕관 프로필 프레임', icon: '👑', category: 'frame', price: 200 },
  { id: 'music-psalm23', name: '시편 23편 찬양', description: 'EL MUSIC 프리미엄 트랙', icon: '🎵', category: 'music', price: 500 },
  { id: 'title-warrior', name: '말씀의 용사 칭호', description: '프로필에 표시되는 칭호', icon: '⚔️', category: 'title', price: 400 },
  { id: 'title-intercessor', name: '중보기도자 칭호', description: '프로필에 표시되는 칭호', icon: '🙏', category: 'title', price: 400 },
  { id: 'donation-1000', name: '선교 후원 (₩1,000)', description: '1,000P → ₩1,000 기부', icon: '❤️', category: 'donation', price: 1000 },
  { id: 'assess-premium', name: '프리미엄 검사 해금', description: '심층 검사 1회 이용권', icon: '🔓', category: 'assessment', price: 100 },
];

// 배지 정의
export const BADGES: Badge[] = [
  { id: 'streak-7', name: '7일 연속 읽기', icon: '🔥', description: '7일 연속 성경 읽기 달성', condition: '7일 연속 읽기' },
  { id: 'streak-30', name: '30일 연속 읽기', icon: '💪', description: '30일 연속 성경 읽기 달성', condition: '30일 연속 읽기' },
  { id: 'streak-100', name: '100일 연속 읽기', icon: '👑', description: '100일 연속 성경 읽기 달성', condition: '100일 연속 읽기' },
  { id: 'nt-complete', name: '신약 완독', icon: '📖', description: '신약 27권 전체 읽기 완료', condition: '신약 전체 읽기' },
  { id: 'ot-complete', name: '구약 완독', icon: '📜', description: '구약 39권 전체 읽기 완료', condition: '구약 전체 읽기' },
  { id: 'bible-complete', name: '성경 일독', icon: '🏆', description: '성경 66권 전체 읽기 완료', condition: '66권 전체 읽기' },
  { id: 'quiz-king', name: '퀴즈왕', icon: '🧠', description: '성경 퀴즈 10회 만점', condition: '퀴즈 10회 만점' },
  { id: 'sharer', name: '나눔왕', icon: '📤', description: '콘텐츠 공유 30회 달성', condition: '공유 30회' },
  { id: 'encourager', name: '격려자', icon: '💌', description: '응원 메시지 50회 발송', condition: '응원 50회' },
  { id: 'assessor', name: '자기 탐구자', icon: '🔍', description: '검사 5종 완료', condition: '검사 5종 완료' },
];
