/**
 * 홈 페이지
 * 게을러도성경일독 메인 화면
 */

'use client';

import { useRouter } from 'next/navigation';
import { useProgressStore, useSessionStore } from '@/stores';
import { getBookById } from '@/lib/bible/catalog';
import {
  HomeHeader,
  TimeButtonsGrid,
  BookProgressBoard,
  TogetherQuickButtons,
  LazyMeditationPanel,
} from '@/components/home';

export default function HomePage() {
  const router = useRouter();
  const { getResumeInfo, getNextUncompletedBook } = useProgressStore();
  const { startSession } = useSessionStore();

  // 세션 시작 핸들러
  const handleStartSession = (minutes: number, mode?: 'listen' | 'read', source?: string) => {
    // 이어읽기 우선: resume 포인트가 있는 책을 찾거나, 다음 미완료 책을 선택
    let targetBookId: string | undefined;
    let targetChapter = 1;

    // 1. 최근 resume 포인트가 있는 책 찾기
    const recentBooks = ['gen', 'mat']; // 시작점으로 창세기, 마태복음
    for (const bookId of recentBooks) {
      const resume = getResumeInfo(bookId);
      if (resume.chapter) {
        targetBookId = bookId;
        targetChapter = resume.chapter;
        break;
      }
    }

    // 2. 없으면 다음 미완료 책
    if (!targetBookId) {
      targetBookId = getNextUncompletedBook() || 'gen';
      const resume = getResumeInfo(targetBookId);
      targetChapter = resume.chapter || 1;
    }

    // 세션 시작
    startSession({
      bookId: targetBookId,
      startChapter: targetChapter,
      minutesTarget: minutes,
      mode: mode || 'listen',
      source: (source as 'pondang' | 'dramabible' | 'youtube' | 'text') || 'pondang',
    });

    // 세션 페이지로 이동
    router.push(`/session?book=${targetBookId}&chapter=${targetChapter}&minutes=${minutes}`);
  };

  // 책/장별 이어읽기 핸들러
  const handleStartReading = (bookId: string, chapter?: number) => {
    const book = getBookById(bookId);
    if (!book) return;

    const { getResumeInfo } = useProgressStore.getState();
    const resume = getResumeInfo(bookId);
    const targetChapter = chapter || resume.chapter || 1;

    startSession({
      bookId,
      startChapter: targetChapter,
      minutesTarget: 30, // 기본 30분
      mode: 'listen',
      source: 'pondang',
    });

    router.push(`/session?book=${bookId}&chapter=${targetChapter}`);
  };

  return (
    <div className="page-container bg-slate-200/50">
      {/* 헤더 */}
      <HomeHeader />

      {/* 시간 버튼 */}
      <TimeButtonsGrid onStartSession={handleStartSession} />

      {/* 책으로 일독 */}
      <BookProgressBoard onStartReading={handleStartReading} />

      {/* 함께읽기 버튼 */}
      <TogetherQuickButtons />

      {/* 게으른자의 묵상 */}
      <LazyMeditationPanel />
    </div>
  );
}
