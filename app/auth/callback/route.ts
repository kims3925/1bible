/**
 * OAuth/매직링크 콜백
 *
 * Supabase가 보내주는 code를 session으로 교환하고,
 * 그 사이에 게스트 체험 데이터를 user 계정으로 이전(claim)한다.
 *
 * 쿼리 파라미터:
 *   code   - Supabase OAuth code (필수)
 *   next   - 이동할 경로 (기본 /home)
 *   plan   - 'premium' 이면 결제 페이지로
 *   ref    - 유입 추적용 (profile에 저장)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';
  const plan = searchParams.get('plan');
  const ref = searchParams.get('ref');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();

  // 1) code → session 교환
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error?.message ?? 'unknown')}`
    );
  }

  const user = data.user;

  // 2) 프로필 upsert (신규 가입자 → 자동 생성, 기존 → 업데이트)
  const metadata = user.user_metadata;
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      username:
        metadata?.preferred_username ||
        metadata?.name?.replace(/\s/g, '').toLowerCase() ||
        `user_${user.id.slice(0, 8)}`,
      display_name:
        metadata?.full_name ||
        metadata?.name ||
        metadata?.preferred_username ||
        user.email?.split('@')[0] ||
        '사용자',
      avatar_url: metadata?.avatar_url || metadata?.picture || null,
      plan: 'free',
      role: 'customer',
      platform: 'bible',
    },
    { onConflict: 'id' }
  );

  // 3) 게스트 체험 데이터 이전 (claim)
  const guestId = request.cookies.get('bible_guest_id')?.value;
  if (guestId) {
    try {
      const { data: claimCount, error: claimError } = await supabase.rpc(
        'claim_trial_assessments',
        {
          p_guest_id: guestId,
          p_user_id: user.id,
        }
      );
      if (claimError) {
        console.warn('[claim] failed:', claimError.message);
      } else if (typeof claimCount === 'number' && claimCount > 0) {
        // 가입 보너스 포인트 지급 (테이블 있으면)
        try {
          await supabase.from('points_ledger').insert({
            user_id: user.id,
            amount: 50,
            reason: 'signup_bonus',
          });
        } catch {
          // points_ledger 테이블이 아직 없을 수 있음
        }
      }
    } catch {
      // claim 실패해도 로그인은 성공
    }
  }

  // 4) 목적지 결정
  // 안전 검증 — 외부 URL 차단 (open redirect 방지)
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/home';

  let redirectPath: string;
  if (plan === 'premium') {
    redirectPath = '/billing/subscribe?plan=premium';
  } else {
    redirectPath = safeNext;
  }

  // 게스트 쿠키 삭제 (claim 완료 후)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  let redirectUrl: string;
  if (isLocalEnv) {
    redirectUrl = `${origin}${redirectPath}`;
  } else if (forwardedHost) {
    redirectUrl = `https://${forwardedHost}${redirectPath}`;
  } else {
    redirectUrl = `${origin}${redirectPath}`;
  }

  const response = NextResponse.redirect(redirectUrl);

  // 게스트 쿠키 삭제
  if (guestId) {
    response.cookies.delete('bible_guest_id');
  }

  return response;
}
