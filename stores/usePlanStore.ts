/**
 * 플랜 상태 관리 스토어
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanType, CategoryType, Passage } from '@/types';
import { getTodayPassage } from '@/lib/samplePassages';

interface PlanState {
  selectedPlan: PlanType;
  selectedCategory: CategoryType;
  todayPassage: Passage | null;

  // Actions
  setPlan: (plan: PlanType) => void;
  setCategory: (category: CategoryType) => void;
  generateTodayPassage: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      selectedPlan: '1year',
      selectedCategory: 'all',
      todayPassage: null,

      setPlan: (plan) => set({ selectedPlan: plan }),

      setCategory: (category) => set({ selectedCategory: category }),

      generateTodayPassage: () => {
        const { selectedPlan, selectedCategory } = get();
        const passage = getTodayPassage(selectedPlan, selectedCategory);
        set({ todayPassage: passage });
      },
    }),
    {
      name: 'lazy-bible-plan',
      partialize: (state) => ({
        selectedPlan: state.selectedPlan,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
