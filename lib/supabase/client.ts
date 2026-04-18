/**
 * Supabase 브라우저 클라이언트
 * Hub_Link SSO 통합 — 쿠키 도메인을 .hublink.im 으로 설정하여
 * hublink.im 본체와 bible.hublink.im 사이에 세션을 공유한다.
 *
 * 주의: 이 클라이언트는 Client Component에서만 사용.
 * Server Component에서는 lib/supabase/server.ts 를 쓴다.
 */

import { createBrowserClient } from '@supabase/ssr';

const COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_COOKIE_DOMAIN ||
  (process.env.NODE_ENV === 'production' ? '.hublink.im' : undefined);

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: COOKIE_DOMAIN,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    }
  );
}

// 싱글턴 — 컴포넌트 리렌더 시 재생성 방지
let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createSupabaseBrowserClient();
  }
  return _client;
}

/**
 * 기존 코드 호환용 별칭
 * useAuthStore 등에서 createClient() 를 호출하는 곳이 있으므로 유지
 */
export function createClient() {
  return getSupabaseBrowserClient();
}
