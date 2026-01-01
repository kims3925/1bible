/**
 * 세션 실행 페이지
 * 듣기/읽기/낭독 실행 화면
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProgressStore, useSessionStore } from '@/stores';
import { getBookById } from '@/lib/bible/catalog';
import type { PlayMode, ContentSource } from '@/types';

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book') || 'gen';
  const chapter = parseInt(searchParams.get('chapter') || '1', 10);
  const minutes = parseInt(searchParams.get('minutes') || '30', 10);

  const { updateChapter, endSession, cancelSession } =
    useSessionStore();
  const { markChapterComplete, setResumePoint } = useProgressStore();

  const [mode, setMode] = useState<PlayMode>('listen');
  const [source, setSource] = useState<ContentSource>('pondang');
  const [speed, setSpeed] = useState(1.0);
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);

  const book = getBookById(bookId);
  const targetSeconds = minutes * 60;
  const progress = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 장 완료 처리
  const handleChapterComplete = () => {
    if (!completedChapters.includes(currentChapter)) {
      setCompletedChapters((prev) => [...prev, currentChapter]);
      markChapterComplete(bookId, currentChapter);
    }

    // 다음 장으로
    if (book && currentChapter < book.chaptersCount) {
      setCurrentChapter(currentChapter + 1);
      updateChapter(currentChapter + 1);
    }
  };

  // 세션 종료
  const handleEndSession = () => {
    // 현재 위치 저장
    setResumePoint(bookId, currentChapter, elapsedSeconds, mode, source);

    // 세션 로그 저장
    endSession(completedChapters);

    // 홈으로
    router.push('/');
  };

  // 세션 취소
  const handleCancel = () => {
    if (confirm('세션을 취소하시겠습니까? 진도는 저장되지 않습니다.')) {
      cancelSession();
      router.push('/');
    }
  };

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>책을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4">
        <button
          onClick={handleCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="닫기"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-sm text-slate-400">목표: {minutes}분</div>
        </div>
        <button
          onClick={handleEndSession}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium"
        >
          완료
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {/* 책/장 정보 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">{book.name}</h1>
          <p className="text-xl text-slate-300">{currentChapter}장</p>
        </div>

        {/* 진행 원형 */}
        <div className="relative mb-8">
          <svg className="h-48 w-48 -rotate-90 transform">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              strokeLinecap="round"
              className="text-primary transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">{formatTime(elapsedSeconds)}</div>
            <div className="text-sm text-slate-400">/ {formatTime(targetSeconds)}</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="mb-8 flex items-center gap-6">
          {/* 이전 장 */}
          <button
            onClick={() => currentChapter > 1 && setCurrentChapter(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 재생/일시정지 */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
          >
            {isPlaying ? (
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 다음 장 */}
          <button
            onClick={() => currentChapter < book.chaptersCount && setCurrentChapter(currentChapter + 1)}
            disabled={currentChapter >= book.chaptersCount}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 장 완료 버튼 */}
        <button
          onClick={handleChapterComplete}
          className={cn(
            'mb-4 rounded-xl px-8 py-3 font-medium transition-all',
            completedChapters.includes(currentChapter)
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-white hover:bg-slate-600'
          )}
        >
          {completedChapters.includes(currentChapter) ? '완료됨' : `${currentChapter}장 완료`}
        </button>

        {/* 완료된 장 표시 */}
        {completedChapters.length > 0 && (
          <div className="text-sm text-slate-400">
            완료: {completedChapters.join(', ')}장
          </div>
        )}
      </div>

      {/* 하단 옵션 */}
      <div className="border-t border-slate-700 p-4">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {/* 모드 선택 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">모드</span>
            <div className="flex gap-1">
              {(['listen', 'read', 'recite'] as PlayMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    mode === m ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {m === 'listen' ? '듣기' : m === 'read' ? '읽기' : '낭독'}
                </button>
              ))}
            </div>
          </div>

          {/* 배속 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">배속</span>
            <div className="flex gap-1">
              {[1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    speed === s ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* 소스 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">소스</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ContentSource)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-white"
            >
              <option value="pondang">본당</option>
              <option value="dramabible">드라마바이블</option>
              <option value="youtube">YouTube</option>
              <option value="text">텍스트</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-white">로딩 중...</div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
