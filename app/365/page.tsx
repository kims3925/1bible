/**
 * 365 통독 페이지
 * 일년 일독 플랜 + 오늘 분량 + 달력
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

// 오늘 분량 더미 데이터
const todayPortion = {
  date: new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }),
  dayNumber: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000),
  passages: [
    { book: '창세기', chapters: '1-3장', estimated: '약 12분' },
    { book: '마태복음', chapters: '1장', estimated: '약 5분' },
  ],
};

export default function Bible365Page() {
  const router = useRouter();
  const [todayDone, setTodayDone] = useState(false);

  // 이번 달 달력 데이터
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 완료된 날짜 (더미)
  const completedDays = [1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 15];

  const handleStartToday = () => {
    router.push('/session?minutes=15');
  };

  const handleMarkComplete = () => {
    setTodayDone(true);
  };

  return (
    <div className="page-container">
      <h1 className="mb-2 text-center text-2xl font-bold">365 통독</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        1년 동안 성경 전체를 읽는 플랜입니다
      </p>

      {/* 진행률 */}
      <Card className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium">올해 진행률</span>
          <span className="text-sm text-muted-foreground">
            {todayPortion.dayNumber}일 / 365일
          </span>
        </div>
        <ProgressBar value={Math.round((todayPortion.dayNumber / 365) * 100)} />
      </Card>

      {/* 오늘 분량 */}
      <Card className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{todayPortion.date}</div>
            <div className="text-lg font-bold">Day {todayPortion.dayNumber}</div>
          </div>
          {todayDone ? (
            <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              완료
            </div>
          ) : (
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              진행 중
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2">
          {todayPortion.passages.map((passage, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <div className="font-medium">
                  {passage.book} {passage.chapters}
                </div>
                <div className="text-xs text-muted-foreground">{passage.estimated}</div>
              </div>
              <Button size="sm" variant="outline" onClick={handleStartToday}>
                읽기
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleStartToday}>
            듣기
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleStartToday}>
            읽기
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleStartToday}>
            낭독
          </Button>
        </div>

        {!todayDone && (
          <Button fullWidth className="mt-3" onClick={handleMarkComplete}>
            오늘 분량 완료 체크
          </Button>
        )}
      </Card>

      {/* 달력 */}
      <Card>
        <h2 className="mb-3 text-center font-semibold">
          {year}년 {month + 1}월
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="py-1 font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* 빈 셀 */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* 날짜 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate();
            const isCompleted = completedDays.includes(day);
            const isPast = day < today.getDate();

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-full text-sm',
                  isToday && 'ring-2 ring-primary',
                  isCompleted && 'bg-green-500 text-white',
                  !isCompleted && isPast && 'bg-red-100 text-red-500',
                  !isCompleted && !isPast && !isToday && 'text-muted-foreground'
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
        </div>
      </Card>
    </div>
  );
}
