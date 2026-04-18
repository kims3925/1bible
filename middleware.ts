// middleware.ts
// 인증 보호 + 게스트 체험 화이트리스트 + HubLink SSO 세션 갱신
//
// 동작:
//   1) 공개 경로 (/, /auth, /trial/*, /contact/*, /api/public/*, /home, /landing) 는 통과
//   2) /manager, /settings 등 보호 경로는 세션 확인 — 없으면 /auth 로 리다이렉트
//      리다이렉트 시 원래 가려던 경로를 ?next= 로 넘김
//   3) 모든 요청에서 Supabase 세션 쿠키를 갱신 (SSO 핵심)

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const COOKIE_DOMAIN =
  process.env.COOKIE_DOMAIN ||
  (process.env.NODE_ENV === 'production' ? '.hublink.im' : undefined);

// 공개 경로 — 비로그인 접근 가능
const PUBLIC_PATH_PREFIXES = [
  '/',           // 랜딩
  '/auth',       // 로그인/회원가입
  '/trial',      // 게스트 체험
  '/contact',    // 교회 문의
  '/legal',      // 이용약관/개인정보
  '/about',      // 소개
  '/home',       // 성경읽기 메인 (비회원도 접근 가능)
  '/landing',    // 랜딩 페이지
  '/explore',    // 콘텐츠 둘러보기
  '/365',        // 365 통독 (읽기는 공개)
  '/progress',   // 진도 확인 (읽기는 공개)
  '/api/public', // 공개 API
];

// 정적 자산 — 완전 스킵
const STATIC_PATTERNS = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /\.(svg|png|jpg|jpeg|webp|ico|woff2?)$/i,
];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => prefix !== '/' && (pathname === prefix || pathname.startsWith(prefix + '/'))
  );
}

function isStatic(pathname: string): boolean {
  return STATIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStatic(pathname)) {
    return NextResponse.next();
  }

  // 응답 객체를 먼저 만들어 두고, 쿠키 갱신에 사용
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Supabase SSR 클라이언트 — 세션 자동 갱신
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({
              name,
              value,
              ...options,
              domain: COOKIE_DOMAIN,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            })
          );
        },
      },
    }
  );

  // 세션 갱신 (중요 — HubLink 본체에서 로그인한 세션도 여기서 인식됨)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 공개 경로 — 통과
  if (isPublic(pathname)) {
    return response;
  }

  // 보호 경로 — 세션 필요
  if (!user) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('next', pathname + request.nextUrl.search);

    // 기존 ref 파라미터가 있으면 유지
    const ref = request.nextUrl.searchParams.get('ref');
    if (ref) redirectUrl.searchParams.set('ref', ref);

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// 미들웨어 적용 대상
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
