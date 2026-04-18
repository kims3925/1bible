/**
 * 성경인물 MBTI 검사 문항 데이터
 * 12문항 × 5점 척도 → 4가지 차원 (E/I, S/N, T/F, J/P) → 16유형
 */

export interface MBTIQuestion {
  id: number;
  question: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  /** leftLabel = 왼쪽(1점) 성향, rightLabel = 오른쪽(5점) 성향 */
  leftLabel: string;
  rightLabel: string;
}

export const MBTI_QUESTIONS: MBTIQuestion[] = [
  // E/I 차원 (3문항)
  {
    id: 1,
    question: '예배 후 교제 시간에 나는...',
    dimension: 'EI',
    leftLabel: '여러 사람과 어울리며 에너지를 얻는다',
    rightLabel: '조용히 혼자만의 시간을 갖고 싶다',
  },
  {
    id: 2,
    question: '기도할 때 나는...',
    dimension: 'EI',
    leftLabel: '함께 모여 큰 소리로 기도할 때 집중이 잘 된다',
    rightLabel: '혼자 조용한 곳에서 묵상 기도할 때 은혜롭다',
  },
  {
    id: 3,
    question: '성경 공부 모임에서 나는...',
    dimension: 'EI',
    leftLabel: '적극적으로 의견을 나누며 배운다',
    rightLabel: '깊이 생각하며 조용히 들을 때 더 잘 이해한다',
  },
  // S/N 차원 (3문항)
  {
    id: 4,
    question: '성경 말씀을 읽을 때 나는...',
    dimension: 'SN',
    leftLabel: '역사적 배경과 구체적 사건에 집중한다',
    rightLabel: '말씀 뒤에 숨겨진 영적 의미와 상징을 찾는다',
  },
  {
    id: 5,
    question: '교회 사역을 선택할 때 나는...',
    dimension: 'SN',
    leftLabel: '실질적으로 도움이 되는 봉사 (식사준비, 주차 등)를 선호한다',
    rightLabel: '새로운 사역을 기획하고 비전을 세우는 일에 끌린다',
  },
  {
    id: 6,
    question: '설교를 들을 때 나는...',
    dimension: 'SN',
    leftLabel: '구체적 적용점과 실제 사례가 있으면 좋다',
    rightLabel: '큰 그림과 영적 통찰을 주는 메시지가 좋다',
  },
  // T/F 차원 (3문항)
  {
    id: 7,
    question: '교회 내 갈등 상황에서 나는...',
    dimension: 'TF',
    leftLabel: '공정한 원칙에 따라 판단하는 것이 중요하다',
    rightLabel: '서로의 감정을 이해하고 화해하는 것이 우선이다',
  },
  {
    id: 8,
    question: '어려운 형제/자매를 도울 때 나는...',
    dimension: 'TF',
    leftLabel: '현실적인 해결책과 계획을 함께 세워준다',
    rightLabel: '먼저 마음을 공감하고 함께 기도한다',
  },
  {
    id: 9,
    question: '하나님의 뜻을 분별할 때 나는...',
    dimension: 'TF',
    leftLabel: '말씀의 원칙과 논리적 판단을 따른다',
    rightLabel: '성령의 감동과 마음의 평안을 중시한다',
  },
  // J/P 차원 (3문항)
  {
    id: 10,
    question: '성경 통독 계획에 대해 나는...',
    dimension: 'JP',
    leftLabel: '체계적인 계획을 세우고 정해진 날짜에 맞춘다',
    rightLabel: '그날의 기분과 상황에 따라 유연하게 읽는다',
  },
  {
    id: 11,
    question: '교회 행사나 수련회 준비 시 나는...',
    dimension: 'JP',
    leftLabel: '미리 계획을 세우고 준비하는 편이다',
    rightLabel: '즉흥적으로 대응하며 유연하게 진행한다',
  },
  {
    id: 12,
    question: '매일 QT(묵상) 시간에 대해 나는...',
    dimension: 'JP',
    leftLabel: '정해진 시간과 장소에서 규칙적으로 한다',
    rightLabel: '때와 장소에 구애받지 않고 자유롭게 한다',
  },
];

/** MBTI 16유형별 성경인물 매칭 */
export interface MBTIResult {
  type: string;
  name: string;
  character: string;
  description: string;
  verse: string;
  verseRef: string;
}

