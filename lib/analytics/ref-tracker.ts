/**
 * 듀얼 랜딩 유입 추적 (ref-tracker)
 *
 * hublink.im/bible 의 각 CTA에는 ?ref=hublink-bible-{slot} 이 붙어 있다.
 * 이 유틸은 다음을 담당한다:
 *   1) ref 파라미터를 세션 쿠키에 저장 (7일 유지)
 *   2) 회원가입/검사 제출 시 entry_ref 로 PostHog에 태깅
 *   3) 마지막 터치(last-touch) 우선 — 여러 경로 방문 시 마지막 ref 사용
 *
 * 사용 예:
 *   "use client";
 *   useEffect(() => { captureRefFromUrl(); }, []);
 */

const REF_COOKIE = 'lb_entry_ref';
const REF_TIMESTAMP_COOKIE = 'lb_entry_ref_at';
const REF_MAX_AGE_DAYS = 7;

const COOKIE_DOMAIN =
  typeof window !== 'undefined'
    ? undefined // 브라우저에서는 document.cookie 도메인 직접 설정
    : undefined;

/**
 * 허용된 ref 값 화이트리스트.
 * 악의적 파라미터 주입 방지 + 오타 방지.
 */
const ALLOWED_REFS = new Set([
  // hublink.im/bible 랜딩
  'hublink-bible-topbar',
  'hublink-bible-hero',
  'hublink-bible-features',
  'hublink-bible-mbti',
  'hublink-bible-disc',
  'hublink-bible-gifts',
  'hublink-bible-pricing-free',
  'hublink-bible-pricing-premium',
  'hublink-bible-church',
  'hublink-bible-footer',

  // bible.hublink.im 랜딩
  'bible-hublink-hero',
  'bible-hublink-footer',
  'bible-landing-hero',
  'bible-landing-free',
  'bible-landing-footer',

  // 체험 결과에서 저장하기
  'trial-result-save',

  // 기타
  'direct',
  'organic',
]);

/** 쿠키 유틸 (js-cookie 없이 직접 구현) */
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '';
  const domainPart = domain ? `; domain=${domain}` : '';
  const securePart = process.env.NODE_ENV === 'production' ? '; secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainPart}; samesite=lax${securePart}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function removeCookie(name: string) {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '';
  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
}

/**
 * URL에서 ref 파라미터를 읽어 쿠키에 저장.
 * Client Component의 useEffect에서 호출.
 */
export function captureRefFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const ref = url.searchParams.get('ref');

  if (!ref) return getStoredRef();
  if (!ALLOWED_REFS.has(ref)) {
    console.warn(`[ref-tracker] Unknown ref: ${ref}`);
    return getStoredRef();
  }

  // 저장 (마지막 터치 우선)
  setCookie(REF_COOKIE, ref, REF_MAX_AGE_DAYS);
  setCookie(REF_TIMESTAMP_COOKIE, new Date().toISOString(), REF_MAX_AGE_DAYS);

  // PostHog 이벤트 (선택적 — PostHog 미초기화 시 무시)
  try {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).posthog) {
      const posthog = (window as unknown as Record<string, unknown>).posthog as {
        capture: (event: string, props: Record<string, unknown>) => void;
      };
      posthog.capture('landing_entry', {
        ref,
        landing: ref.startsWith('hublink-bible-')
          ? 'hublink-bible'
          : 'bible-hublink',
        referrer: document.referrer || null,
        url: window.location.href,
      });
    }
  } catch {
    // PostHog 미초기화 시 무시
  }

  return ref;
}

/**
 * 저장된 ref 읽기 (가입/전환 시점 사용).
 */
export function getStoredRef(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie(REF_COOKIE);
}

/**
 * 가입 완료 등 전환 시점에 호출 — 이 ref를 최종 entry_ref로 PostHog에 기록.
 */
export function attachRefToEvent(eventName: string, properties: Record<string, unknown> = {}) {
  const ref = getStoredRef();
  try {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).posthog) {
      const posthog = (window as unknown as Record<string, unknown>).posthog as {
        capture: (event: string, props: Record<string, unknown>) => void;
      };
      posthog.capture(eventName, {
        ...properties,
        entry_ref: ref,
        entry_ref_at: getCookie(REF_TIMESTAMP_COOKIE),
      });
    }
  } catch {
    // 무시
  }
}

/**
 * 회원가입 완료 후 호출 — ref를 서버 user_metadata에도 저장해두면
 * 나중에 PostHog 없이도 코호트 분석이 가능.
 */
export function consumeRefForSignup(): string | null {
  const ref = getStoredRef();
  // 가입 후에는 쿠키 삭제 (재사용 방지)
  removeCookie(REF_COOKIE);
  removeCookie(REF_TIMESTAMP_COOKIE);
  return ref;
}
