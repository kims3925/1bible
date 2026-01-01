/**
 * 묵상/기도 노트 스토어
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LazyNote, MeditationStateTag, MeditationActionTag, TodayVerse } from '@/types';

// 오늘의 말씀 더미 데이터
const SAMPLE_VERSES: TodayVerse[] = [
  { reference: '고후6:10', text: '"근심하는 자 같으나 항상 기뻐하고 가난한 자 같으나 많은 사람을 부요하게 하고 아무 것도 없는 자 같으나 모든 것을 가진 자로다"' },
  { reference: '빌4:13', text: '"내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라"' },
  { reference: '시23:1', text: '"여호와는 나의 목자시니 내게 부족함이 없으리로다"' },
  { reference: '롬8:28', text: '"우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라"' },
  { reference: '잠3:5-6', text: '"너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라"' },
  { reference: '사41:10', text: '"두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와주리라"' },
  { reference: '마11:28', text: '"수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"' },
];

interface NotesState {
  meditationNotes: LazyNote[];
  prayerNotes: LazyNote[];
  todayVerse: TodayVerse;

  // Actions
  addMeditationNote: (note: Omit<LazyNote, 'id' | 'createdAt'>) => void;
  addPrayerNote: (note: Omit<LazyNote, 'id' | 'createdAt'>) => void;
  deleteNote: (type: 'meditation' | 'prayer', id: string) => void;
  refreshTodayVerse: () => void;

  // Computed
  getRecentMeditationNotes: (limit?: number) => LazyNote[];
  getRecentPrayerNotes: (limit?: number) => LazyNote[];
  getNotesByBook: (bookId: string) => LazyNote[];
}

function getRandomVerse(): TodayVerse {
  const idx = Math.floor(Math.random() * SAMPLE_VERSES.length);
  return SAMPLE_VERSES[idx];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      meditationNotes: [],
      prayerNotes: [],
      todayVerse: SAMPLE_VERSES[0],

      addMeditationNote: (note) => {
        const newNote: LazyNote = {
          ...note,
          id: `med_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          meditationNotes: [newNote, ...state.meditationNotes],
        }));
      },

      addPrayerNote: (note) => {
        const newNote: LazyNote = {
          ...note,
          id: `pray_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          prayerNotes: [newNote, ...state.prayerNotes],
        }));
      },

      deleteNote: (type, id) => {
        set((state) => {
          if (type === 'meditation') {
            return { meditationNotes: state.meditationNotes.filter((n) => n.id !== id) };
          } else {
            return { prayerNotes: state.prayerNotes.filter((n) => n.id !== id) };
          }
        });
      },

      refreshTodayVerse: () => {
        set({ todayVerse: getRandomVerse() });
      },

      getRecentMeditationNotes: (limit = 10) => {
        return get().meditationNotes.slice(0, limit);
      },

      getRecentPrayerNotes: (limit = 10) => {
        return get().prayerNotes.slice(0, limit);
      },

      getNotesByBook: (bookId) => {
        const { meditationNotes, prayerNotes } = get();
        return [...meditationNotes, ...prayerNotes]
          .filter((n) => n.relatedBookId === bookId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: 'lazy-bible-notes',
    }
  )
);

// 상태 태그 레이블
export const STATE_TAG_LABELS: Record<MeditationStateTag, string> = {
  gratitude: '감사',
  comfort: '위로',
  repent: '회개',
  decision: '결단',
  question: '질문',
  just_read: '그냥읽음',
};

// 액션 태그 레이블
export const ACTION_TAG_LABELS: Record<MeditationActionTag, string> = {
  speak_to_spouse: '배우자에게 한마디',
  listen_again_5min: '5분 재청취',
  blessing_prayer: '축복기도',
  just_save: '저장만',
};
