/**
 * v6.0 읽기 선행 구조 — 잠금/해금 UI
 * 오늘 읽기 미완료 시 부드러운 안내 팝업 표시
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePointStore } from '@/stores';

interface ReadingLockProps {
  children: React.ReactNode;
  featureName?: string;
}

export function ReadingLock({ children, featureName = '이 기능' }: ReadingLockProps) {
  const router = useRouter();
  const { isFeatureUnlocked } = usePointStore();
  const [showPopup, setShowPopup] = useState(false);

  const unlocked = isFeatureUnlocked();

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* 잠금 오버레이 */}
      <div
        className="relative cursor-pointer"
        onClick={() => setShowPopup(true)}
      >
        <div className="pointer-events-none opacity-40 blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white/90 px-6 py-4 text-center shadow-lg backdrop-blur">
            <div className="mb-1 text-2xl">🔒</div>
            <p className="text-sm font-medium text-slate-700">읽기 완료 후 해금</p>
          </div>
        </div>
      </div>

      {/* 안내 팝업 */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-4xl">📖</div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">
              오늘 5분만 읽으면 열려요!
            </h3>
            <p className="mb-5 text-sm text-slate-500">
              {featureName}은(는) 오늘 성경 읽기를 완료하면
              <br />사용할 수 있습니다
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowPopup(false);
                  router.push('/plan');
                }}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400 active:scale-[0.98]"
              >
                바로 읽으러 가기
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-600"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
