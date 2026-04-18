/**
 * 은사 체크리스트 게스트 체험 페이지
 * 비로그인 접근 가능 — 14문항 → 상위 3가지 은사 결과
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentStepper } from '@/components/trial/AssessmentStepper';
import { ResultCard } from '@/components/trial/ResultCard';
import {
  GIFTS_QUESTIONS,
  GIFT_INFO,
  calculateGifts,
  getOrCreateGuestId,
  saveTrialAssessment,
} from '@/lib/trial';

function GiftsContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [result, setResult] = useState<{ top3: string[]; scores: Record<string, number> } | null>(null);

  const handleComplete = async (finalAnswers: Record<number, number>) => {
    const giftsResult = calculateGifts(finalAnswers);
    setResult(giftsResult);

    try {
      const guestId = getOrCreateGuestId();
      await saveTrialAssessment(guestId, 'gifts', finalAnswers, {
        top3: giftsResult.top3,
        scores: giftsResult.scores,
      });
    } catch {
      // 결과는 보여줌
    }
  };

  if (result) {
    const topGift = GIFT_INFO[result.top3[0]];
    const maxScore = Math.max(...Object.values(result.scores));

    return (
      <ResultCard
        assessmentType="은사 체크리스트"
        title={`${topGift.icon} ${topGift.korName}`}
        subtitle="당신의 1순위 영적 은사"
        icon="🕊️"
        description={topGift.description}
        verse={topGift.verse}
        verseRef={topGift.verseRef}
      >
        {/* 상위 3개 은사 */}
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold text-slate-500">나의 상위 3가지 은사</p>
          <div className="space-y-2">
            {result.top3.map((giftKey, idx) => {
              const gift = GIFT_INFO[giftKey];
              return (
                <div key={giftKey} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {idx + 1}
                  </span>
                  <span className="text-lg">{gift.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{gift.korName}</p>
                    <p className="text-xs text-slate-500">{gift.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 전체 은사 점수 */}
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold text-slate-500">은사별 점수</p>
          {Object.entries(result.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([key, score]) => {
              const gift = GIFT_INFO[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{gift.icon}</span>
                  <span className="w-16 text-xs text-slate-600">{gift.korName}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-700"
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-5 text-right text-xs text-slate-500">{score}</span>
                </div>
              );
            })}
        </div>
      </ResultCard>
    );
  }

  return (
    <AssessmentStepper
      title="은사 체크리스트"
      subtitle="고린도전서 12장 기반 — 나의 영적 은사는?"
      icon="🕊️"
      questions={GIFTS_QUESTIONS}
      onComplete={handleComplete}
    />
  );
}

export default function GiftsTrialPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-400">로딩 중...</div>}>
      <GiftsContent />
    </Suspense>
  );
}
