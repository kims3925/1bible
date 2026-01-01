/**
 * 홈 페이지 헤더
 * 타이틀 + 슬로건 + 햄버거 메뉴
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HomeHeaderProps {
  onMenuClick?: () => void;
}

export function HomeHeader({ onMenuClick }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
    onMenuClick?.();
  };

  return (
    <header className="relative mb-6 text-center">
      {/* 햄버거 메뉴 버튼 */}
      <button
        onClick={handleMenuClick}
        className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted"
        aria-label="메뉴 열기"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 타이틀 */}
      <h1 className="text-2xl font-bold text-foreground">게을러도성경일독</h1>

      {/* 슬로건 */}
      <p className="mt-1 text-sm text-muted-foreground">
        작심삼일 <span className="font-semibold text-destructive">NO!</span> 이제{' '}
        <span className="font-semibold text-primary">작심평생</span>
      </p>

      {/* 드롭다운 메뉴 */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border bg-card p-2 shadow-lg">
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              설정
            </Link>
            <Link
              href="/me"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              내 정보
            </Link>
            <hr className="my-1 border-border" />
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-muted"
              onClick={() => {
                if (confirm('진도를 초기화하시겠습니까?')) {
                  localStorage.clear();
                  window.location.reload();
                }
                setMenuOpen(false);
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              데이터 초기화
            </button>
          </div>
        </>
      )}
    </header>
  );
}
