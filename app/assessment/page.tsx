/**
 * v6.0 검사/체크리스트 페이지
 * 12종 검사 목록 + 읽기 선행 잠금 + Free/Premium 분류
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ReadingLock } from '@/components/ui/ReadingLock';
import { ShareButton } from '@/components/ui/ShareButton';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePointStore } from '@/stores';
import type { Assessment, AssessmentResult } from '@/types';

const ASSESSMENTS: Assessment[] = [
  { id: 'mbti', type: 'mbti', title: '성경인물 MBTI', icon: '👑', category: 'personality', description: '16유형별 성경인물 매칭', questionCount: 16, tier: 'free', pointCost: 0 },
  { id: 'disc', type: 'disc', title: '성경인물 DISC', icon: '📊', category: 'personality', description: '행동 유형별 리더십 스타일', questionCount: 12, tier: 'free', pointCost: 0 },
  { id: 'enneagram', type: 'enneagram', title: '성경인물 에니어그램', icon: '🌟', category: 'personality', description: '9가지 성격 유형 매칭', questionCount: 18, tier: 'premium', pointCost: 100 },
  { id: 'gift', type: 'gift', title: '은사 체크리스트', icon: '🔥', category: 'spiritual', description: '고린도전서 12:4-11 기반 7대 은사', questionCount: 14, tier: 'free', pointCost: 0 },
  { id: 'maturity', type: 'maturity', title: '영성 성숙도 테스트', icon: '🙏', category: 'spiritual', description: '성령의 열매 기반 영적 성숙도 측정', questionCount: 20, tier: 'premium', pointCost: 100 },
  { id: 'love-lang', type: 'love-lang', title: '사랑의 언어 테스트', icon: '💖', category: 'self', description: '5가지 사랑의 언어 + 성경 구절 연결', questionCount: 15, tier: 'free', pointCost: 0 },
  { id: 'esteem', type: 'esteem', title: '자존감 테스트', icon: '💪', category: 'self', description: '성경적 정체성 기반 자존감 측정', questionCount: 12, tier: 'free', pointCost: 0 },
  { id: 'stress', type: 'stress', title: '스트레스 대처 유형', icon: '🧠', category: 'self', description: '시편 기반 스트레스 대처 방식 분석', questionCount: 10, tier: 'premium', pointCost: 100 },
  { id: 'couple', type: 'couple', title: '커플 영적 궁합도', icon: '💑', category: 'relationship', description: '두 사람의 영적 가치관 일치도', questionCount: 20, tier: 'premium', pointCost: 100 },
  { id: 'family', type: 'family', title: '가족 소통 유형', icon: '👨‍👩‍👧', category: 'relationship', description: '가족 구성원 간 소통 스타일', questionCount: 15, tier: 'premium', pointCost: 100 },
  { id: 'mission', type: 'mission', title: '나의 사명 선언문', icon: '🌟', category: 'mission', description: 'AI가 검사결과+성경구절로 사명 선언문 생성', questionCount: 10, tier: 'premium', pointCost: 100 },
  { id: 'bucket', type: 'bucket', title: '영적 버킷리스트', icon: '📋', category: 'mission', description: '영적 성장 실천 항목 자가진단', questionCount: 12, tier: 'free', pointCost: 0 },
];

const CATEGORY_LABELS: Record<string, string> = {
  personality: '성격',
  spiritual: '영적 은사',
  self: '자기 이해',
  relationship: '관계',
  mission: '사명',
};

// 간단한 MBTI 검사 데모 질문
const MBTI_QUESTIONS = [
  { id: 'q1', text: '기도할 때 나는...', options: [{ id: 'a', label: '혼자 조용히 기도하는 것이 좋다', value: 0 }, { id: 'b', label: '함께 기도하는 것이 더 좋다', value: 1 }] },
  { id: 'q2', text: '성경을 읽을 때 나는...', options: [{ id: 'a', label: '한 구절을 깊이 묵상한다', value: 0 }, { id: 'b', label: '전체 흐름을 빠르게 파악한다', value: 1 }] },
  { id: 'q3', text: '교회 봉사를 할 때 나는...', options: [{ id: 'a', label: '계획을 세우고 체계적으로 한다', value: 0 }, { id: 'b', label: '즉흥적으로 필요에 반응한다', value: 1 }] },
  { id: 'q4', text: '갈등 상황에서 나는...', options: [{ id: 'a', label: '논리적으로 해결하려 한다', value: 0 }, { id: 'b', label: '상대방의 감정을 먼저 헤아린다', value: 1 }] },
  { id: 'q5', text: '소그룹 나눔에서 나는...', options: [{ id: 'a', label: '주로 듣는 편이다', value: 0 }, { id: 'b', label: '적극적으로 나누는 편이다', value: 1 }] },
];

const MBTI_RESULTS: Record<string, AssessmentResult> = {
  moses: {
    type: 'INTJ', label: 'INTJ - 전략가형', characterName: '모세',
    characterDescription: '하나님의 비전을 받아 40년간 묵묵히 이스라엘을 이끈 전략적 리더',
    verseReference: '히브리서 11:27', verseText: '믿음으로 애굽을 떠나 왕의 노하심을 무서워하지 아니하고',
    traits: ['비전을 품는 리더십', '체계적 계획 수립', '인내와 끈기', '깊은 하나님과의 관계'],
    shareText: '나는 성경인물 MBTI에서 모세(INTJ) 유형!',
  },
  david: {
    type: 'ENFP', label: 'ENFP - 활동가형', characterName: '다윗',
    characterDescription: '감정이 풍부하고 창의적이며, 하나님을 향한 열정으로 시편을 노래한 왕',
    verseReference: '시편 23:1', verseText: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
    traits: ['열정적 예배자', '창의적 표현', '사람을 끌어당기는 매력', '감정의 깊이'],
    shareText: '나는 성경인물 MBTI에서 다윗(ENFP) 유형!',
  },
};

function AssessmentContent() {
  const { isFeatureUnlocked, totalPoints, spendPoints } = usePointStore();
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'premium'>('all');
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const unlocked = isFeatureUnlocked();
  const categories = [...new Set(ASSESSMENTS.map((a) => a.category))];
  const filtered = ASSESSMENTS.filter((a) => activeTab === 'all' || a.tier === activeTab);

  const handleStartAssessment = (assessment: Assessment) => {
    if (assessment.tier === 'premium' && assessment.pointCost > 0) {
      const success = spendPoints(assessment.pointCost, 'shop_purchase', `${assessment.title} 검사 이용`);
      if (!success) return;
    }
    setActiveAssessment(assessment);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQ < MBTI_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // 결과 계산 (MVP: 간단한 로직)
      const sum = newAnswers.reduce((a, b) => a + b, 0);
      setResult(sum >= 3 ? MBTI_RESULTS.david : MBTI_RESULTS.moses);
    }
  };

  // 검사 진행 중
  if (activeAssessment && !result) {
    const q = MBTI_QUESTIONS[currentQ];
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-white px-4 pb-24 pt-6">
        <div className="mb-6">
          <button onClick={() => setActiveAssessment(null)} className="mb-4 text-sm text-slate-400 hover:text-slate-600">
            ← 뒤로
          </button>
          <h2 className="text-xl font-bold">{activeAssessment.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${((currentQ + 1) / MBTI_QUESTIONS.length) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-400">{currentQ + 1}/{MBTI_QUESTIONS.length}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-6 text-lg font-semibold text-slate-800">{q.text}</h3>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.value)}
                className="w-full rounded-2xl border-2 border-slate-100 bg-white p-5 text-left text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (activeAssessment && result) {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-blue-50 to-white px-4 pb-24 pt-6">
        <button onClick={() => { setActiveAssessment(null); setResult(null); }} className="mb-4 text-sm text-slate-400 hover:text-slate-600">
          ← 검사 목록
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 text-center">
            <div className="mb-2 text-5xl">{activeAssessment.icon}</div>
            <h2 className="text-xl font-bold text-slate-800">{result.label}</h2>
            <p className="text-lg font-semibold text-blue-600">{result.characterName}</p>
          </div>

          <p className="mb-4 text-sm text-slate-600">{result.characterDescription}</p>

          <div className="mb-4 rounded-xl bg-blue-50 p-4">
            <div className="text-xs font-medium text-blue-700">{result.verseReference}</div>
            <div className="mt-1 text-sm italic text-blue-800">&ldquo;{result.verseText}&rdquo;</div>
          </div>

          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">주요 특성</h4>
            <div className="flex flex-wrap gap-2">
              {result.traits.map((trait) => (
                <span key={trait} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{trait}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <ShareButton
              title={result.shareText}
              description={`${result.characterDescription} - 게을러도성경일독`}
              contentType="assessment-result"
              size="md"
            />
            <button
              onClick={() => { setActiveAssessment(null); setResult(null); }}
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-400"
            >
              다른 검사 하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 검사 목록
  return (
    <ReadingLock featureName="검사/체크리스트">
      <div className="mx-auto min-h-screen max-w-lg bg-slate-50 px-4 pb-24 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">검사/체크리스트</h1>
        <p className="mb-6 text-sm text-slate-500">성경인물과 함께 나를 발견하세요</p>

        {/* 탭 */}
        <div className="mb-6 flex rounded-xl bg-white p-1 shadow-sm">
          {[
            { key: 'all' as const, label: '전체 12종' },
            { key: 'free' as const, label: 'Free 6종' },
            { key: 'premium' as const, label: 'Premium 6종' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-all',
                activeTab === tab.key ? 'bg-blue-500 text-white shadow' : 'text-slate-500'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 보유 포인트 */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5">
          <span className="text-sm text-amber-800">보유 포인트</span>
          <span className="text-lg font-bold text-amber-600">{totalPoints}P</span>
        </div>

        {/* 카테고리별 검사 목록 */}
        {categories.map((cat) => {
          const catAssessments = filtered.filter((a) => a.category === cat);
          if (catAssessments.length === 0) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">{CATEGORY_LABELS[cat]}</h3>
              <div className="space-y-2">
                {catAssessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => handleStartAssessment(assessment)}
                    className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  >
                    <span className="text-3xl">{assessment.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{assessment.title}</div>
                      <div className="text-xs text-slate-400">{assessment.description}</div>
                      <div className="mt-1 text-[10px] text-slate-400">{assessment.questionCount}문항</div>
                    </div>
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                      assessment.tier === 'free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    )}>
                      {assessment.tier === 'free' ? 'FREE' : `${assessment.pointCost}P`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ReadingLock>
  );
}

export default function AssessmentPage() {
  return (
    <RequireAuth from="assessment">
      <AssessmentContent />
    </RequireAuth>
  );
}
