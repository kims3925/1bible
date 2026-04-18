/**
 * 게스트 체험 모듈 — 공개 내보내기
 */

export {
  getOrCreateGuestId,
  getGuestId,
  saveTrialAssessment,
  getTrialAssessment,
  claimTrialData,
} from './guest-session';

export { MBTI_QUESTIONS, MBTI_RESULTS, calculateMBTI } from './data/bible-mbti';
export type { MBTIQuestion, MBTIResult } from './data/bible-mbti';

export { DISC_QUESTIONS, DISC_CHARACTERS, calculateDISC } from './data/bible-disc';
export type { DISCQuestion, DISCResult } from './data/bible-disc';

export { GIFTS_QUESTIONS, GIFT_INFO, calculateGifts } from './data/bible-gifts';
export type { GiftsQuestion, GiftInfo } from './data/bible-gifts';
