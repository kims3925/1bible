/**
 * 성경인물 MBTI 게스트 체험 페이지
 * 비로그인 접근 가능 — 12문항 → 결과 카드
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentStepper } from '@/components/trial/AssessmentStepper';
import { ResultCard } from '@/components/trial/ResultCard';
import {
  MBTI_QUESTIONS,
  MBTI_RESULTS,
  calculateMBTI,
  getOrCreateGuestId,
  saveTrialAssessment,
} from '@/lib/trial';

function MBTIContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [result, setResult] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleComplete = async (finalAnswers: Record<number, number>) => {
    setAnswers(finalAnswers);
    const mbtiType = calculateMBTI(finalAnswers);
    setResult(mbtiType);

    // 게스트 세션에 저장 (실패해도 결과는 보여줌)
    try {
      const guestId = getOrCreateGuestId();
      await saveTrialAssessment(guestId, 'mbti', finalAnswers, {
        type: mbtiType,
        character: MBTI_RESULTS[mbtiType]?.name,
      });
    } catch {
      // Supabase 연결 안 되어도 결과 표시
    }
  };

  // 결과 화면
  if (result && MBTI_RESULTS[result]) {
    const r = MBTI_RESULTS[result];
    return (
      <ResultCard
        assessmentType="성경인물 MBTI"
        title={`당신은 ${r.name} 유형!`}
        subtitle={`${r.type} — ${r.character}`}
        icon="🧠"
        description={r.description}
        verse={r.verse}
        verseRef={r.verseRef}
      >
        {/* MBTI 유형 뱃지 */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex gap-1">
            {r.type.split('').map((letter, i) => (
              <span
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-black text-blue-600"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </ResultCard>
    );
  }

  // 문항 스텝퍼
  return (
    <AssessmentStepper
      title="성경인물 MBTI"
      subtitle="나와 닮은 성경 인물은 누구일까요?"
      icon="🧠"
      questions={MBTI_QUESTIONS}
      onComplete={handleComplete}
    />
  );
}

export default function MBTITrialPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-400">로딩 중...</div>}>
      <MBTIContent />
    </Suspense>
  );
}
