/**
 * 진도 관리 스토어
 * 책별 진도 + 집계 로직 + 이어읽기 정보
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookProgress, PlayMode, ContentSource, Testament } from '@/types';
import {
  ALL_BOOKS,
  OT_BOOKS,
  NT_BOOKS,
  getBookById,
  getBooksByCategory,
  getCategoryById,
  OT_CATEGORIES,
  NT_CATEGORIES
} from '@/lib/bible/catalog';

interface ProgressState {
  progressByBook: Record<string, BookProgress>;

  // Actions
  updateProgress: (bookId: string, completedChapters: number[], lastChapter?: number, lastPositionSec?: number) => void;
  markChapterComplete: (bookId: string, chapter: number) => void;
  setResumePoint: (bookId: string, chapter: number, positionSec?: number, mode?: PlayMode, source?: ContentSource) => void;
  resetProgress: () => void;

  // Computed (via functions)
  getBookProgress: (bookId: string) => number;
  getCategoryProgress: (categoryId: string) => number;
  getTestamentProgress: (testament: Testament) => number;
  getTotalProgress: () => number;
  getResumeInfo: (bookId: string) => { chapter?: number; positionSec?: number; label: string };
  getNextUncompletedBook: (categoryId?: string) => string | undefined;
  isBookComplete: (bookId: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progressByBook: {},

      updateProgress: (bookId, completedChapters, lastChapter, lastPositionSec) => {
        set((state) => ({
          progressByBook: {
            ...state.progressByBook,
            [bookId]: {
              ...state.progressByBook[bookId],
              completedChapters,
              lastChapter,
              lastPositionSec,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      markChapterComplete: (bookId, chapter) => {
        set((state) => {
          const existing = state.progressByBook[bookId] || { completedChapters: [] };
          const newCompleted = existing.completedChapters.includes(chapter)
            ? existing.completedChapters
            : [...existing.completedChapters, chapter].sort((a, b) => a - b);

          return {
            progressByBook: {
              ...state.progressByBook,
              [bookId]: {
                ...existing,
                completedChapters: newCompleted,
                lastChapter: chapter,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      setResumePoint: (bookId, chapter, positionSec, mode, source) => {
        set((state) => {
          const existing = state.progressByBook[bookId] || { completedChapters: [] };
          return {
            progressByBook: {
              ...state.progressByBook,
              [bookId]: {
                ...existing,
                lastChapter: chapter,
                lastPositionSec: positionSec,
                lastMode: mode,
                lastSource: source,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      resetProgress: () => {
        set({ progressByBook: {} });
      },

      getBookProgress: (bookId) => {
        const { progressByBook } = get();
        const book = getBookById(bookId);
        if (!book) return 0;

        const progress = progressByBook[bookId];
        if (!progress || !progress.completedChapters.length) return 0;

        return Math.round((progress.completedChapters.length / book.chaptersCount) * 100);
      },

      getCategoryProgress: (categoryId) => {
        const { getBookProgress } = get();
        const category = getCategoryById(categoryId);
        if (!category) return 0;

        const books = getBooksByCategory(categoryId);
        if (books.length === 0) return 0;

        // 장수 가중 평균
        let totalChapters = 0;
        let completedChapters = 0;

        for (const book of books) {
          const { progressByBook } = get();
          const progress = progressByBook[book.id];
          totalChapters += book.chaptersCount;
          completedChapters += progress?.completedChapters.length || 0;
        }

        return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      },

      getTestamentProgress: (testament) => {
        const { progressByBook } = get();
        const books = testament === 'OT' ? OT_BOOKS : NT_BOOKS;

        let totalChapters = 0;
        let completedChapters = 0;

        for (const book of books) {
          const progress = progressByBook[book.id];
          totalChapters += book.chaptersCount;
          completedChapters += progress?.completedChapters.length || 0;
        }

        return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      },

      getTotalProgress: () => {
        const { progressByBook } = get();

        let totalChapters = 0;
        let completedChapters = 0;

        for (const book of ALL_BOOKS) {
          const progress = progressByBook[book.id];
          totalChapters += book.chaptersCount;
          completedChapters += progress?.completedChapters.length || 0;
        }

        return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      },

      getResumeInfo: (bookId) => {
        const { progressByBook } = get();
        const progress = progressByBook[bookId];

        if (!progress) {
          return { label: '' };
        }

        if (progress.lastChapter) {
          if (progress.lastPositionSec) {
            const min = Math.floor(progress.lastPositionSec / 60);
            const sec = progress.lastPositionSec % 60;
            return {
              chapter: progress.lastChapter,
              positionSec: progress.lastPositionSec,
              label: `${progress.lastChapter}장 ${min}:${sec.toString().padStart(2, '0')}`,
            };
          }
          return {
            chapter: progress.lastChapter,
            label: `${progress.lastChapter}장`,
          };
        }

        return { label: '' };
      },

      getNextUncompletedBook: (categoryId) => {
        const { progressByBook } = get();

        let books = ALL_BOOKS;
        if (categoryId) {
          books = getBooksByCategory(categoryId);
        }

        for (const book of books) {
          const progress = progressByBook[book.id];
          if (!progress || progress.completedChapters.length < book.chaptersCount) {
            return book.id;
          }
        }

        return undefined;
      },

      isBookComplete: (bookId) => {
        const { progressByBook } = get();
        const book = getBookById(bookId);
        if (!book) return false;

        const progress = progressByBook[bookId];
        return progress?.completedChapters.length === book.chaptersCount;
      },
    }),
    {
      name: 'lazy-bible-progress',
    }
  )
);

// ============================================
// 진도 집계 유틸리티 (컴포넌트에서 직접 사용)
// ============================================

export function getOTCategoriesWithProgress(store: ProgressState) {
  return OT_CATEGORIES.map(cat => ({
    ...cat,
    progress: store.getCategoryProgress(cat.id),
  }));
}

export function getNTCategoriesWithProgress(store: ProgressState) {
  return NT_CATEGORIES.map(cat => ({
    ...cat,
    progress: store.getCategoryProgress(cat.id),
  }));
}
