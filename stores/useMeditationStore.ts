/**
 * 묵상 입력 상태 관리 스토어
 */

import { create } from 'zustand';

interface MeditationState {
  passageId: string;
  passageTitle: string;
  graceTags: string[];
  emotionPrimary: string;
  emotionSecondary: string[];
  gratitudeTags: string[];
  decisionTag: string;
  userNote: string;

  // Actions
  setPassage: (id: string, title: string) => void;
  toggleGrace: (tag: string) => void;
  setEmotionPrimary: (emotion: string) => void;
  toggleEmotionSecondary: (emotion: string) => void;
  toggleGratitude: (tag: string) => void;
  setDecision: (decision: string) => void;
  setUserNote: (note: string) => void;
  reset: () => void;
}

const initialState = {
  passageId: '',
  passageTitle: '',
  graceTags: [],
  emotionPrimary: '',
  emotionSecondary: [],
  gratitudeTags: [],
  decisionTag: '',
  userNote: '',
};

export const useMeditationStore = create<MeditationState>((set) => ({
  ...initialState,

  setPassage: (id, title) => set({ passageId: id, passageTitle: title }),

  toggleGrace: (tag) =>
    set((state) => {
      // '잘 모르겠음' 선택 시 다른 태그 해제
      if (tag === '잘 모르겠음') {
        return { graceTags: state.graceTags.includes(tag) ? [] : [tag] };
      }
      // 다른 태그 선택 시 '잘 모르겠음' 해제
      const filtered = state.graceTags.filter((t) => t !== '잘 모르겠음');
      if (filtered.includes(tag)) {
        return { graceTags: filtered.filter((t) => t !== tag) };
      }
      return { graceTags: [...filtered, tag] };
    }),

  setEmotionPrimary: (emotion) =>
    set({ emotionPrimary: emotion, emotionSecondary: [] }),

  toggleEmotionSecondary: (emotion) =>
    set((state) => {
      if (state.emotionSecondary.includes(emotion)) {
        return { emotionSecondary: state.emotionSecondary.filter((e) => e !== emotion) };
      }
      return { emotionSecondary: [...state.emotionSecondary, emotion] };
    }),

  toggleGratitude: (tag) =>
    set((state) => {
      // '특별히 감사한 것 없음' 선택 시 다른 태그 해제
      if (tag === '특별히 감사한 것 없음') {
        return { gratitudeTags: state.gratitudeTags.includes(tag) ? [] : [tag] };
      }
      // 다른 태그 선택 시 '특별히 감사한 것 없음' 해제
      const filtered = state.gratitudeTags.filter((t) => t !== '특별히 감사한 것 없음');
      if (filtered.includes(tag)) {
        return { gratitudeTags: filtered.filter((t) => t !== tag) };
      }
      return { gratitudeTags: [...filtered, tag] };
    }),

  setDecision: (decision) =>
    set((state) => ({
      decisionTag: state.decisionTag === decision ? '' : decision,
    })),

  setUserNote: (note) => set({ userNote: note }),

  reset: () => set(initialState),
}));
