/**
 * H04: LockedFeatureGrid — 읽기 선행 구조 시각화
 * "읽어야 열린다" — 4개 기능 잠금/해금 그리드
 * 잠금 탭 시 부드러운 토스트: "5분만 읽으면 열려요!"
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LockedFeature {
  id: 'meditation' | 'game' | 'assessment' | 'shop';
  icon: string;
  label: string;
  subLabel: string;
  badge?: 'NEW' | 'HOT' | null;
  href: string;
}

interface LockedFeatureGridProps {
  isUnlocked: boolean;
  features?: LockedFeature[];
  points?: number;
}

const DEFAULT_FEATURES: LockedFeature[] = [
  { id: 'meditation', icon: '🙏', label: '묵상', subLabel: '+15P', badge: 'NEW', href: '/meditation/new' },
  { id: 'game', icon: '🎮', label: '퀴즈', subLabel: '3문제', badge: null, href: '/games' },
  { id: 'assessment', icon: '🧪', label: '검사', subLabel: '12종', badge: null, href: '/trial/mbti' },
  { id: 'shop', icon: '🎁', label: '상점', subLabel: '', href: '/shop' },
];

export function LockedFeatureGrid({
  isUnlocked,
  features = DEFAULT_FEATURES,
  points,
}: LockedFeatureGridProps) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const handleCardClick = (feature: LockedFeature) => {
    if (isUnlocked) {
      router.push(feature.href);
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // 상점 subLabel에 현재 포인트 표시
  const getSubLabel = (feature: LockedFeature) => {
    if (feature.id === 'shop' && points !== undefined) {
      return `${points.toLocaleString()}P`;
    }
    return feature.subLabel;
  };

  return (
    <div className="relative mt-6">
      {/* 제목 */}
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        {isUnlocked ? '🔓 오늘의 보너스 활동' : '🔒 오늘 읽기를 마치면 열려요'}
      </h3>

      {/* 4개 그리드 */}
      <div
        className={`grid grid-cols-4 gap-2 transition-all duration-300 ${
          isUnlocked ? '' : 'opacity-60 grayscale'
        }`}
      >
        {features.map((feature, idx) => (
          <button
            key={feature.id}
            onClick={() => handleCardClick(feature)}
            aria-disabled={!isUnlocked}
            className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
              isUnlocked
                ? 'border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md active:scale-[0.97]'
                : 'border-slate-100 bg-slate-50'
            }`}
            style={{
              transitionDelay: isUnlocked ? `${idx * 100}ms` : '0ms',
            }}
          >
            {/* 아이콘 */}
            <span className="text-2xl">{feature.icon}</span>

            {/* 라벨 */}
            <span className="text-xs font-semibold text-gray-700">{feature.label}</span>

            {/* 서브 라벨 */}
            <span className="text-[10px] text-gray-500">{getSubLabel(feature)}</span>

            {/* 잠금 아이콘 */}
            {!isUnlocked && (
              <span className="absolute bottom-1 right-1 text-[10px]">🔒</span>
            )}

            {/* 뱃지 */}
            {isUnlocked && feature.badge && (
              <span
                className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white ${
                  feature.badge === 'NEW' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {feature.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 잠금 탭 토스트 */}
      {showToast && (
        <div
          className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
          role="alert"
        >
          <span className="text-sm text-amber-800">
            🔒 오늘 5분만 읽으면 열려요!
          </span>
          <button
            onClick={() => router.push('/session')}
            className="ml-3 whitespace-nowrap rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-400"
          >
            바로 읽기 &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
