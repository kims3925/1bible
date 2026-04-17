/**
 * Next.js 미들웨어 — Supabase Auth 세션 갱신
 * 모든 요청에서 세션 쿠키를 갱신하여 SSO 상태 유지
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에 적용:
     * - _next/static, _next/image (Next.js 내부)
     * - favicon.ico, sitemap.xml, robots.txt
     * - 정적 파일 (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
