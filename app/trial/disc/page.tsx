/**
 * 성경인물 DISC 게스트 체험 페이지
 * 비로그인 접근 가능 — 12문항 → 결과 카드
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentStepper } from '@/components/trial/AssessmentStepper';
import { ResultCard } from '@/components/trial/ResultCard';
import {
  DISC_QUESTIONS,
  DISC_CHARACTERS,
  calculateDISC,
  getOrCreateGuestId,
  saveTrialAssessment,
} from '@/lib/trial';

function DISCContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [result, setResult] = useState<{ primary: string; secondary: string; scores: Record<string, number> } | null>(null);

  const handleComplete = async (finalAnswers: Record<number, number>) => {
    const discResult = calculateDISC(finalAnswers);
    setResult(discResult);

    try {
      const guestId = getOrCreateGuestId();
      await saveTrialAssessment(guestId, 'disc', finalAnswers, {
        primary: discResult.primary,
        secondary: discResult.secondary,
        scores: discResult.scores,
        character: DISC_CHARACTERS[discResult.primary]?.name,
      });
    } catch {
      // 결과는 보여줌
    }
  };

  if (result) {
    const primary = DISC_CHARACTERS[result.primary];
    const maxScore = Math.max(...Object.values(result.scores));

    return (
      <ResultCard
        assessmentType="성경인물 DISC"
        title={`당신은 ${primary.name}!`}
        subtitle={`주성향: ${result.primary} / 부성향: ${result.secondary}`}
        icon="🎯"
        description={primary.description}
        verse={primary.verse}
        verseRef={primary.verseRef}
      >
        {/* DISC 점수 막대 */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500">유형별 점수</p>
          {Object.entries(result.scores).map(([dim, score]) => (
            <div key={dim} className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-bold text-slate-600">{dim}</span>
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-6 text-right text-xs text-slate-500">{score}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          강점: {primary.strength}
        </p>
      </ResultCard>
    );
  }

  return (
    <AssessmentStepper
      title="성경인물 DISC"
      subtitle="나의 행동 유형에 맞는 성경 인물은?"
      icon="🎯"
      questions={DISC_QUESTIONS}
      onComplete={handleComplete}
    />
  );
}

export default function DISCTrialPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-400">로딩 중...</div>}>
      <DISCContent />
    </Suspense>
  );
}
