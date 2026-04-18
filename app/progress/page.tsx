/**
 * 일독 진도 페이지
 * 전체/구약/신약 상세 진도 + 스트릭 + 히트맵 + 통계 대시보드
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore, useSessionStore } from '@/stores';
import {
  OT_CATEGORIES,
  NT_CATEGORIES,
  getBooksByCategory,
  ALL_BOOKS,
} from '@/lib/bible/catalog';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
  const router = useRouter();
  const {
    getTotalProgress,
    getTestamentProgress,
    getCategoryProgress,
    getBookProgress,
    getResumeInfo,
    isBookComplete,
  } = useProgressStore();
  const { sessionLogs, getTotalMinutesRead } = useSessionStore();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'ot' | 'nt'>('overview');

  const totalProgress = getTotalProgress();
  const otProgress = getTestamentProgress('OT');
  const ntProgress = getTestamentProgress('NT');
  const totalMinutes = getTotalMinutesRead();

  // 스트릭 계산
  const streak = useMemo(() => {
    if (sessionLogs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 날짜별 세션이 있는지 확인
    const sessionDates = new Set<string>();
    sessionLogs.forEach((log) => {
      const date = new Date(log.startedAt);
      sessionDates.add(date.toDateString());
    });

    let count = 0;
    const checkDate = new Date(today);

    // 오늘부터 거꾸로 연속 확인
    while (sessionDates.has(checkDate.toDateString())) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return count;
  }, [sessionLogs]);

  // 완료된 책 수
  const completedBooks = ALL_BOOKS.filter((book) => isBookComplete(book.id)).length;

  // 히트맵 데이터 (최근 12주)
  const heatmapData = useMemo(() => {
    const weeks: { date: Date; count: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 세션 날짜별 카운트
    const dateCounts: Record<string, number> = {};
    sessionLogs.forEach((log) => {
      const date = new Date(log.startedAt);
      const key = date.toDateString();
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    });

    // 12주 전부터
    const start = new Date(today);
    start.setDate(start.getDate() - 83); // 12주 = 84일
    start.setDate(start.getDate() - start.getDay()); // 주 시작(일요일)으로

    for (let w = 0; w < 12; w++) {
      const week: { date: Date; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(date.getDate() + w * 7 + d);
        const count = dateCounts[date.toDateString()] || 0;
        week.push({ date, count });
      }
      weeks.push(week);
    }

    return weeks;
  }, [sessionLogs]);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleStartReading = (bookId: string) => {
    const resume = getResumeInfo(bookId);
    router.push(`/session?book=${bookId}&chapter=${resume.chapter || 1}&minutes=15`);
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">일독 진도</h1>

      {/* 통계 대시보드 */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalProgress}%</div>
          <div className="text-[10px] text-muted-foreground">전체 진도</div>
        </div>
        <div className="rounded-xl bg-orange-100 p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-[10px] text-muted-foreground">연속 일수</div>
        </div>
        <div className="rounded-xl bg-green-100 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{completedBooks}</div>
          <div className="text-[10px] text-muted-foreground">완독한 책</div>
        </div>
        <div className="rounded-xl bg-purple-100 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h` : `${totalMinutes}m`}
          </div>
          <div className="text-[10px] text-muted-foreground">총 시간</div>
        </div>
      </div>

      {/* 스트릭 카운터 */}
      {streak > 0 && (
        <Card className="mb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-2xl font-bold text-white shadow-lg">
              {streak}
            </div>
            <div>
              <div className="text-lg font-bold">
                {streak}일 연속 읽기 중!
              </div>
              <div className="text-sm text-muted-foreground">
                {streak >= 21 ? '습관이 형성되었습니다!' :
                 streak >= 7 ? '일주일 돌파! 계속 가세요!' :
                 '매일 읽기를 이어가세요!'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 히트맵 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">읽기 히트맵</h2>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {heatmapData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-all',
                    day.date > new Date() ? 'bg-transparent' : getHeatColor(day.count)
                  )}
                  title={`${day.date.toLocaleDateString('ko-KR')}: ${day.count}회`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>적음</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-slate-100" />
          <div className="h-2.5 w-2.5 rounded-sm bg-green-200" />
          <div className="h-2.5 w-2.5 rounded-sm bg-green-400" />
          <div className="h-2.5 w-2.5 rounded-sm bg-green-600" />
          <span>많음</span>
        </div>
      </Card>

      {/* 탭 선택 */}
      <div className="mb-4 flex rounded-xl bg-muted p-1">
        {([
          { key: 'overview', label: '전체' },
          { key: 'ot', label: '구약' },
          { key: 'nt', label: '신약' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewTab(key)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
              viewTab === key
                ? 'bg-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 전체 진도 뷰 */}
      {viewTab === 'overview' && (
        <Card>
          <div className="mb-6 text-center">
            {/* 원형 진도 */}
            <div className="relative mx-auto mb-4 h-40 w-40">
              <svg className="h-40 w-40 -rotate-90 transform">
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100" />
                <circle
                  cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * totalProgress) / 100}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary">{totalProgress}%</div>
                <div className="text-xs text-muted-foreground">전체</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">구약 (39권)</span>
                <span className="text-muted-foreground">{otProgress}%</span>
              </div>
              <ProgressBar value={otProgress} showLabel={false} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">신약 (27권)</span>
                <span className="text-muted-foreground">{ntProgress}%</span>
              </div>
              <ProgressBar value={ntProgress} showLabel={false} />
            </div>
          </div>
        </Card>
      )}

      {/* 구약/신약 상세 */}
      {(viewTab === 'ot' || viewTab === 'nt') && (
        <Card>
          <h2 className="mb-3 font-semibold">
            {viewTab === 'ot' ? `구약 (${otProgress}%)` : `신약 (${ntProgress}%)`}
          </h2>

          <div className="space-y-2">
            {(viewTab === 'ot' ? OT_CATEGORIES : NT_CATEGORIES).map((category) => {
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
                        {isExpanded ? '&#9660;' : '&#9654;'}
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
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
                      {books.map((book) => {
                        const bookProgress = getBookProgress(book.id);
                        const complete = isBookComplete(book.id);
                        return (
                          <div
                            key={book.id}
                            className="flex items-center justify-between py-1.5 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {complete && <span className="text-green-500">&#10003;</span>}
                              <span className={complete ? 'text-green-700' : ''}>{book.name}</span>
                              <span className="text-xs text-muted-foreground">({book.chaptersCount}장)</span>
                            </div>
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
                              <button
                                onClick={() => handleStartReading(book.id)}
                                className={cn(
                                  'rounded border px-2 py-0.5 text-xs font-medium',
                                  complete
                                    ? 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'border-slate-400 bg-white hover:bg-slate-50'
                                )}
                              >
                                {complete ? '한번더' : '읽기'}
                              </button>
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
      )}
    </div>
  );
}
