/**
 * 콘텐츠 둘러보기 안내 페이지
 * 비회원이 검사/챌린지/게임을 클릭했을 때 보여주는 미리보기 + 로그인 유도
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CONTENT_SECTIONS = [
  {
    id: 'assessment',
    icon: '🔍',
    title: '검사 / 체크리스트',
    description: '나의 성경적 성격유형, 영적 은사, 사랑의 언어를 알아보세요.',
    items: [
      { icon: '🧠', name: '성경인물 MBTI', tag: 'Free', desc: '16유형별 성경인물 매칭' },
      { icon: '🎯', name: '성경인물 DISC', tag: 'Free', desc: '행동 유형별 리더십 스타일' },
      { icon: '🕊️', name: '은사 체크리스트', tag: 'Free', desc: '고린도전서 기반 7대 은사' },
      { icon: '💕', name: '사랑의 언어 테스트', tag: 'Free', desc: '5가지 사랑의 언어 + 성경 구절' },
      { icon: '🌟', name: '자존감 테스트', tag: 'Free', desc: '성경적 정체성 기반 측정' },
      { icon: '📜', name: '나의 사명 선언문', tag: '100P', desc: 'AI가 생성하는 사명 선언문' },
    ],
  },
  {
    id: 'challenge',
    icon: '🏆',
    title: '챌린지',
    description: '포인트를 걸고 도전하세요. 완주 시 2배 보상!',
    items: [
      { icon: '🔥', name: '포인트 걸기 챌린지', tag: '인기', desc: '내 포인트를 걸고 도전 → 2배 획득' },
      { icon: '💰', name: '보증금 챌린지', tag: '인기', desc: '현금 예치 → 완주 시 환급' },
      { icon: '📅', name: '30일 신약 도전', tag: 'Free', desc: '30일 안에 신약 완독하기' },
      { icon: '👥', name: '그룹 대항전', tag: '단체', desc: '그룹 간 읽기 대결' },
    ],
  },
  {
    id: 'games',
    icon: '🎮',
    title: '성경 게임존',
    description: '오늘 분량을 읽으면 게임이 열려요!',
    items: [
      { icon: '❓', name: '성경 퀴즈 배틀', tag: '인기', desc: '읽은 범위에서 AI 자동 출제 5문제' },
      { icon: '📋', name: '성경 빙고', tag: 'Fun', desc: '5×5 빙고판 — 읽으면 칸이 채워져요' },
      { icon: '💎', name: '말씀 보물찾기', tag: '주간', desc: '매주 보물 구절을 찾으세요' },
      { icon: '🃏', name: '성경 인물 카드', tag: '수집', desc: '읽으면서 인물 카드 자동 획득' },
    ],
  },
];

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from'); // assessment, challenge, games 등

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 pb-8 pt-6">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </button>

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📖
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">콘텐츠 둘러보기</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            성경읽기와 함께 다양한 콘텐츠를 즐겨보세요.
            <br />
            회원가입 후 모든 기능을 이용할 수 있습니다.
          </p>
        </div>

        {/* 콘텐츠 섹션들 */}
        {CONTENT_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 읽기 선행 구조 안내 */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="font-bold text-amber-800">읽어야 열린다!</h3>
          </div>
          <p className="text-sm leading-relaxed text-amber-700">
            검사, 게임, 챌린지는 오늘의 성경 분량을 읽은 후에 이용할 수 있습니다.
            매일 5분만 읽으면 모든 콘텐츠가 해금됩니다.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/auth')}
            className="w-full rounded-2xl bg-blue-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
          >
            시작하기 — 로그인 / 회원가입
          </button>
          <button
            onClick={() => router.push('/home')}
            className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            먼저 성경읽기부터 할게요
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          성경읽기는 로그인 없이 자유롭게 이용 가능합니다
        </p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">로딩 중...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
