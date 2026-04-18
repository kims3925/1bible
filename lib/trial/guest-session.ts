/**
 * 게스트 세션 관리
 * 비로그인 사용자의 검사 체험을 위한 임시 세션 처리
 * - 쿠키 기반 guest_id 생성/관리 (30일 유효)
 * - trial_assessments 테이블에 임시 저장
 * - 가입 시 user_assessments로 이전 (claim)
 */

import { createClient } from '@/lib/supabase/client';

const GUEST_COOKIE = 'bible_guest_id';
const GUEST_COOKIE_DAYS = 30;

/** 쿠키 읽기 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** 쿠키 설정 */
function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

/** 쿠키 삭제 */
function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/**
 * 게스트 ID 가져오기 (없으면 생성)
 */
export function getOrCreateGuestId(): string {
  let id = getCookie(GUEST_COOKIE);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    setCookie(GUEST_COOKIE, id, GUEST_COOKIE_DAYS);
  }
  return id;
}

/**
 * 현재 게스트 ID 조회 (생성하지 않음)
 */
export function getGuestId(): string | null {
  return getCookie(GUEST_COOKIE);
}

/**
 * 게스트 검사 응답 임시 저장
 */
export async function saveTrialAssessment(
  guestId: string,
  assessmentType: 'mbti' | 'disc' | 'gifts',
  answers: Record<string, unknown>,
  result: Record<string, unknown>,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from('trial_assessments')
    .insert({
      guest_id: guestId,
      assessment_type: assessmentType,
      answers,
      result,
    });

  if (error) {
    console.error('Failed to save trial assessment:', error);
    throw error;
  }
}

/**
 * 게스트의 기존 검사 결과 조회
 */
export async function getTrialAssessment(
  guestId: string,
  assessmentType: 'mbti' | 'disc' | 'gifts',
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('trial_assessments')
    .select('*')
    .eq('guest_id', guestId)
    .eq('assessment_type', assessmentType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to get trial assessment:', error);
  }
  return data;
}

/**
 * 가입 완료 시 게스트 데이터를 사용자 계정으로 이전
 * Supabase RPC 함수 호출
 */
export async function claimTrialData(userId: string): Promise<number> {
  const guestId = getCookie(GUEST_COOKIE);
  if (!guestId) return 0;

  const supabase = createClient();
  const { data, error } = await supabase.rpc('claim_trial_assessments', {
    p_guest_id: guestId,
    p_user_id: userId,
  });

  if (error) {
    console.error('Failed to claim trial data:', error);
    return 0;
  }

  // 성공 시 게스트 쿠키 제거
  removeCookie(GUEST_COOKIE);
  return data ?? 0;
}
