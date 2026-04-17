/**
 * OAuth 콜백 라우트
 * 소셜 로그인(네이버/카카오/구글/애플) 후 Supabase가 리다이렉트하는 엔드포인트
 * code를 세션으로 교환 → 매니저 대시보드로 이동
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/manager';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공 → profiles 테이블에 행이 없으면 자동 생성
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // Hub_Link와 동일한 패턴: 프론트에서 profiles upsert
          const metadata = user.user_metadata;
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            username: metadata?.preferred_username
              || metadata?.name?.replace(/\s/g, '').toLowerCase()
              || `user_${user.id.slice(0, 8)}`,
            display_name: metadata?.full_name
              || metadata?.name
              || metadata?.preferred_username
              || user.email?.split('@')[0]
              || '사용자',
            avatar_url: metadata?.avatar_url || metadata?.picture || null,
            plan: 'free',
            role: 'customer',
            platform: 'bible',
          }, { onConflict: 'id' });
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 에러 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
}
