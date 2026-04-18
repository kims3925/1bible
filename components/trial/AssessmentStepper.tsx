/**
 * 검사 스텝퍼 — 공통 UI
 * 한 화면에 한 문항, 5점 척도, 진행률 표시, 앞뒤 이동
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  question: string;
  leftLabel: string;
  rightLabel: string;
}

interface AssessmentStepperProps {
  title: string;
  subtitle: string;
  icon: string;
  questions: Question[];
  onComplete: (answers: Record<number, number>) => void;
}

const SCALE_LABELS = ['매우 그렇다', '그렇다', '보통', '그렇다', '매우 그렇다'];

export function AssessmentStepper({
  title,
  subtitle,
  icon,
  questions,
  onComplete,
}: AssessmentStepperProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const total = questions.length;
  const current = questions[currentIdx];
  const progress = Math.round(((Object.keys(answers).length) / total) * 100);

  const handleAnswer = (value: number) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    // 마지막 문항이면 완료
    if (currentIdx === total - 1) {
      setTimeout(() => onComplete(next), 300);
    } else {
      setTimeout(() => setCurrentIdx((i) => i + 1), 250);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 pb-8 pt-6">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <span className="mb-2 inline-block text-4xl">{icon}</span>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* 진행률 바 */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>{currentIdx + 1} / {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 문항 */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-center text-base font-semibold leading-relaxed text-slate-800">
            {current.question}
          </p>

          {/* 양끝 레이블 */}
          <div className="mb-4 flex justify-between text-xs text-slate-500">
            <span className="max-w-[40%] text-left">{current.leftLabel}</span>
            <span className="max-w-[40%] text-right">{current.rightLabel}</span>
          </div>

          {/* 5점 척도 버튼 */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswer(val)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90',
                  answers[current.id] === val
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                    : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                )}
              >
                {val}
              </button>
            ))}
          </div>

          {/* 척도 안내 */}
          <div className="mt-3 flex justify-between px-1 text-[10px] text-slate-400">
            <span>{SCALE_LABELS[0]}</span>
            <span>{SCALE_LABELS[2]}</span>
            <span>{SCALE_LABELS[4]}</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={cn(
              'flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-all',
              currentIdx === 0
                ? 'text-slate-300'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>

          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === currentIdx ? 'w-4 bg-blue-500' :
                  answers[questions[idx].id] !== undefined ? 'w-1.5 bg-blue-300' :
                  'w-1.5 bg-slate-200'
                )}
              />
            ))}
          </div>

          <div className="w-16" /> {/* 균형 spacer */}
        </div>
      </div>
    </div>
  );
}
