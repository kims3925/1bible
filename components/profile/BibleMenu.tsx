/**
 * 성경읽기 메뉴 콘텐츠
 * 시간 선택 + 책별 일독 + 묵상 + 영어 병행 + 365 통독
 * 기존 홈 화면 컴포넌트를 허브링크 스타일로 통합
 */

'use client';

import { useRouter } from 'next/navigation';
import { useProgressStore, useSessionStore } from '@/stores';
import { getBookById } from '@/lib/bible/catalog';
import {
  TimeButtonsGrid,
  BookProgressBoard,
  LazyMeditationPanel,
} from '@/components/home';

export function BibleMenu() {
  const router = useRouter();
  const { getResumeInfo, getNextUncompletedBook } = useProgressStore();
  const { startSession } = useSessionStore();

  const handleStartSession = (minutes: number, mode?: 'listen' | 'read', source?: string) => {
    let targetBookId: string | undefined;
    let targetChapter = 1;

    const recentBooks = ['gen', 'mat'];
    for (const bookId of recentBooks) {
      const resume = getResumeInfo(bookId);
      if (resume.chapter) {
        targetBookId = bookId;
        targetChapter = resume.chapter;
        break;
      }
    }

    if (!targetBookId) {
      targetBookId = getNextUncompletedBook() || 'gen';
      const resume = getResumeInfo(targetBookId);
      targetChapter = resume.chapter || 1;
    }

    startSession({
      bookId: targetBookId,
      startChapter: targetChapter,
      minutesTarget: minutes,
      mode: mode || 'listen',
      source: (source as 'pondang' | 'dramabible' | 'youtube' | 'text') || 'pondang',
    });

    router.push(`/session?book=${targetBookId}&chapter=${targetChapter}&minutes=${minutes}`);
  };

  const handleStartReading = (bookId: string, chapter?: number) => {
    const book = getBookById(bookId);
    if (!book) return;

    const resume = useProgressStore.getState().getResumeInfo(bookId);
    const targetChapter = chapter || resume.chapter || 1;

    startSession({
      bookId,
      startChapter: targetChapter,
      minutesTarget: 30,
      mode: 'listen',
      source: 'pondang',
    });

    router.push(`/session?book=${bookId}&chapter=${targetChapter}`);
  };

  return (
    <div className="space-y-4">
      {/* 섹션 A: 지금 가능한 시간 */}
      <TimeButtonsGrid onStartSession={handleStartSession} />

      {/* 섹션 B: 책으로 일독 */}
      <BookProgressBoard onStartReading={handleStartReading} />

      {/* 섹션 C: 게으른자의 묵상 */}
      <LazyMeditationPanel />
    </div>
  );
}
