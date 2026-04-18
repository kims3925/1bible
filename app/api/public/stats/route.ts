/**
 * 실시간 사용자 수 공개 API
 *
 * hublink.im/bible 랜딩의 히어로 수치를 제공한다.
 * - 5분 캐시 (Cloudflare / Vercel Edge Cache)
 * - CORS 허용 (hublink.im 에서 fetch)
 *
 * 사용 (hublink.im/bible 랜딩에서):
 *   const { totalUsers } = await fetch('https://bible.hublink.im/api/public/stats').then(r => r.json());
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// 과장 방지: 실제 수가 작을 때 표시 규칙
const DISPLAY_RULES = {
  MIN_DISPLAY_THRESHOLD: 50,   // 50명 미만은 "초기 참여자 모집 중"
  ROUND_THRESHOLD: 100,         // 100명 넘으면 표시 시작
};

const CORS_ORIGINS = [
  'https://hublink.im',
  'https://www.hublink.im',
  'https://bible.hublink.im',
  'http://localhost:3000',
  'http://localhost:3001',
];

function withCors(origin: string | null, response: NextResponse) {
  if (origin && CORS_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return withCors(origin, response);
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');

  try {
    const supabase = await createSupabaseServerClient();

    // 1) 총 사용자 수 — bible_profiles 또는 profiles 테이블
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const total = totalUsers ?? 0;

    // 표시 규칙 적용
    let displayText: string;
    let shouldDisplay: boolean;

    if (total < DISPLAY_RULES.MIN_DISPLAY_THRESHOLD) {
      shouldDisplay = false;
      displayText = '첫 100분을 모십니다';
    } else if (total < DISPLAY_RULES.ROUND_THRESHOLD) {
      shouldDisplay = true;
      displayText = `지금 ${total}명이 함께 읽고 있습니다`;
    } else {
      shouldDisplay = true;
      displayText = `지금 ${total.toLocaleString('ko-KR')}명이 함께 읽고 있습니다`;
    }

    const response = NextResponse.json(
      {
        totalUsers: total,
        shouldDisplay,
        displayText,
        cachedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );

    return withCors(origin, response);
  } catch (error) {
    const response = NextResponse.json(
      {
        totalUsers: 0,
        shouldDisplay: false,
        displayText: '서비스 준비 중',
        cachedAt: new Date().toISOString(),
      },
      { status: 200 } // 에러여도 200 반환 (랜딩에서 깨지지 않도록)
    );
    return withCors(origin, response);
  }
}