export const MBTI_RESULTS: Record<string, MBTIResult> = {
  ISTJ: { type: 'ISTJ', name: '모세', character: '충실한 율법 수호자', description: '원칙에 따라 백성을 이끌고 하나님의 율법을 꼼꼼히 전달한 지도자', verse: '네 마음을 다하고 뜻을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라', verseRef: '신명기 6:5' },
  ISFJ: { type: 'ISFJ', name: '룻', character: '헌신적인 동반자', description: '시어머니를 향한 변함없는 사랑과 묵묵한 헌신의 본보기', verse: '어머니의 백성이 나의 백성이 되고 어머니의 하나님이 나의 하나님이 되시리니', verseRef: '룻기 1:16' },
  INFJ: { type: 'INFJ', name: '예레미야', character: '눈물의 선지자', description: '깊은 통찰과 사명감으로 하나님의 뜻을 전한 영적 비전가', verse: '너를 모태에 짓기 전에 내가 너를 알았고 네가 배에서 나오기 전에 내가 너를 성별하였고', verseRef: '예레미야 1:5' },
  INTJ: { type: 'INTJ', name: '솔로몬', character: '전략적 지혜자', description: '독보적인 지혜와 체계적 사고로 이스라엘을 번영시킨 왕', verse: '지혜가 제일이니 지혜를 얻으라 네가 가진 모든 소유를 다 주고라도 명철을 얻으라', verseRef: '잠언 4:7' },
  ISTP: { type: 'ISTP', name: '기드온', character: '실전형 용사', description: '상황을 냉정히 분석하고 적시에 행동한 겸손한 전사', verse: '내가 나팔을 불리니 너희도 진 사방에서 나팔을 불며', verseRef: '사사기 7:18' },
  ISFP: { type: 'ISFP', name: '요나단', character: '의리의 친구', description: '다윗을 향한 변함없는 우정과 아름다운 신의를 보여준 왕자', verse: '요나단이 다윗을 자기 생명같이 사랑하므로', verseRef: '사무엘상 18:3' },
  INFP: { type: 'INFP', name: '요한', character: '사랑의 사도', description: '예수님의 사랑을 깊이 체험하고 전한 감성적 비전가', verse: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니', verseRef: '요한복음 3:16' },
  INTP: { type: 'INTP', name: '누가', character: '학자형 의사', description: '꼼꼼한 조사와 논리적 기록으로 복음을 체계화한 지성인', verse: '처음부터 모든 일을 자세히 살핀 나도 차례대로 써 보내는 것이 좋은 줄 알았노니', verseRef: '누가복음 1:3' },
  ESTP: { type: 'ESTP', name: '삼손', character: '행동파 영웅', description: '즉각적 행동과 대담함으로 이스라엘을 구한 힘의 사사', verse: '여호와의 영이 그 위에 강하게 임하매', verseRef: '사사기 14:6' },
  ESFP: { type: 'ESFP', name: '다윗 (찬양)', character: '열정의 찬양자', description: '온 마음으로 춤추며 찬양한 감성 넘치는 예배자', verse: '다윗이 여호와 앞에서 힘을 다하여 춤을 추니라', verseRef: '사무엘하 6:14' },
  ENFP: { type: 'ENFP', name: '바나바', character: '격려의 사도', description: '다른 이들의 가능성을 발견하고 격려한 열정적 동역자', verse: '그의 이름이 바나바라 번역하면 위로의 아들이라', verseRef: '사도행전 4:36' },
  ENTP: { type: 'ENTP', name: '바울', character: '논쟁의 사도', description: '날카로운 논리와 창의적 사고로 복음을 변증한 전략가', verse: '나에게는 사는 것이 그리스도니 죽는 것도 유익함이라', verseRef: '빌립보서 1:21' },
  ESTJ: { type: 'ESTJ', name: '느헤미야', character: '실행의 리더', description: '체계적 계획과 강력한 리더십으로 성벽을 재건한 조직가', verse: '자, 일어나 건축하자 하매 모두 힘을 내어 이 선한 일을 하니라', verseRef: '느헤미야 2:18' },
  ESFJ: { type: 'ESFJ', name: '드보라', character: '돌보는 지도자', description: '공동체를 위해 지혜와 용기로 이스라엘을 이끈 여사사', verse: '이스라엘에 어머니가 일어났으니 곧 나 드보라로다', verseRef: '사사기 5:7' },
  ENFJ: { type: 'ENFJ', name: '예수님', character: '사랑의 스승', description: '사랑과 가르침으로 세상을 변화시킨 완전한 리더', verse: '서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라', verseRef: '요한복음 13:34' },
  ENTJ: { type: 'ENTJ', name: '여호수아', character: '정복의 장군', description: '확고한 비전과 결단력으로 가나안을 정복한 전략적 지휘관', verse: '강하고 담대하라 두려워하지 말며 놀라지 말라', verseRef: '여호수아 1:9' },
};

/**
 * MBTI 결과 계산
 * answers: { questionId: value(1~5) }
 * 1~2 = 왼쪽 성향, 4~5 = 오른쪽 성향, 3 = 중립
 */
export function calculateMBTI(answers: Record<number, number>): string {
  const dims = { EI: 0, SN: 0, TF: 0, JP: 0 };

  MBTI_QUESTIONS.forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      // 1~2 = 왼쪽(첫 글자), 4~5 = 오른쪽(둘째 글자)
      dims[q.dimension] += val - 3; // -2~+2 범위
    }
  });

  const E_I = dims.EI <= 0 ? 'E' : 'I';
  const S_N = dims.SN <= 0 ? 'S' : 'N';
  const T_F = dims.TF <= 0 ? 'T' : 'F';
  const J_P = dims.JP <= 0 ? 'J' : 'P';

  return `${E_I}${S_N}${T_F}${J_P}`;
}
