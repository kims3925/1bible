/**
 * 게으른자의 묵상 - 자동 문장 생성기
 *
 * 입력된 선택 항목들을 바탕으로 자연스러운 한국어 묵상 문장을 생성합니다.
 * 특수 케이스 (무덤덤, 잘 모르겠음, 아직 결단 못함)를 담백하게 처리합니다.
 */

export interface MeditationInput {
  graceTags: string[];
  emotionPrimary: string;
  emotionSecondary: string[];
  gratitudeTags: string[];
  decisionTag: string;
}

/**
 * 은혜 태그를 자연스러운 문구로 변환
 */
function buildGracePhrase(graceTags: string[]): string {
  if (graceTags.length === 0 || graceTags.includes('잘 모르겠음')) {
    return '뚜렷이 정리되진 않았지만, 말씀 앞에 머물렀던 시간';
  }

  if (graceTags.length === 1) {
    return `'${graceTags[0]}'의 은혜`;
  }

  if (graceTags.length === 2) {
    return `'${graceTags[0]}'과(와) '${graceTags[1]}'의 은혜`;
  }

  const lastTag = graceTags[graceTags.length - 1];
  const otherTags = graceTags.slice(0, -1).map((t) => `'${t}'`).join(', ');
  return `${otherTags}, 그리고 '${lastTag}'의 은혜`;
}

/**
 * 감정을 자연스러운 문구로 변환
 */
function buildEmotionPhrase(emotionPrimary: string, emotionSecondary: string[]): string {
  // 무덤덤 특수 케이스
  if (emotionPrimary === '무덤덤') {
    if (emotionSecondary.length > 0) {
      return `${emotionSecondary[0]}한 마음이지만, 말씀을 들은 것`;
    }
    return '오늘은 말씀이 잘 와닿지 않았지만, 그래도 머문 시간';
  }

  if (emotionSecondary.length > 0) {
    return `${emotionPrimary}과(와) ${emotionSecondary[0]}`;
  }

  return emotionPrimary;
}

/**
 * 감사 태그를 문장으로 변환
 */
function buildGratitudePhrase(gratitudeTags: string[]): string {
  if (gratitudeTags.length === 0 || gratitudeTags.includes('특별히 감사한 것 없음')) {
    return '';
  }

  if (gratitudeTags.length === 1) {
    return `${gratitudeTags[0]} 감사합니다.`;
  }

  return `${gratitudeTags[0]}, ${gratitudeTags[1]} 감사합니다.`;
}

/**
 * 결단 태그를 문장으로 변환
 */
function buildDecisionPhrase(decisionTag: string): string {
  if (!decisionTag || decisionTag === '아직 결단 못함') {
    return '구체적인 결단은 열어두되, 오늘 말씀을 마음에 품어봅니다.';
  }

  // "~기"로 끝나는 결단들
  if (decisionTag.endsWith('기')) {
    return `오늘 하루 '${decisionTag}'로 반응해보려 합니다.`;
  }

  return `'${decisionTag}'를 실천해보려 합니다.`;
}

/**
 * 묵상 자동 문장 생성
 */
export function generateMeditationSummary(input: MeditationInput): string {
  const { graceTags, emotionPrimary, emotionSecondary, gratitudeTags, decisionTag } = input;

  const gracePhrase = buildGracePhrase(graceTags);
  const emotionPhrase = buildEmotionPhrase(emotionPrimary, emotionSecondary);
  const gratitudePhrase = buildGratitudePhrase(gratitudeTags);
  const decisionPhrase = buildDecisionPhrase(decisionTag);

  // 문장 조합
  let summary = `오늘 말씀을 통해 ${gracePhrase}을(를) 느꼈고, 마음에는 ${emotionPhrase}이(가) 남았습니다.`;

  if (gratitudePhrase) {
    summary += `\n${gratitudePhrase}`;
  }

  summary += `\n${decisionPhrase}`;

  return summary;
}
