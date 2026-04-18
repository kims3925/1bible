/**
 * Supabase 서버 클라이언트 (Server Components / Route Handlers / Server Actions)
 * Hub_Link SSO — 쿠키 도메인을 .hublink.im 으로 맞춰 세션 공유
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const COOKIE_DOMAIN =
  process.env.COOKIE_DOMAIN ||
  (process.env.NODE_ENV === 'production' ? '.hublink.im' : undefined);

/**
 * Server Component / Route Handler / Server Action 에서 사용.
 * cookies()는 request-scoped 이므로 세션이 올바르게 분리된다.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                domain: COOKIE_DOMAIN,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
              });
            });
          } catch {
            // Server Component에서 직접 쿠키 수정 시 에러 가능 —
            // middleware에서 처리하므로 무시해도 안전.
          }
        },
      },
    }
  );
}

/**
 * 현재 로그인 사용자 (없으면 null)
 * 편의 함수 — 대부분의 Server Component에서 이것만 쓴다.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 기존 코드 호환용 별칭
 */
export async function createClient() {
  return createSupabaseServerClient();
}
