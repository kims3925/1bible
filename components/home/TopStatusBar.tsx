/**
 * H01: TopStatusBar — 홈 상단 56px 고정 띠
 * 스트릭 / 포인트 / 공유 버튼
 * 3가지 상태: 읽기 전(idle) / 읽기 후(completed) / 위기(atRisk)
 */

'use client';

import { useState, useEffect } from 'react';

interface TopStatusBarProps {
  streakDays: number;
  isCompletedToday: boolean;
  points: number;
  pointsDelta?: number;
  streakAtRisk?: boolean;
  onShareClick: () => void;
  onPointsClick?: () => void;
  onStreakClick?: () => void;
}

export function TopStatusBar({
  streakDays,
  isCompletedToday,
  points,
  pointsDelta,
  streakAtRisk = false,
  onShareClick,
  onPointsClick,
  onStreakClick,
}: TopStatusBarProps) {
  const [showDelta, setShowDelta] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);

  useEffect(() => {
    if (pointsDelta && pointsDelta > 0) {
      setShowDelta(true);
      const timer = setTimeout(() => setShowDelta(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pointsDelta]);

  useEffect(() => {
    if (isCompletedToday) {
      setAnimateStreak(true);
      const timer = setTimeout(() => setAnimateStreak(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isCompletedToday]);

  // 상태에 따른 스트릭 색상
  const streakColor = isCompletedToday
    ? 'text-orange-500'
    : streakAtRisk
      ? 'text-red-500'
      : 'text-gray-400';

  const streakIcon = isCompletedToday ? '🔥' : streakAtRisk ? '⚠️' : '🔥';

  const streakText = isCompletedToday
    ? `${streakDays}일 연속!`
    : streakAtRisk
      ? '오늘 읽으면 유지!'
      : `${streakDays}일 연속`;

  return (
    <div
      role="banner"
      className="flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4"
    >
      {/* 스트릭 */}
      <button
        onClick={onStreakClick}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
        aria-label={`${streakDays}일 연속 읽기 중`}
      >
        <span
          className={`text-lg transition-transform ${animateStreak ? 'scale-115' : ''}`}
          style={{
            filter: isCompletedToday ? 'none' : streakAtRisk ? 'none' : 'grayscale(1)',
          }}
        >
          {streakIcon}
        </span>
        <span className={`text-sm font-semibold ${streakColor}`}>
          {streakText}
        </span>
        {isCompletedToday && (
          <span className="text-xs text-green-500">✅</span>
        )}
      </button>

      {/* 포인트 */}
      <button
        onClick={onPointsClick}
        className="relative flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
        aria-label={`보유 포인트 ${points.toLocaleString()}`}
      >
        <span className="text-lg">💎</span>
        <span className="text-sm font-semibold text-blue-600">
          {points.toLocaleString()}P
        </span>
        {/* 포인트 증가 애니메이션 */}
        {showDelta && pointsDelta && (
          <span
            aria-live="polite"
            className="absolute -top-3 right-0 text-xs font-bold text-green-500 animate-bounce"
          >
            +{pointsDelta}
          </span>
        )}
      </button>

      {/* 공유 */}
      <button
        onClick={onShareClick}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        aria-label="공유하기"
      >
        <span className="text-lg">📤</span>
        <span className="hidden text-sm sm:inline">공유</span>
      </button>
    </div>
  );
}
