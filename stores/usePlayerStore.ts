/**
 * 오디오 플레이어 상태 관리 스토어
 */

import { create } from 'zustand';
import type { Passage } from '@/types';

interface PlayerState {
  currentPassage: Passage | null;
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  duration: number;
  showText: boolean;

  // Actions
  setPassage: (passage: Passage) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleText: () => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentPassage: null,
  isPlaying: false,
  speed: 1.5,
  currentTime: 0,
  duration: 0,
  showText: false,

  setPassage: (passage) => set({ currentPassage: passage, currentTime: 0 }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setSpeed: (speed) => set({ speed }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  toggleText: () => set((state) => ({ showText: !state.showText })),

  reset: () =>
    set({
      currentPassage: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      showText: false,
    }),
}));
