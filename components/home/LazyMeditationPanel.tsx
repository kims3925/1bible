/**
 * 게으른자의 묵상 섹션
 * 오늘의 말씀 + 묵상 실행 + 노트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNotesStore, STATE_TAG_LABELS, ACTION_TAG_LABELS } from '@/stores';
import type { MeditationStateTag, MeditationActionTag } from '@/types';

export function LazyMeditationPanel() {
  const router = useRouter();
  const { todayVerse, addMeditationNote } = useNotesStore();
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [selectedState, setSelectedState] = useState<MeditationStateTag | null>(null);
  const [oneLine, setOneLine] = useState('');
  const [selectedAction, setSelectedAction] = useState<MeditationActionTag | null>(null);

  const handleSaveMeditation = () => {
    if (!selectedState) return;

    addMeditationNote({
      stateTag: selectedState,
      oneLine: oneLine || undefined,
      actionTag: selectedAction || undefined,
    });

    // 초기화
    setSelectedState(null);
    setOneLine('');
    setSelectedAction(null);
    setShowMeditationModal(false);
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-300 bg-white p-4">
      {/* 헤더 */}
      <h2 className="mb-1 text-center text-xl font-bold">게으른자의 묵상</h2>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        쓰지 않아도 되는 묵상-선택만하세요
      </p>

      {/* 오늘의 말씀 카드 */}
      <div className="mb-4 rounded-xl bg-slate-50 p-4">
        <div className="mb-2 text-center text-sm font-medium text-primary">오늘의 말씀</div>
        <p className="text-center text-sm leading-relaxed text-foreground">
          {todayVerse.text}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ({todayVerse.reference})
        </p>
      </div>

      {/* 게으른묵상 실행하기 버튼 */}
      <button
        onClick={() => setShowMeditationModal(true)}
        className="mb-4 w-full rounded-xl border-2 border-primary bg-primary/5 py-3 font-semibold text-primary transition-all hover:bg-primary/10 active:scale-[0.98]"
      >
        게으른묵상 실행하기
      </button>

      {/* 노트 버튼들 */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push('/notes')}
          className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-muted"
        >
          내묵상노트
        </button>
        <button
          onClick={() => router.push('/prayers')}
          className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-muted"
        >
          내기도노트
        </button>
      </div>

      {/* 묵상 모달 */}
      {showMeditationModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowMeditationModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card p-5 shadow-xl">
            <h3 className="mb-4 text-center text-lg font-bold">게으른 묵상</h3>

            {/* 상태 선택 */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">오늘 말씀을 통해 느낀 것은?</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(STATE_TAG_LABELS) as [MeditationStateTag, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedState(key)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-all',
                        selectedState === key
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 한 줄 입력 (선택) */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">한 줄로 표현한다면? (선택)</p>
              <input
                type="text"
                value={oneLine}
                onChange={(e) => setOneLine(e.target.value)}
                placeholder="예: 감사합니다, 주님"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* 실천 선택 */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium">오늘의 실천 (선택)</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(ACTION_TAG_LABELS) as [MeditationActionTag, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedAction(selectedAction === key ? null : key)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-all',
                        selectedAction === key
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowMeditationModal(false)}
                className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-muted"
              >
                취소
              </button>
              <button
                onClick={handleSaveMeditation}
                disabled={!selectedState}
                className={cn(
                  'flex-1 rounded-xl py-3 font-medium transition-all',
                  selectedState
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                저장하기
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
