/**
 * 일독 진도 페이지
 * 전체/구약/신약 상세 진도
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/stores';
import {
  OT_CATEGORIES,
  NT_CATEGORIES,
  getBooksByCategory,
} from '@/lib/bible/catalog';

export default function ProgressPage() {
  const {
    getTotalProgress,
    getTestamentProgress,
    getCategoryProgress,
    getBookProgress,
  } = useProgressStore();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const totalProgress = getTotalProgress();
  const otProgress = getTestamentProgress('OT');
  const ntProgress = getTestamentProgress('NT');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">일독 진도</h1>

      {/* 전체 진도 */}
      <Card className="mb-4">
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold text-primary">{totalProgress}%</div>
          <div className="text-sm text-muted-foreground">전체 진행률</div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>구약</span>
              <span>{otProgress}%</span>
            </div>
            <ProgressBar value={otProgress} showLabel={false} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>신약</span>
              <span>{ntProgress}%</span>
            </div>
            <ProgressBar value={ntProgress} showLabel={false} />
          </div>
        </div>
      </Card>

      {/* 구약 상세 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">구약 ({otProgress}%)</h2>

        <div className="space-y-2">
          {OT_CATEGORIES.map((category) => {
            const progress = getCategoryProgress(category.id);
            const isExpanded = expandedCategory === category.id;
            const books = getBooksByCategory(category.id);

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between rounded-lg bg-muted p-3 text-left hover:bg-muted/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={progress}
                      size="sm"
                      showLabel={false}
                      className="w-20"
                    />
                    <span className="min-w-[36px] text-right text-sm font-medium">
                      {progress}%
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 pl-3">
                    {books.map((book) => {
                      const bookProgress = getBookProgress(book.id);
                      return (
                        <div
                          key={book.id}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span>{book.name}</span>
                          <div className="flex items-center gap-2">
                            <ProgressBar
                              value={bookProgress}
                              size="sm"
                              showLabel={false}
                              className="w-16"
                            />
                            <span className="min-w-[28px] text-right text-xs">
                              {bookProgress}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 신약 상세 */}
      <Card>
        <h2 className="mb-3 font-semibold">신약 ({ntProgress}%)</h2>

        <div className="space-y-2">
          {NT_CATEGORIES.map((category) => {
            const progress = getCategoryProgress(category.id);
            const isExpanded = expandedCategory === category.id;
            const books = getBooksByCategory(category.id);

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between rounded-lg bg-muted p-3 text-left hover:bg-muted/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={progress}
                      size="sm"
                      showLabel={false}
                      className="w-20"
                    />
                    <span className="min-w-[36px] text-right text-sm font-medium">
                      {progress}%
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 pl-3">
                    {books.map((book) => {
                      const bookProgress = getBookProgress(book.id);
                      return (
                        <div
                          key={book.id}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span>{book.name}</span>
                          <div className="flex items-center gap-2">
                            <ProgressBar
                              value={bookProgress}
                              size="sm"
                              showLabel={false}
                              className="w-16"
                            />
                            <span className="min-w-[28px] text-right text-xs">
                              {bookProgress}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
