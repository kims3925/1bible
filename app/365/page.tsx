/**
 * 365 통독 페이지
 * 플랜 선택(365/180/90일) + 캘린더 뷰 + 오늘의 분량 + 밀린 분량 재분배
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ALL_BOOKS } from '@/lib/bible/catalog';
import { useProgressStore } from '@/stores';

type PlanDuration = 365 | 180 | 90;

interface DailyPortion {
  book: string;
  bookId: string;
  chapters: string;
  estimated: string;
}

// 전체 1189장을 플랜 기간에 따라 일별 분량 배분
function generateDailyPortions(planDays: PlanDuration): DailyPortion[][] {
  const totalChapters = 1189;
  const chaptersPerDay = Math.ceil(totalChapters / planDays);
  const portions: DailyPortion[][] = [];

  let bookIdx = 0;
  let chapterIdx = 1;

  for (let day = 0; day < planDays; day++) {
    const dayPortions: DailyPortion[] = [];
    let remaining = chaptersPerDay;

    while (remaining > 0 && bookIdx < ALL_BOOKS.length) {
      const book = ALL_BOOKS[bookIdx];
      const startChapter = chapterIdx;
      const available = book.chaptersCount - chapterIdx + 1;
      const take = Math.min(remaining, available);
      const endChapter = startChapter + take - 1;

      const minutesPer = 3; // 평균 3분/장
      dayPortions.push({
        book: book.name,
        bookId: book.id,
        chapters: startChapter === endChapter ? `${startChapter}장` : `${startChapter}-${endChapter}장`,
        estimated: `약 ${take * minutesPer}분`,
      });

      remaining -= take;
      chapterIdx = endChapter + 1;

      if (chapterIdx > book.chaptersCount) {
        bookIdx++;
        chapterIdx = 1;
      }
    }

    portions.push(dayPortions);
  }

  return portions;
}

export default function Bible365Page() {
  const router = useRouter();
  const { getTotalProgress } = useProgressStore();

  const [planDuration, setPlanDuration] = useState<PlanDuration>(365);
  const [startDate] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('plan-start-date') : null;
    return saved ? new Date(saved) : new Date();
  });
  const [viewMonth, setViewMonth] = useState(() => new Date());

  // 오늘이 플랜의 몇 일째인지
  const today = new Date();
  const daysSinceStart = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1);
  const currentDay = Math.min(daysSinceStart, planDuration);

  // 일별 분량 생성
  const dailyPortions = useMemo(() => generateDailyPortions(planDuration), [planDuration]);
  const todayPortions = dailyPortions[currentDay - 1] || [];

  // 완료된 날짜 (진도 기반 시뮬레이션)
  const totalProgress = getTotalProgress();

  // 달력 데이터
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 날짜별 완료 상태 계산
  const getDayStatus = (day: number): 'completed' | 'missed' | 'today' | 'future' => {
    const date = new Date(year, month, day);
    const dateDay = Math.floor((date.getTime() - startDate.getTime()) / 86400000) + 1;

    if (date.toDateString() === today.toDateString()) return 'today';
    if (date > today) return 'future';
    if (dateDay < 1 || dateDay > planDuration) return 'future';

    // 진도율 기반으로 완료 상태 시뮬레이션
    const expectedDay = dateDay;
    const completedDays = Math.floor((totalProgress / 100) * planDuration);
    return expectedDay <= completedDays ? 'completed' : 'missed';
  };

  const handleStartToday = (_mode: 'listen' | 'read' | 'recite' = 'listen') => {
    if (todayPortions.length > 0) {
      const first = todayPortions[0];
      router.push(`/session?book=${first.bookId}&chapter=1&minutes=15`);
    }
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  // 밀린 분량 계산
  const expectedProgress = Math.round((currentDay / planDuration) * 100);
  const behindDays = Math.max(0, Math.round(((expectedProgress - totalProgress) / 100) * planDuration));

  return (
    <div className="page-container">
      <h1 className="mb-2 text-center text-2xl font-bold">365 통독</h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        성경 전체를 체계적으로 읽는 플랜
      </p>

      {/* 플랜 선택 */}
      <div className="mb-4 flex gap-2">
        {([365, 180, 90] as PlanDuration[]).map((d) => (
          <button
            key={d}
            onClick={() => setPlanDuration(d)}
            className={cn(
              'flex-1 rounded-xl border py-3 text-sm font-semibold transition-all',
              planDuration === d
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted'
            )}
          >
            {d}일
          </button>
        ))}
      </div>

      {/* 진행률 카드 */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold">진행 현황</span>
          <span className="text-sm text-muted-foreground">
            Day {currentDay} / {planDuration}일
          </span>
        </div>
        <ProgressBar value={totalProgress} className="mb-3" />
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-muted p-2">
            <div className="font-bold text-primary">{totalProgress}%</div>
            <div className="text-xs text-muted-foreground">실제 진도</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className="font-bold text-blue-600">{expectedProgress}%</div>
            <div className="text-xs text-muted-foreground">예상 진도</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className={cn('font-bold', behindDays > 0 ? 'text-red-500' : 'text-green-500')}>
              {behindDays > 0 ? `${behindDays}일` : '정상'}
            </div>
            <div className="text-xs text-muted-foreground">
              {behindDays > 0 ? '밀린 분량' : '진도 상태'}
            </div>
          </div>
        </div>
      </Card>

      {/* 밀린 분량 알림 */}
      {behindDays > 0 && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">&#9888;</span>
            <span className="font-semibold text-amber-800">밀린 분량 안내</span>
          </div>
          <p className="mb-3 text-sm text-amber-700">
            {behindDays}일분의 분량이 밀려있습니다. 남은 기간에 자동으로 재분배할 수 있습니다.
          </p>
          <Button size="sm" variant="outline" className="border-amber-400 text-amber-700">
            밀린 분량 재분배
          </Button>
        </div>
      )}

      {/* 오늘 분량 */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              {today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            <div className="text-lg font-bold">Day {currentDay} 오늘의 분량</div>
          </div>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            진행 중
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {todayPortions.map((portion, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <div className="font-medium">
                  {portion.book} {portion.chapters}
                </div>
                <div className="text-xs text-muted-foreground">{portion.estimated}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/session?book=${portion.bookId}&chapter=1&minutes=15`)}
              >
                읽기
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => handleStartToday('listen')}>
            듣기
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleStartToday('read')}>
            읽기
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleStartToday('recite')}>
            낭독
          </Button>
        </div>
      </Card>

      {/* 달력 */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-semibold">
            {year}년 {month + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="py-1 font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);

            return (
              <div
                key={day}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-full text-sm transition-all',
                  status === 'today' && 'ring-2 ring-primary font-bold',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'missed' && 'bg-red-100 text-red-500',
                  status === 'future' && 'text-muted-foreground'
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-100" />
            <span>미완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full ring-2 ring-primary" />
            <span>오늘</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
