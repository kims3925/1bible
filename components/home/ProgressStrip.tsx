/**
 * H07: ProgressStrip — 간결한 진도 요약
 * 전체 / 신약 진도바 2줄만 표시
 * 상세는 /progress 전용 페이지로 분리
 *
 * 표시 규칙:
 *   0%       → "아직 시작하지 않았어요" (숫자 숨김)
 *   <10%     → "창세기 5장까지 읽음" 식 서술형
 *   >=10%    → "32% · 367/1189장" 수치형
 */

'use client';

import { useRouter } from 'next/navigation';

interface ProgressStripProps {
  overall: number;       // 0.32
  newTestament: number;  // 0.47
  readChapterCount?: number;
  lastBookChapter?: string; // "창세기 5장"
  onExpandClick?: () => void;
}

export function ProgressStrip({
  overall,
  newTestament,
  readChapterCount = 0,
  lastBookChapter,
  onExpandClick,
}: ProgressStripProps) {
  const router = useRouter();
  const totalChapters = 1189;

  const handleExpand = () => {
    if (onExpandClick) {
      onExpandClick();
    } else {
      router.push('/progress');
    }
  };

  // 0% 상태
  if (overall === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">📊 내 진도</h3>
          <button
            onClick={handleExpand}
            className="text-xs font-medium text-blue-600 hover:text-blue-500"
          >
            상세 &rarr;
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-gray-500">
          아직 시작하지 않았어요 · 오늘부터 시작해보세요!
        </p>
      </div>
    );
  }

  const overallPct = Math.round(overall * 100);
  const ntPct = Math.round(newTestament * 100);

  const getOverallLabel = () => {
    if (overall < 0.1 && lastBookChapter) {
      return lastBookChapter + '까지 읽음';
    }
    return `${overallPct}% · ${readChapterCount}/${totalChapters}장`;
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">📊 내 진도</h3>
        <button
          onClick={handleExpand}
          className="text-xs font-medium text-blue-600 hover:text-blue-500"
        >
          상세 &rarr;
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {/* 전체 진도 */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">전체</span>
            <span className="text-gray-500">{getOverallLabel()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
              role="progressbar"
              aria-valuenow={overallPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`전체 진도 ${overallPct}%`}
            />
          </div>
        </div>

        {/* 신약 진도 */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">신약</span>
            <span className="text-gray-500">{ntPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${ntPct}%` }}
              role="progressbar"
              aria-valuenow={ntPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`신약 진도 ${ntPct}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
