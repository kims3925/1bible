/**
 * 성경인물 DISC 검사 문항 데이터
 * 12문항 × 5점 척도 → 4가지 차원 (D/I/S/C) → 주성향 + 부성향
 */

export interface DISCQuestion {
  id: number;
  question: string;
  dimension: 'D' | 'I' | 'S' | 'C';
  leftLabel: string;
  rightLabel: string;
}

export const DISC_QUESTIONS: DISCQuestion[] = [
  // D (주도형) 차원 (3문항)
  {
    id: 1,
    question: '교회에서 새로운 사역을 시작할 때 나는...',
    dimension: 'D',
    leftLabel: '다른 사람의 의견을 먼저 듣고 따른다',
    rightLabel: '내가 먼저 방향을 제시하고 이끈다',
  },
  {
    id: 2,
    question: '소그룹에서 의견이 갈릴 때 나는...',
    dimension: 'D',
    leftLabel: '화합을 위해 양보하는 편이다',
    rightLabel: '옳다고 생각하면 설득하려 한다',
  },
  {
    id: 3,
    question: '어려운 결정을 내려야 할 때 나는...',
    dimension: 'D',
    leftLabel: '신중히 시간을 두고 결정한다',
    rightLabel: '빠르게 결단하고 행동으로 옮긴다',
  },
  // I (사교형) 차원 (3문항)
  {
    id: 4,
    question: '교회 행사에서 나는...',
    dimension: 'I',
    leftLabel: '정해진 역할을 묵묵히 수행한다',
    rightLabel: '분위기를 띄우고 사람들과 어울린다',
  },
  {
    id: 5,
    question: '새로운 교인이 왔을 때 나는...',
    dimension: 'I',
    leftLabel: '시간을 두고 천천히 다가간다',
    rightLabel: '먼저 다가가 반갑게 인사한다',
  },
  {
    id: 6,
    question: '전도할 때 나의 스타일은...',
    dimension: 'I',
    leftLabel: '조용히 행동으로 보여주는 삶의 전도',
    rightLabel: '열정적으로 말씀을 나누며 대화하기',
  },
  // S (안정형) 차원 (3문항)
  {
    id: 7,
    question: '교회의 변화(예배 형식, 조직 개편)에 대해 나는...',
    dimension: 'S',
    leftLabel: '새로운 시도를 환영하고 기대한다',
    rightLabel: '기존 방식이 편하고 익숙한 것이 좋다',
  },
  {
    id: 8,
    question: '봉사 사역에서 나는...',
    dimension: 'S',
    leftLabel: '다양한 사역을 번갈아 경험하고 싶다',
    rightLabel: '한 가지 사역을 꾸준히 오래 하고 싶다',
  },
  {
    id: 9,
    question: '팀으로 일할 때 나는...',
    dimension: 'S',
    leftLabel: '성과와 목표 달성을 중시한다',
    rightLabel: '팀원 간의 조화와 안정을 중시한다',
  },
  // C (신중형) 차원 (3문항)
  {
    id: 10,
    question: '성경 공부를 할 때 나는...',
    dimension: 'C',
    leftLabel: '전체적인 흐름과 감동을 중시한다',
    rightLabel: '원어, 배경, 맥락을 꼼꼼히 살핀다',
  },
  {
    id: 11,
    question: '사역 계획을 세울 때 나는...',
    dimension: 'C',
    leftLabel: '대략적인 방향만 정하고 유연하게 진행한다',
    rightLabel: '세부 계획과 일정을 꼼꼼히 짠다',
  },
  {
    id: 12,
    question: '교회 재정이나 행정에 대해 나는...',
    dimension: 'C',
    leftLabel: '크게 관심 없고 믿음으로 맡긴다',
    rightLabel: '투명한 관리와 정확한 기록이 중요하다',
  },
];

export interface DISCResult {
  primary: string;
  secondary: string;
  character: string;
  name: string;
  description: string;
  strength: string;
  verse: string;
  verseRef: string;
}

export const DISC_CHARACTERS: Record<string, { name: string; description: string; strength: string; verse: string; verseRef: string }> = {
  D: {
    name: '바울 (주도형)',
    description: '확신에 차서 복음을 전하고, 어떤 상황에서도 굽히지 않는 결단력의 사도',
    strength: '추진력, 결단력, 목표 지향',
    verse: '달려갈 길과 주 예수께 받은 사명 곧 하나님의 은혜의 복음을 증언하는 일을 마치려 함에는',
    verseRef: '사도행전 20:24',
  },
  I: {
    name: '바나바 (사교형)',
    description: '사람들을 격려하고 관계를 통해 공동체를 세우는 위로의 아들',
    strength: '열정, 소통, 격려',
    verse: '그의 이름이 바나바라 번역하면 위로의 아들이라',
    verseRef: '사도행전 4:36',
  },
  S: {
    name: '아브라함 (안정형)',
    description: '오랜 기다림 속에서도 흔들리지 않고 하나님의 약속을 신뢰한 믿음의 조상',
    strength: '인내, 충실, 안정',
    verse: '아브라함이 하나님을 믿으니 이것을 그에게 의로 여기셨다',
    verseRef: '로마서 4:3',
  },
  C: {
    name: '에스라 (신중형)',
    description: '율법을 정확히 연구하고 꼼꼼히 가르친 학자형 제사장',
    strength: '정확성, 분석, 기준',
    verse: '에스라가 여호와의 율법을 연구하여 준행하며 율례와 규례를 이스라엘에게 가르치기로',
    verseRef: '에스라 7:10',
  },
};

/**
 * DISC 결과 계산
 * answers: { questionId: value(1~5) }
 * 1~2 = 왼쪽(낮음), 4~5 = 오른쪽(높음)
 */
export function calculateDISC(answers: Record<number, number>): { primary: string; secondary: string; scores: Record<string, number> } {
  const scores: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };

  DISC_QUESTIONS.forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      scores[q.dimension] += val;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores,
  };
}
