/**
 * H06: SocialFeedStrip — 함께 읽는 사람들 피드
 * 읽기 완료 후에만 노출 (읽기 선행 구조)
 * 1클릭 응원 + Empty State에서 그룹 생성 유도
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FeedActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'reading_complete' | 'streak_milestone' | 'new_meditation' | 'badge_earned';
  message: string;
  createdAt: string;
  alreadyEncouraged?: boolean;
}

interface SocialFeedStripProps {
  activities: FeedActivity[];
  maxItems?: number;
  isVisible: boolean; // hasCompletedToday
  onEncourage: (activity: FeedActivity) => Promise<void>;
  onViewAll?: () => void;
}

export function SocialFeedStrip({
  activities,
  maxItems = 3,
  isVisible,
  onEncourage,
  onViewAll,
}: SocialFeedStripProps) {
  const router = useRouter();
  const [encouragedIds, setEncouragedIds] = useState<Set<string>>(new Set());

  if (!isVisible) return null;

  const displayItems = activities.slice(0, maxItems);

  const handleEncourage = async (activity: FeedActivity) => {
    if (encouragedIds.has(activity.id)) return;
    setEncouragedIds((prev) => new Set([...prev, activity.id]));
    try {
      await onEncourage(activity);
    } catch {
      // 실패해도 UI 변경 유지 (optimistic)
    }
  };

  const getActionButton = (activity: FeedActivity) => {
    if (activity.type === 'new_meditation') {
      return (
        <button
          onClick={() => router.push(`/meditation/${activity.id}`)}
          className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
        >
          💬 보기
        </button>
      );
    }

    const isEncouraged = encouragedIds.has(activity.id) || activity.alreadyEncouraged;
    return (
      <button
        onClick={() => handleEncourage(activity)}
        disabled={isEncouraged}
        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          isEncouraged
            ? 'bg-green-50 text-green-600'
            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
        }`}
        aria-label={`${activity.userName}님에게 응원 보내기`}
      >
        {isEncouraged ? '✅ 응원함' : '👏 응원'}
      </button>
    );
  };

  // Empty State
  if (activities.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-gray-600">
          👥 아직 함께하는 사람이 없어요
        </p>
        <p className="mt-1 text-xs text-gray-500">
          부부, 소그룹, 교회와 함께 읽어보세요
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => router.push('/together')}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
          >
            + 그룹 만들기
          </button>
          <button
            onClick={() => router.push('/together')}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            초대 링크 받기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">👥 함께 읽는 사람들</h3>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {displayItems.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between px-4 py-3"
            role="listitem"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                {activity.userAvatar || '👤'}
              </span>
              <p className="truncate text-sm text-gray-700">{activity.message}</p>
            </div>
            {getActionButton(activity)}
          </div>
        ))}

        {/* 더 보기 */}
        {activities.length > maxItems && (
          <button
            onClick={onViewAll || (() => router.push('/together'))}
            className="w-full py-3 text-center text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            더 보기 &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
