/**
 * 책으로 일독 섹션
 * 전체/신약/구약 진도 + OT/NT 카드 + 카테고리별 진행
 */

'use client';

import { useState } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/stores';
import {
  OT_CATEGORIES,
  NT_CATEGORIES,
  getBooksByCategory,
} from '@/lib/bible/catalog';
import type { BibleBook, BibleCategory } from '@/types';

interface BookProgressBoardProps {
  onStartReading: (bookId: string, chapter?: number) => void;
}

export function BookProgressBoard({ onStartReading }: BookProgressBoardProps) {
  const {
    getTotalProgress,
    getTestamentProgress,
    getCategoryProgress,
    getBookProgress,
    getResumeInfo,
    isBookComplete,
  } = useProgressStore();

  const totalProgress = getTotalProgress();
  const ntProgress = getTestamentProgress('NT');
  const otProgress = getTestamentProgress('OT');

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">책으로 일독</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        책을 선택하면 이어서읽기, 일독 진행 상황을 볼 수 있습니다
      </p>

      {/* 상단 진도 요약 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <SummaryBar label="전체" progress={totalProgress} />
        <SummaryBar label="신약" progress={ntProgress} />
        <SummaryBar label="구약" progress={otProgress} />
      </div>

      {/* OT/NT 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <TestamentCard
          testament="OT"
          label="구약"
          progress={otProgress}
          categories={OT_CATEGORIES}
          primaryCategory="pentateuch"
          onStartReading={onStartReading}
          getCategoryProgress={getCategoryProgress}
          getBookProgress={getBookProgress}
          getResumeInfo={getResumeInfo}
          isBookComplete={isBookComplete}
        />
        <TestamentCard
          testament="NT"
          label="신약"
          progress={ntProgress}
          categories={NT_CATEGORIES}
          primaryCategory="gospels"
          onStartReading={onStartReading}
          getCategoryProgress={getCategoryProgress}
          getBookProgress={getBookProgress}
          getResumeInfo={getResumeInfo}
          isBookComplete={isBookComplete}
        />
      </div>
    </section>
  );
}

// 상단 요약 진도 바
function SummaryBar({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="rounded-lg bg-slate-700 px-3 py-2 text-white">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-600">
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// 구약/신약 카드
interface TestamentCardProps {
  testament: 'OT' | 'NT';
  label: string;
  progress: number;
  categories: BibleCategory[];
  primaryCategory: string; // 기본 펼침 카테고리
  onStartReading: (bookId: string, chapter?: number) => void;
  getCategoryProgress: (categoryId: string) => number;
  getBookProgress: (bookId: string) => number;
  getResumeInfo: (bookId: string) => { chapter?: number; label: string };
  isBookComplete: (bookId: string) => boolean;
}

function TestamentCard({
  label,
  progress,
  categories,
  primaryCategory,
  onStartReading,
  getCategoryProgress,
  getBookProgress,
  getResumeInfo,
  isBookComplete,
}: TestamentCardProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(primaryCategory);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // 카테고리의 이어서읽기 대상 찾기
  const getResumableBook = (category: BibleCategory): string | undefined => {
    const books = getBooksByCategory(category.id);
    // 1. resume point가 있는 책 우선
    for (const book of books) {
      const resume = getResumeInfo(book.id);
      if (resume.chapter) return book.id;
    }
    // 2. 미완료 책
    for (const book of books) {
      if (!isBookComplete(book.id)) return book.id;
    }
    // 3. 모두 완료면 첫 책
    return books[0]?.id;
  };

  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3">
      {/* 카드 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{label}</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <button
          onClick={() => {
            const category = categories.find(c => c.id === primaryCategory);
            if (category) {
              const bookId = getResumableBook(category);
              if (bookId) onStartReading(bookId);
            }
          }}
          className="rounded-lg border border-slate-400 bg-white px-3 py-1 text-xs font-medium hover:bg-slate-50"
        >
          이어서읽기
        </button>
      </div>

      {/* 카테고리 목록 */}
      {categories.map((category) => {
        const categoryProgress = getCategoryProgress(category.id);
        const isExpanded = expandedCategory === category.id;
        const books = getBooksByCategory(category.id);

        return (
          <div key={category.id} className="mb-2">
            {/* 카테고리 헤더 */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex w-full items-center justify-between rounded-lg py-1.5 text-left hover:bg-slate-200/50"
            >
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={categoryProgress}
                  size="sm"
                  showLabel={false}
                  className="w-16"
                />
                <span className="min-w-[36px] text-right text-xs font-medium">
                  {categoryProgress}%
                </span>
                {categoryProgress === 100 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const bookId = books[0]?.id;
                      if (bookId) onStartReading(bookId, 1);
                    }}
                    className="rounded border border-amber-500 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    한번더읽기
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const bookId = getResumableBook(category);
                      if (bookId) onStartReading(bookId);
                    }}
                    className="rounded border border-slate-400 bg-white px-2 py-0.5 text-xs font-medium hover:bg-slate-50"
                  >
                    이어서읽기
                  </button>
                )}
              </div>
            </button>

            {/* 책 목록 (펼침) */}
            {isExpanded && (
              <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-300 pl-3">
                {books.map((book) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    progress={getBookProgress(book.id)}
                    resumeInfo={getResumeInfo(book.id)}
                    isComplete={isBookComplete(book.id)}
                    onStartReading={onStartReading}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 개별 책 행
interface BookRowProps {
  book: BibleBook;
  progress: number;
  resumeInfo: { chapter?: number; label: string };
  isComplete: boolean;
  onStartReading: (bookId: string, chapter?: number) => void;
}

function BookRow({ book, progress, resumeInfo, isComplete, onStartReading }: BookRowProps) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">├</span>
        <span className="text-sm">{book.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar
          value={progress}
          size="sm"
          showLabel={false}
          className="w-12"
        />
        <span className="min-w-[32px] text-right text-xs font-medium">{progress}%</span>
        {isComplete ? (
          <button
            onClick={() => onStartReading(book.id, 1)}
            className="rounded border border-amber-500 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            한번더읽기
          </button>
        ) : (
          <button
            onClick={() => onStartReading(book.id, resumeInfo.chapter)}
            className="rounded border border-slate-400 bg-white px-2 py-0.5 text-xs font-medium hover:bg-slate-50"
          >
            이어서읽기
          </button>
        )}
      </div>
    </div>
  );
}
