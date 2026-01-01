/**
 * 샘플 성경 본문 데이터
 * MVP용 - 실제 서비스에서는 API나 DB에서 로드
 */

import type { Passage } from '@/types';

export const SAMPLE_PASSAGES: Passage[] = [
  {
    id: 'php-1',
    title: '빌립보서 1장',
    category: 'paul',
    book: '빌립보서',
    bookCode: 'php',
    startChapter: 1,
    endChapter: 1,
    durationSec: 300, // 5분
    audioUrl: '/audio/sample.mp3',
    text: `1 그리스도 예수의 종 바울과 디모데는 그리스도 예수 안에서 빌립보에 사는 모든 성도와 감독들과 집사들에게 편지합니다.
2 하나님 우리 아버지와 주 예수 그리스도로부터 은혜와 평강이 여러분에게 있기를 바랍니다.
3 나는 여러분을 생각할 때마다 나의 하나님께 감사하며
4 여러분 모두를 위하여 기도할 때마다 항상 기쁨으로 기도합니다.
5 이것은 첫날부터 지금까지 여러분이 복음을 위한 일에 동참해 왔기 때문입니다.
6 나는 여러분 안에서 좋은 일을 시작하신 분이 그리스도 예수의 날까지 그것을 완성하실 것을 확신합니다.`,
  },
  {
    id: 'php-2',
    title: '빌립보서 2장',
    category: 'paul',
    book: '빌립보서',
    bookCode: 'php',
    startChapter: 2,
    endChapter: 2,
    durationSec: 360, // 6분
    audioUrl: '/audio/sample.mp3',
    text: `1 그러므로 그리스도 안에 무슨 권면이나 사랑의 무슨 위로나 성령의 무슨 교제나 긍휼이나 자비가 있다면
2 마음을 같이하여 같은 사랑을 가지고 뜻을 합하며 한마음을 품어 나의 기쁨을 충만하게 해 주십시오.
3 아무 일에든지 다툼이나 허영으로 하지 말고 오직 겸손한 마음으로 각각 자기보다 남을 낫게 여기십시오.
4 각자 자기 것만 돌보지 말고 남의 것도 돌보십시오.
5 너희 안에 이 마음을 품으라 곧 그리스도 예수의 마음이니
6 그는 근본 하나님의 형상이셨으나 하나님과 동등됨을 취하실 것으로 여기지 아니하시고
7 오히려 자기를 비워 종의 형상을 가지사 사람들과 같이 되셨습니다.`,
  },
  {
    id: 'php-3-4',
    title: '빌립보서 3-4장',
    category: 'paul',
    book: '빌립보서',
    bookCode: 'php',
    startChapter: 3,
    endChapter: 4,
    durationSec: 540, // 9분
    audioUrl: '/audio/sample.mp3',
    text: `3장
1 끝으로 나의 형제들아 주 안에서 기뻐하라
13 형제들아 나는 아직 내가 잡은 줄로 여기지 아니하고 오직 한 일 즉 뒤에 있는 것은 잊어버리고 앞에 있는 것을 잡으려고
14 푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라

4장
4 주 안에서 항상 기뻐하라 내가 다시 말하노니 기뻐하라
6 아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라
7 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라
13 내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라`,
  },
  {
    id: 'ps-23',
    title: '시편 23편',
    category: 'poetry',
    book: '시편',
    bookCode: 'ps',
    startChapter: 23,
    endChapter: 23,
    durationSec: 120, // 2분
    audioUrl: '/audio/sample.mp3',
    text: `1 여호와는 나의 목자시니 내게 부족함이 없으리로다
2 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다
3 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다
4 내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다
5 주께서 내 원수의 목전에서 내게 상을 차려 주시고 기름을 내 머리에 부으셨으니 내 잔이 넘치나이다
6 내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다`,
  },
  {
    id: 'jn-3',
    title: '요한복음 3장',
    category: 'gospels',
    book: '요한복음',
    bookCode: 'jn',
    startChapter: 3,
    endChapter: 3,
    durationSec: 420, // 7분
    audioUrl: '/audio/sample.mp3',
    text: `1 바리새인 중에 니고데모라 하는 사람이 있으니 유대인의 지도자라
2 그가 밤에 예수께 와서 이르되 랍비여 우리가 당신은 하나님께로부터 오신 선생인 줄 아나이다 하나님이 함께 하시지 아니하시면 당신이 행하시는 이 표적을 아무도 할 수 없음이니이다
3 예수께서 대답하여 이르시되 진실로 진실로 네게 이르노니 사람이 거듭나지 아니하면 하나님의 나라를 볼 수 없느니라
16 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라
17 하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라`,
  },
  {
    id: '1jn-4',
    title: '요한일서 4장',
    category: 'nt',
    book: '요한일서',
    bookCode: '1jn',
    startChapter: 4,
    endChapter: 4,
    durationSec: 300, // 5분
    audioUrl: '/audio/sample.mp3',
    text: `7 사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한 것이니 사랑하는 자마다 하나님으로부터 나서 하나님을 알고
8 사랑하지 아니하는 자는 하나님을 알지 못하나니 이는 하나님은 사랑이심이라
9 하나님의 사랑이 우리에게 이렇게 나타난 바 되었으니 하나님이 자기의 독생자를 세상에 보내심은 그로 말미암아 우리를 살리려 하심이라
10 사랑은 여기 있으니 우리가 하나님을 사랑한 것이 아니요 하나님이 우리를 사랑하사 우리 죄를 속하기 위하여 화목 제물로 그 아들을 보내셨음이라
18 사랑 안에 두려움이 없고 온전한 사랑이 두려움을 내쫓나니 두려움에는 형벌이 있음이라 두려워하는 자는 사랑 안에서 온전히 이루지 못하였느니라
19 우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라`,
  },
  {
    id: 'gen-1',
    title: '창세기 1장',
    category: 'pentateuch',
    book: '창세기',
    bookCode: 'gen',
    startChapter: 1,
    endChapter: 1,
    durationSec: 360, // 6분
    audioUrl: '/audio/sample.mp3',
    text: `1 태초에 하나님이 천지를 창조하시니라
2 땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라
3 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고
4 빛이 하나님이 보시기에 좋았더라 하나님이 빛과 어둠을 나누사
5 하나님이 빛을 낮이라 부르시고 어둠을 밤이라 부르시니라 저녁이 되고 아침이 되니 이는 첫째 날이니라
26 하나님이 이르시되 우리의 형상을 따라 우리의 모양대로 우리가 사람을 만들고
27 하나님이 자기 형상 곧 하나님의 형상대로 사람을 창조하시되 남자와 여자를 창조하시고
31 하나님이 지으신 그 모든 것을 보시니 보시기에 심히 좋았더라 저녁이 되고 아침이 되니 이는 여섯째 날이니라`,
  },
  {
    id: 'rom-8',
    title: '로마서 8장',
    category: 'paul',
    book: '로마서',
    bookCode: 'rom',
    startChapter: 8,
    endChapter: 8,
    durationSec: 540, // 9분
    audioUrl: '/audio/sample.mp3',
    text: `1 그러므로 이제 그리스도 예수 안에 있는 자에게는 결코 정죄함이 없나니
2 이는 그리스도 예수 안에 있는 생명의 성령의 법이 죄와 사망의 법에서 너를 해방하였음이라
28 우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라
31 그런즉 이 일에 대하여 우리가 무슨 말 하리요 만일 하나님이 우리를 위하시면 누가 우리를 대적하리요
35 누가 우리를 그리스도의 사랑에서 끊으리요 환난이나 곤고나 박해나 기근이나 적신이나 위험이나 칼이랴
37 그러나 이 모든 일에 우리를 사랑하시는 이로 말미암아 우리가 넉넉히 이기느니라
38 내가 확신하노니 사망이나 생명이나 천사들이나 권세자들이나 현재 일이나 장래 일이나 능력이나
39 높음이나 깊음이나 다른 어떤 피조물이라도 우리를 우리 주 그리스도 예수 안에 있는 하나님의 사랑에서 끊을 수 없으리라`,
  },
];

/**
 * 카테고리별 본문 필터링
 */
export function getPassagesByCategory(category: string): Passage[] {
  if (category === 'all') {
    return SAMPLE_PASSAGES;
  }
  return SAMPLE_PASSAGES.filter((p) => p.category === category);
}

/**
 * ID로 본문 조회
 */
export function getPassageById(id: string): Passage | undefined {
  return SAMPLE_PASSAGES.find((p) => p.id === id);
}

/**
 * 플랜 타입에 맞는 오늘의 본문 생성
 * MVP: 단순히 랜덤 선택 (추후 진행률 기반으로 개선)
 */
export function getTodayPassage(planType: string, category: string): Passage {
  const passages = getPassagesByCategory(category);
  const index = Math.floor(Math.random() * passages.length);
  return passages[index];
}
