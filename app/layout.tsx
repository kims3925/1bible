/**
 * 루트 레이아웃
 * 모든 페이지에 공통 적용
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: '게을러도성경일독',
  description: '최소 입력 · 최대 은혜 - 눈은 쉬어도, 말씀은 흐르게',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '게을러도성경일독',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-sans">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
