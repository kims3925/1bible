/**
 * 시간 버튼 그리드
 * 지금 가능한 시간 선택
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TimeButtonProps {
  label: string;
  subLabel?: string;
  onClick: () => void;
  variant?: 'default' | 'highlight';
  className?: string;
}

function TimeButton({ label, subLabel, onClick, variant = 'default', className }: TimeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-all active:scale-95',
        variant === 'default' && 'border-border bg-card hover:bg-muted',
        variant === 'highlight' && 'border-primary bg-primary/10 text-primary hover:bg-primary/20',
        className
      )}
    >
      <span>{label}</span>
      {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
    </button>
  );
}

interface TimeButtonsGridProps {
  onStartSession: (minutes: number, mode?: 'listen' | 'read', source?: string) => void;
}

export function TimeButtonsGrid({ onStartSession }: TimeButtonsGridProps) {
  const router = useRouter();
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(15);

  const handleTimeSelect = (minutes: number, mode?: 'listen' | 'read', source?: string) => {
    onStartSession(minutes, mode, source);
  };

  const handleCustomTime = () => {
    setShowTimeModal(false);
    onStartSession(customMinutes);
  };

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-lg font-semibold">지금 가능한 시간</h2>
        <span className="text-sm text-muted-foreground">시간을 선택하면 바로 이어서 읽기가 진행됩니다</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* 첫째 줄 */}
        <TimeButton label="5분" onClick={() => handleTimeSelect(5)} />
        <TimeButton label="10분" onClick={() => handleTimeSelect(10)} />
        <TimeButton label="30분" onClick={() => handleTimeSelect(30)} />
        <TimeButton
          label="차에서듣기"
          onClick={() => handleTimeSelect(30, 'listen', 'pondang')}
          variant="highlight"
        />

        {/* 둘째 줄 */}
        <TimeButton label="1시간" onClick={() => handleTimeSelect(60)} />
        <TimeButton label="2시간" onClick={() => handleTimeSelect(120)} />
        <TimeButton label="시간선택" onClick={() => setShowTimeModal(true)} />
        <TimeButton
          label="일독플랜"
          onClick={() => router.push('/plan')}
          variant="highlight"
        />
      </div>

      {/* 시간 선택 모달 */}
      {showTimeModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowTimeModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">시간 선택</h3>

            <div className="mb-4">
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-2 text-center text-2xl font-bold text-primary">
                {customMinutes >= 60
                  ? `${Math.floor(customMinutes / 60)}시간 ${customMinutes % 60 > 0 ? `${customMinutes % 60}분` : ''}`
                  : `${customMinutes}분`}
              </div>
            </div>

            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  onClick={() => setCustomMinutes(m)}
                  className={cn(
                    'rounded-lg border px-3 py-1 text-sm',
                    customMinutes === m
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {m >= 60 ? `${m / 60}시간` : `${m}분`}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-muted"
              >
                취소
              </button>
              <button
                onClick={handleCustomTime}
                className="flex-1 rounded-xl bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90"
              >
                시작하기
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
