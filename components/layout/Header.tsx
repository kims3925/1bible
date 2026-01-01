/**
 * 페이지 헤더 컴포넌트
 */

'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack, rightAction, className }: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="뒤로 가기"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
