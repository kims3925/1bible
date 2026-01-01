/**
 * 함께읽기 퀵 버튼
 * 커플읽기 / 소그룹읽기 / 내목소리 낭독
 */

'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TogetherButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

function TogetherButton({ label, icon, onClick, className }: TogetherButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-medium transition-all hover:bg-muted active:scale-95',
        className
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

export function TogetherQuickButtons() {
  const router = useRouter();

  return (
    <section className="mb-6">
      <div className="flex gap-2">
        <TogetherButton
          label="커플읽기"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          onClick={() => router.push('/together?type=couple')}
        />
        <TogetherButton
          label="소그룹읽기"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          onClick={() => router.push('/together?type=smallgroup')}
        />
        <TogetherButton
          label="내목소리 낭독"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
          onClick={() => router.push('/recite')}
        />
      </div>
    </section>
  );
}
