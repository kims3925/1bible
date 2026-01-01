/**
 * 묵상 자동 문장 생성기 테스트
 */

import { describe, it, expect } from 'vitest';
import { generateMeditationSummary } from '@/lib/generateMeditationSummary';

describe('generateMeditationSummary', () => {
  it('기본 입력으로 올바른 문장을 생성해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['위로', '평안'],
      emotionPrimary: 'peace',
      emotionSecondary: ['안도'],
      gratitudeTags: ['오늘 말씀을 들을 수 있어서'],
      decisionTag: '오늘 하루 감사하며 살기',
    });

    expect(result).toContain('위로');
    expect(result).toContain('평안');
    expect(result).toContain('안도');
    expect(result).toContain('감사');
    expect(result).toContain('감사하며 살기');
  });

  it('잘 모르겠음 은혜 태그를 올바르게 처리해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['잘 모르겠음'],
      emotionPrimary: 'joy',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain('뚜렷이 정리되진 않았지만');
  });

  it('무덤덤 감정을 올바르게 처리해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['깨달음'],
      emotionPrimary: '무덤덤',
      emotionSecondary: ['피곤'],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain('피곤');
  });

  it('무덤덤 감정(2차 없음)을 올바르게 처리해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: [],
      emotionPrimary: '무덤덤',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain('와닿지 않았지만');
  });

  it('아직 결단 못함을 올바르게 처리해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['사랑'],
      emotionPrimary: 'joy',
      emotionSecondary: ['감격'],
      gratitudeTags: ['하나님이 말씀하신다는 사실'],
      decisionTag: '아직 결단 못함',
    });

    expect(result).toContain('열어두되');
    expect(result).toContain('품어봅니다');
  });

  it('감사가 없을 때 감사 문장을 생략해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['위로'],
      emotionPrimary: 'peace',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '용서하기',
    });

    expect(result).not.toContain('감사합니다.');
  });

  it('특별히 감사한 것 없음을 올바르게 처리해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['믿음'],
      emotionPrimary: 'conviction',
      emotionSecondary: ['회개'],
      gratitudeTags: ['특별히 감사한 것 없음'],
      decisionTag: '내려놓기',
    });

    expect(result).not.toContain('감사합니다.');
  });

  it('은혜 태그가 1개일 때 올바른 형식을 사용해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['소망'],
      emotionPrimary: 'joy',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain("'소망'의 은혜");
  });

  it('은혜 태그가 2개일 때 올바른 형식을 사용해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['소망', '믿음'],
      emotionPrimary: 'joy',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain("'소망'과(와) '믿음'의 은혜");
  });

  it('은혜 태그가 3개 이상일 때 올바른 형식을 사용해야 함', () => {
    const result = generateMeditationSummary({
      graceTags: ['소망', '믿음', '사랑'],
      emotionPrimary: 'joy',
      emotionSecondary: [],
      gratitudeTags: [],
      decisionTag: '',
    });

    expect(result).toContain("'소망', '믿음', 그리고 '사랑'의 은혜");
  });
});
