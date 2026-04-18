/**
 * 은사 체크리스트 검사 문항 데이터
 * 고린도전서 12:4-11 기반 7대 은사
 * 14문항 × 5점 척도 (각 은사당 2문항) → 상위 3가지 은사
 */

export interface GiftsQuestion {
  id: number;
  question: string;
  gift: 'wisdom' | 'knowledge' | 'faith' | 'healing' | 'miracles' | 'prophecy' | 'discernment';
  leftLabel: string;
  rightLabel: string;
}

export const GIFTS_QUESTIONS: GiftsQuestion[] = [
  // 지혜의 말씀 (2문항)
  {
    id: 1,
    question: '어려운 상황에서 사람들이 내게 조언을 구하는 편이다',
    gift: 'wisdom',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 2,
    question: '복잡한 문제를 만나면 성경적 원리로 해결 방향을 제시할 수 있다',
    gift: 'wisdom',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 지식의 말씀 (2문항)
  {
    id: 3,
    question: '성경을 읽으면 새로운 깨달음이 자주 떠오른다',
    gift: 'knowledge',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 4,
    question: '말씀을 배우고 연구하는 것이 즐겁다',
    gift: 'knowledge',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 믿음 (2문항)
  {
    id: 5,
    question: '불가능해 보이는 상황에서도 하나님이 하실 것을 확신한다',
    gift: 'faith',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 6,
    question: '다른 사람들이 포기할 때에도 기도로 붙잡는 편이다',
    gift: 'faith',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 병 고치는 은사 (2문항)
  {
    id: 7,
    question: '아픈 사람을 위해 기도하면 치유가 일어나는 것을 경험했다',
    gift: 'healing',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 8,
    question: '아픈 사람을 보면 특별히 마음이 쓰이고 기도하게 된다',
    gift: 'healing',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 능력 행함 (2문항)
  {
    id: 9,
    question: '나의 기도로 놀라운 일이 일어난 경험이 있다',
    gift: 'miracles',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 10,
    question: '하나님이 초자연적으로 역사하시는 것을 기대하며 기도한다',
    gift: 'miracles',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 예언 (2문항)
  {
    id: 11,
    question: '예배 중이나 기도 중 하나님의 음성(감동)을 듣는 것 같은 경험이 있다',
    gift: 'prophecy',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 12,
    question: '교회 공동체에 필요한 방향이나 경고를 감지할 때가 있다',
    gift: 'prophecy',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  // 영 분별 (2문항)
  {
    id: 13,
    question: '사람이나 상황의 영적 상태를 직감적으로 느끼는 편이다',
    gift: 'discernment',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
  {
    id: 14,
    question: '거짓 가르침이나 잘못된 영향을 빠르게 분별할 수 있다',
    gift: 'discernment',
    leftLabel: '전혀 그렇지 않다',
    rightLabel: '매우 그렇다',
  },
];

export interface GiftInfo {
  name: string;
  korName: string;
  description: string;
  verse: string;
  verseRef: string;
  icon: string;
}

export const GIFT_INFO: Record<string, GiftInfo> = {
  wisdom: {
    name: 'wisdom',
    korName: '지혜의 말씀',
    description: '어려운 상황에서 하나님의 관점으로 해결 방향을 제시하는 은사',
    verse: '어떤 사람에게는 성령으로 말미암아 지혜의 말씀을',
    verseRef: '고린도전서 12:8',
    icon: '💡',
  },
  knowledge: {
    name: 'knowledge',
    korName: '지식의 말씀',
    description: '성경을 깊이 연구하고 진리를 깨달아 가르치는 은사',
    verse: '또 어떤 사람에게는 같은 성령을 따라 지식의 말씀을',
    verseRef: '고린도전서 12:8',
    icon: '📖',
  },
  faith: {
    name: 'faith',
    korName: '믿음',
    description: '불가능한 상황에서도 하나님의 능력을 확신하는 특별한 믿음',
    verse: '또 어떤 사람에게는 같은 성령으로 믿음을',
    verseRef: '고린도전서 12:9',
    icon: '🙏',
  },
  healing: {
    name: 'healing',
    korName: '병 고치는 은사',
    description: '아픈 이들을 위해 기도하며 치유의 통로가 되는 은사',
    verse: '또 어떤 사람에게는 한 성령으로 병 고치는 은사를',
    verseRef: '고린도전서 12:9',
    icon: '❤️‍🩹',
  },
  miracles: {
    name: 'miracles',
    korName: '능력 행함',
    description: '하나님의 초자연적 능력이 나타나도록 기도하는 은사',
    verse: '또 어떤 사람에게는 능력 행함을',
    verseRef: '고린도전서 12:10',
    icon: '⚡',
  },
  prophecy: {
    name: 'prophecy',
    korName: '예언',
    description: '하나님의 뜻을 듣고 공동체에 전하는 은사',
    verse: '또 어떤 사람에게는 예언함을',
    verseRef: '고린도전서 12:10',
    icon: '🔊',
  },
  discernment: {
    name: 'discernment',
    korName: '영 분별',
    description: '영적 상태와 가르침의 진위를 분별하는 은사',
    verse: '또 어떤 사람에게는 영들 분별함을',
    verseRef: '고린도전서 12:10',
    icon: '👁️',
  },
};

/**
 * 은사 검사 결과 계산
 * answers: { questionId: value(1~5) }
 */
export function calculateGifts(answers: Record<number, number>): { top3: string[]; scores: Record<string, number> } {
  const scores: Record<string, number> = {
    wisdom: 0, knowledge: 0, faith: 0, healing: 0,
    miracles: 0, prophecy: 0, discernment: 0,
  };

  GIFTS_QUESTIONS.forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      scores[q.gift] += val;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    top3: sorted.slice(0, 3).map(([gift]) => gift),
    scores,
  };
}
