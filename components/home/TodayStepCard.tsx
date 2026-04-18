/**
 * H02: TodayStepCard — "오늘의 한 걸음" CTA 카드
 * 홈의 심장 — Hick's Law 적용, 선택지 1개로 수렴
 *
 * 3가지 상태:
 *   before — 오늘 읽기 전: "바로 듣기 시작"
 *   during — 읽기 중: 진행바 + "이어서 듣기"
 *   after  — 완료: "+10P 적립" + 묵상 유도
 */

'use client';

import { useRouter } from 'next/navigation';

type TodayStepState = 'before' | 'during' | 'after';

interface TodayPlan {
  bookId: string;
  bookName: string;
  chapterRange: string;
  estimatedMinutes: number;
}

interface TodayStepCardProps {
  state: TodayStepState;
  plan: TodayPlan;
  progress?: number;
  pointsReward: number;
  streakDays?: number;
  onStart: () => void;
  onContinue?: () => void;
  onStartMeditation?: () => void;
}

export function TodayStepCard({
  state,
  plan,
  progress = 0,
  pointsReward,
  streakDays,
  onStart,
  onContinue,
  onStartMeditation,
}: TodayStepCardProps) {
  const router = useRouter();

  const remainingMinutes = Math.max(1, Math.ceil(plan.estimatedMinutes * (1 - progress)));

  if (state === 'after') {
    return (
      <div
        role="region"
        aria-label="오늘의 한 걸음"
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg"
      >
        <div className="mb-3 text-center">
          <span className="text-3xl">✅</span>
          <h2 className="mt-2 text-lg font-bold text-gray-900">
            오늘 {plan.bookName} {plan.chapterRange} 읽기 완료!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            +{pointsReward}P 적립
            {streakDays ? ` · 🔥 ${streakDays}일 연속!` : ''}
          </p>
        </div>

        {/* 묵상 유도 */}
        <div className="mt-4 rounded-xl bg-white/60 p-4 text-center">
          <p className="text-sm text-gray-700">
            🙏 오늘의 묵상을 남겨보세요 <span className="text-green-600">(+15P)</span>
          </p>
          <button
            onClick={onStartMeditation || (() => router.push('/meditation/new'))}
            className="mt-3 w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-400 active:scale-[0.98]"
          >
            태그 선택만 하면 끝
          </button>
        </div>

        {/* 추가 읽기 */}
        <button
          onClick={onStart}
          className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600"
        >
          오늘 하나 더 읽기 &rarr;
        </button>
      </div>
    );
  }

  if (state === 'during') {
    return (
      <div
        role="region"
        aria-label="오늘의 한 걸음"
        className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">📖</span>
          <span className="text-sm font-medium text-gray-500">읽는 중</span>
        </div>

        <h2 className="text-lg font-bold text-gray-900">
          {plan.bookName} {plan.chapterRange}
        </h2>

        {/* 진행바 */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round(progress * 100)}% 진행</span>
            <span>약 {remainingMinutes}분 남음</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <button
          onClick={onContinue || onStart}
          className="mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
        >
          ▶ 이어서 듣기
        </button>
      </div>
    );
  }

  // state === 'before'
  return (
    <div
      role="region"
      aria-label="오늘의 한 걸음"
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg shadow-blue-500/10"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">📖</span>
        <span className="text-sm font-medium text-blue-600">오늘의 한 걸음</span>
      </div>

      <h2 className="text-lg font-bold text-gray-900">
        {plan.bookName} {plan.chapterRange}
        <span className="ml-2 text-sm font-normal text-gray-500">
          · 약 {plan.estimatedMinutes}분
        </span>
      </h2>

      <button
        onClick={onStart}
        className="mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
      >
        ▶ 바로 듣기 시작
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        ⚡ 오늘 끝내면 <span className="font-semibold text-blue-600">+{pointsReward}P</span>
        {' · '}
        <span className="text-amber-600">🔓 모든 기능 해금</span>
      </p>
    </div>
  );
}
