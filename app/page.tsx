/**
 * 루트 페이지
 * 로그인 상태에 따라 분기:
 * - 로그인 O → 매니저 대시보드
 * - 로그인 X → 랜딩페이지
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function RootPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/manager');
    } else {
      router.replace('/landing');
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center text-slate-400">
        <div className="mb-2 text-2xl">&#128214;</div>
        <p className="text-sm">로딩 중...</p>
      </div>
    </div>
  );
}
