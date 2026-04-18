/**
 * v6.0 성경 게임존
 * 퀴즈배틀 / 빙고 / 보물찾기 / 은혜릴레이 / 인물카드
 * 읽기 완료 후에만 플레이 가능
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ReadingLock } from '@/components/ui/ReadingLock';
import { ShareButton } from '@/components/ui/ShareButton';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePointStore } from '@/stores';
import type { GameType, QuizQuestion } from '@/types';

const GAMES: { type: GameType; title: string; icon: string; description: string; reward: string }[] = [
  { type: 'quiz', title: '성경 퀴즈 배틀', icon: '🧠', description: '읽은 범위에서 AI 자동 출제 5문제', reward: '정답당 3P + 퀴즈왕 배지' },
  { type: 'bingo', title: '성경 빙고', icon: '🎯', description: '5x5 빙고판에 성경책. 읽으면 칸 채워짐', reward: '1줄 30P / 풀빙고 300P' },
  { type: 'treasure', title: '말씀 보물찾기', icon: '💎', description: '매주 보물 구절 설정. 발견 시 포인트', reward: '선착순 50/30/20P' },
  { type: 'relay', title: '은혜 릴레이', icon: '🔗', description: '은혜 구절 → 다음 사람에게 전달', reward: '3명 x2 / 5명 x3 / 10명 x5' },
  { type: 'cards', title: '성경 인물 카드 수집', icon: '🃏', description: '읽으면서 등장 인물 카드 자동 획득', reward: '세트 완성 100P' },
];

const DEMO_QUESTIONS: QuizQuestion[] = [
  { id: 'dq1', bookId: 'genesis', chapter: 1, question: '하나님이 첫째 날에 창조하신 것은?', options: ['빛', '하늘', '바다', '동물'], correctIndex: 0, explanation: '창세기 1:3 "하나님이 이르시되 빛이 있으라 하시니 빛이 있었고"' },
  { id: 'dq2', bookId: 'genesis', chapter: 3, question: '선악과를 먹은 후 아담과 하와가 한 것은?', options: ['숨었다', '도망갔다', '울었다', '잠들었다'], correctIndex: 0, explanation: '창세기 3:8 "아담과 그의 아내가 여호와 하나님의 낯을 피하여 동산 나무 사이에 숨은지라"' },
  { id: 'dq3', bookId: 'genesis', chapter: 6, question: '노아의 방주를 만든 나무는?', options: ['백향목', '잣나무', '감나무', '올리브나무'], correctIndex: 1, explanation: '창세기 6:14 "너는 잣나무로 너를 위하여 방주를 만들되"' },
  { id: 'dq4', bookId: 'john', chapter: 3, question: '요한복음 3:16에서 "하나님이 세상을 이처럼 사랑하사" 다음 구절은?', options: ['독생자를 주셨으니', '은혜를 베푸사', '천국을 예비하사', '말씀을 주셨으니'], correctIndex: 0, explanation: '요한복음 3:16 "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니"' },
  { id: 'dq5', bookId: 'psalm', chapter: 23, question: '시편 23편에서 여호와를 무엇에 비유하는가?', options: ['왕', '목자', '전사', '선생'], correctIndex: 1, explanation: '시편 23:1 "여호와는 나의 목자시니 내게 부족함이 없으리로다"' },
];

function GamesContent() {
  const { earnPoints } = usePointStore();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const handleQuizAnswer = (index: number) => {
    if (quizAnswered !== null) return;
    setQuizAnswered(index);
    const correct = index === DEMO_QUESTIONS[quizIndex].correctIndex;
    if (correct) {
      setQuizScore(quizScore + 1);
      earnPoints(3, 'quiz_correct', `퀴즈 정답 (${quizIndex + 1}번)`);
    }

    setTimeout(() => {
      if (quizIndex < DEMO_QUESTIONS.length - 1) {
        setQuizIndex(quizIndex + 1);
        setQuizAnswered(null);
      } else {
        setQuizDone(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(null);
    setQuizDone(false);
    setActiveGame(null);
  };

  // 퀴즈 결과
  if (activeGame === 'quiz' && quizDone) {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-amber-50 to-white px-4 pb-24 pt-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-5xl">{quizScore >= 4 ? '🏆' : quizScore >= 2 ? '👏' : '📖'}</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">{quizScore}/{DEMO_QUESTIONS.length} 정답!</h2>
          <p className="mb-2 text-sm text-slate-500">{quizScore * 3}P 획득</p>
          <p className="mb-6 text-sm text-slate-400">
            {quizScore >= 4 ? '놀라운 성경 지식이네요!' : quizScore >= 2 ? '잘하셨어요!' : '다시 도전해보세요!'}
          </p>
          <div className="flex gap-2">
            <ShareButton
              title={`성경 퀴즈 ${quizScore}/${DEMO_QUESTIONS.length} 정답!`}
              description="게을러도성경일독 퀴즈에 도전하세요"
              contentType="game-result"
              size="md"
              className="flex-1 justify-center rounded-xl border py-3"
            />
            <button onClick={resetQuiz} className="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-400">
              게임 목록
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 진행
  if (activeGame === 'quiz') {
    const q = DEMO_QUESTIONS[quizIndex];
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-white px-4 pb-24 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => setActiveGame(null)} className="text-sm text-slate-400">← 뒤로</button>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{quizScore * 3}P</span>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${((quizIndex + 1) / DEMO_QUESTIONS.length) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-400">{quizIndex + 1}/{DEMO_QUESTIONS.length}</span>
        </div>

        <h3 className="mb-6 text-lg font-bold text-slate-800">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = quizAnswered === i;
            return (
              <button
                key={i}
                onClick={() => handleQuizAnswer(i)}
                disabled={quizAnswered !== null}
                className={cn(
                  'w-full rounded-2xl border-2 p-4 text-left text-sm font-medium transition-all',
                  quizAnswered === null && 'border-slate-100 hover:border-blue-300 hover:bg-blue-50',
                  quizAnswered !== null && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                  quizAnswered !== null && isSelected && !isCorrect && 'border-red-500 bg-red-50 text-red-800',
                  quizAnswered !== null && !isSelected && !isCorrect && 'border-slate-100 opacity-50',
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {quizAnswered !== null && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {q.explanation}
          </div>
        )}
      </div>
    );
  }

  // 게임 목록
  return (
    <ReadingLock featureName="성경 게임존">
      <div className="mx-auto min-h-screen max-w-lg bg-slate-50 px-4 pb-24 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">성경 게임존</h1>
        <p className="mb-6 text-sm text-slate-500">오늘 읽기 완료 후 게임을 즐기세요!</p>

        <div className="space-y-3">
          {GAMES.map((game) => (
            <button
              key={game.type}
              onClick={() => {
                if (game.type === 'quiz') {
                  setActiveGame('quiz');
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizAnswered(null);
                  setQuizDone(false);
                }
              }}
              className="flex w-full items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-4xl">{game.icon}</span>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-800">{game.title}</div>
                <div className="text-xs text-slate-500">{game.description}</div>
                <div className="mt-1 text-[10px] font-medium text-amber-600">{game.reward}</div>
              </div>
              {game.type === 'quiz' ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">PLAY</span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">SOON</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </ReadingLock>
  );
}

export default function GamesPage() {
  return (
    <RequireAuth from="games">
      <GamesContent />
    </RequireAuth>
  );
}
