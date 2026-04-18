/**
 * H03: QuickTimeSelector — 빠른 시간 선택
 * 5/10/30분 버튼 3개 + "다르게" 바텀시트
 * 기존 9개 선택지 → 3+1로 축소 (Hick's Law)
 */

'use client';

import { useState } from 'react';

interface QuickTimeSelectorProps {
  quickOptions?: number[];
  onQuickSelect: (minutes: number) => void;
  onMoreClick?: () => void;
}

interface MoreOption {
  icon: string;
  label: string;
  value: string;
}

const TIME_OPTIONS: MoreOption[] = [
  { icon: '⏱', label: '1시간', value: '60' },
  { icon: '⏱', label: '2시간', value: '120' },
  { icon: '✏️', label: '직접 입력', value: 'custom' },
];

const MODE_OPTIONS: MoreOption[] = [
  { icon: '🚗', label: '차에서 듣기', value: 'driving' },
  { icon: '📅', label: '365일 일독 플랜', value: 'yearly' },
  { icon: '🌐', label: '영어로 읽기', value: 'english' },
  { icon: '🌏', label: '영어·한국어 번갈아', value: 'bilingual' },
];

export function QuickTimeSelector({
  quickOptions = [5, 10, 30],
  onQuickSelect,
  onMoreClick,
}: QuickTimeSelectorProps) {
  const [showMore, setShowMore] = useState(false);

  const handleMoreOption = (option: MoreOption) => {
    setShowMore(false);
    if (option.value === 'custom') {
      onMoreClick?.();
    } else if (!isNaN(Number(option.value))) {
      onQuickSelect(Number(option.value));
    } else {
      onMoreClick?.();
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-gray-500">
        &#x25BC; 시간이 더 있으세요?
      </p>

      <div className="flex gap-2">
        {quickOptions.map((minutes) => (
          <button
            key={minutes}
            onClick={() => onQuickSelect(minutes)}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-[0.97]"
          >
            {minutes}분
          </button>
        ))}
        <button
          onClick={() => setShowMore(true)}
          className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-sm font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          다르게 &#x25BE;
        </button>
      </div>

      {/* 바텀시트 */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-6 pb-8 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">읽기 방식 선택</h3>
              <button
                onClick={() => setShowMore(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                &#x2715;
              </button>
            </div>

            {/* 시간으로 */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-gray-500">⏱ 시간으로</p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleMoreOption(opt)}
                    className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50"
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 모드 */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-gray-500">🎭 모드</p>
              <div className="grid grid-cols-2 gap-2">
                {MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleMoreOption(opt)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50"
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 책으로 */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-500">📚 책으로</p>
              <button
                onClick={() => {
                  setShowMore(false);
                  onMoreClick?.();
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50"
              >
                📚 전체 목록 보기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
