/**
 * 세션 관리 스토어
 * 현재 실행 중인 세션 + 세션 로그
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionLog, SessionParams, PlayMode, ContentSource } from '@/types';

interface CurrentSession {
  bookId: string;
  startChapter: number;
  currentChapter: number;
  mode: PlayMode;
  source: ContentSource;
  speed: number;
  minutesTarget: number;
  startedAt: number;
  positionSec: number;
}

interface SessionState {
  currentSession: CurrentSession | null;
  sessionLogs: SessionLog[];

  // Actions
  startSession: (params: SessionParams & { bookId: string; startChapter: number }) => void;
  updatePosition: (positionSec: number) => void;
  updateChapter: (chapter: number) => void;
  endSession: (completedChapters: number[]) => SessionLog | null;
  cancelSession: () => void;

  // Computed
  getSessionsByBook: (bookId: string) => SessionLog[];
  getTotalMinutesRead: () => number;
  getRecentSessions: (limit?: number) => SessionLog[];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessionLogs: [],

      startSession: (params) => {
        const session: CurrentSession = {
          bookId: params.bookId,
          startChapter: params.startChapter,
          currentChapter: params.startChapter,
          mode: params.mode || 'listen',
          source: params.source || 'pondang',
          speed: params.speed || 1.0,
          minutesTarget: params.minutesTarget,
          startedAt: Date.now(),
          positionSec: 0,
        };
        set({ currentSession: session });
      },

      updatePosition: (positionSec) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, positionSec },
          };
        });
      },

      updateChapter: (chapter) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, currentChapter: chapter },
          };
        });
      },

      endSession: (completedChapters) => {
        const { currentSession, sessionLogs } = get();
        if (!currentSession) return null;

        const log: SessionLog = {
          id: `session_${Date.now()}`,
          bookId: currentSession.bookId,
          mode: currentSession.mode,
          source: currentSession.source,
          speed: currentSession.speed,
          startedAt: currentSession.startedAt,
          endedAt: Date.now(),
          minutesTarget: currentSession.minutesTarget,
          completedChaptersAdded: completedChapters,
          positionSec: currentSession.positionSec,
        };

        set({
          currentSession: null,
          sessionLogs: [log, ...sessionLogs].slice(0, 100), // 최근 100개만 유지
        });

        return log;
      },

      cancelSession: () => {
        set({ currentSession: null });
      },

      getSessionsByBook: (bookId) => {
        return get().sessionLogs.filter((log) => log.bookId === bookId);
      },

      getTotalMinutesRead: () => {
        const { sessionLogs } = get();
        return sessionLogs.reduce((total, log) => {
          if (log.endedAt) {
            return total + Math.round((log.endedAt - log.startedAt) / 60000);
          }
          return total;
        }, 0);
      },

      getRecentSessions: (limit = 10) => {
        return get().sessionLogs.slice(0, limit);
      },
    }),
    {
      name: 'lazy-bible-sessions',
    }
  )
);
