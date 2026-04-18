/**
 * 로그인 필수 페이지 래퍼
 * 비회원 → /explore?from=xxx 로 리다이렉트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface RequireAuthProps {
  children: React.ReactNode;
  /** 리다이렉트 시 from 파라미터 (어디서 왔는지) */
  from?: string;
}

export function RequireAuth({ children, from }: RequireAuthProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Zustand persist는 hydration 후에 isLoggedIn이 확정됨
    // 짧은 딜레이로 hydration 기다림
    const timer = setTimeout(() => {
      setChecked(true);
      if (!isLoggedIn) {
        router.replace(`/explore${from ? `?from=${from}` : ''}`);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, router, from]);

  if (!checked || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-400">확인 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}
