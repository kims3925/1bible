/**
 * 성경읽기 메인 홈 — v6.0 새 홈 화면
 * 비회원도 접근 가능 — 성경읽기는 자유, 개인저장 시 로그인 유도
 *
 * 8개 컴포넌트 구성 (PRD-H01~H08):
 *   H01: TopStatusBar — 스트릭/포인트/공유
 *   H02: TodayStepCard — "오늘의 한 걸음" CTA
 *   H03: QuickTimeSelector — 빠른 시간 선택
 *   H04: LockedFeatureGrid — 읽기 선행 잠금/해금 그리드
 *   H05: TodayVerseCard — 오늘의 말씀
 *   H06: SocialFeedStrip — 함께 읽는 사람들 피드
 *   H07: ProgressStrip — 진도 요약
 *   H08: ExpandableMoreOptions — 더보기 (접힘/펼침)
 *
 * 핵심 상태: isCompletedToday (읽기 완료 여부)가 모든 컴포넌트의 before/after 전환을 제어
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import {
  TopStatusBar,
  TodayStepCard,
  QuickTimeSelector,
  LockedFeatureGrid,
  TodayVerseCard,
  SocialFeedStrip,
  ProgressStrip,
  ExpandableMoreOptions,
} from '@/components/home';
import { usePointStore } from '@/stores/usePointStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { usePlanStore } from '@/stores/usePlanStore';

// 오늘의 말씀 구절 (TODO: DB/API에서 가져오기)
const TODAY_VERSE = {
  text: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
  reference: '시편 23:1',
};

export default function HomePage() {
  const router = useRouter();

  // Zustand stores
  const {
    totalPoints,
    todayReadingCompleted,
    isFeatureUnlocked,
    resetDailyReading,
  } = usePointStore();

  const {
    getTestamentProgress,
    getTotalProgress,
  } = useProgressStore();

  const { currentSession } = useSessionStore();

  const { todayPassage, generateTodayPassage } = usePlanStore();

  // 날짜 변경 시 읽기 상태 리셋
  useEffect(() => {
    resetDailyReading();
  }, [resetDailyReading]);

  // 오늘의 분량 생성
  useEffect(() => {
    if (!todayPassage) {
      generateTodayPassage();
    }
  }, [todayPassage, generateTodayPassage]);

  const isCompleted = todayReadingCompleted;
  const isUnlocked = isFeatureUnlocked();

  // 오늘 분량 데이터
  const todayPlan = todayPassage
    ? {
        bookId: todayPassage.bookCode,
        bookName: todayPassage.book,
        chapterRange: `${todayPassage.startChapter}${todayPassage.endChapter > todayPassage.startChapter ? `~${todayPassage.endChapter}` : ''}장`,
        estimatedMinutes: Math.ceil(todayPassage.durationSec / 60) || 10,
      }
    : {
        bookId: 'gen',
        bookName: '창세기',
        chapterRange: '1~3장',
        estimatedMinutes: 10,
      };

  // 읽기 상태 결정: before / during / after
  const getReadingState = (): 'before' | 'during' | 'after' => {
    if (isCompleted) return 'after';
    if (currentSession) return 'during';
    return 'before';
  };

  // 진행률 (진행 중인 세션)
  const sessionProgress = currentSession
    ? Math.min(
        (Date.now() - currentSession.startedAt) /
          (currentSession.minutesTarget * 60 * 1000),
        0.95
      )
    : 0;

  // 스트릭 계산 (TODO: Supabase에서 가져오기, 현재는 localStorage 기반)
  const streakDays = usePointStore((s) => {
    // 간단 계산: todayReadingCompleted가 true면 최소 1일
    return s.todayReadingCompleted ? Math.max(1, s.history.filter(h => h.reason === 'reading_complete').length) : 0;
  });

  // 전체 / 신약 진도
  const overallProgress = getTotalProgress() / 100;
  const ntProgress = getTestamentProgress('NT') / 100;

  // --- Handlers ---

  const handleStartReading = useCallback(() => {
    if (todayPassage) {
      router.push(`/session?book=${todayPassage.bookCode}&chapter=${todayPassage.startChapter}`);
    } else {
      router.push('/session');
    }
  }, [router, todayPassage]);

  const handleContinueReading = useCallback(() => {
    router.push('/session');
  }, [router]);

  const handleQuickTimeSelect = useCallback((minutes: number) => {
    router.push(`/session?minutes=${minutes}`);
  }, [router]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '게을러도 성경읽기',
          text: isCompleted
            ? `오늘 ${todayPlan.bookName} ${todayPlan.chapterRange}을 읽었어요! 🔥${streakDays}일 연속`
            : '함께 성경을 읽어요!',
          url: 'https://bible.hublink.im',
        });
      } catch {
        // 공유 취소
      }
    }
  }, [isCompleted, todayPlan, streakDays]);

  const handleVerseShare = useCallback(() => {
    // 공유 이벤트 트래킹은 TodayVerseCard 내부에서 처리
  }, []);

  const handleEncourage = useCallback(async () => {
    // TODO: Supabase encouragement insert
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50">
      {/* H01: 상단 상태바 */}
      <TopStatusBar
        streakDays={streakDays}
        isCompletedToday={isCompleted}
        points={totalPoints}
        pointsDelta={isCompleted ? 10 : undefined}
        streakAtRisk={!isCompleted && streakDays > 0}
        onShareClick={handleShare}
        onPointsClick={() => router.push('/shop')}
        onStreakClick={() => router.push('/progress')}
      />

      {/* 메인 콘텐츠 */}
      <div className="px-4 pb-28 pt-4">
        {/* H02: 오늘의 한 걸음 CTA */}
        <TodayStepCard
          state={getReadingState()}
          plan={todayPlan}
          progress={sessionProgress}
          pointsReward={10}
          streakDays={streakDays}
          onStart={handleStartReading}
          onContinue={handleContinueReading}
          onStartMeditation={() => router.push('/meditation/new')}
        />

        {/* H03: 빠른 시간 선택 (읽기 완료 전에만 표시) */}
        {!isCompleted && (
          <QuickTimeSelector
            onQuickSelect={handleQuickTimeSelect}
            onMoreClick={() => router.push('/session?mode=custom')}
          />
        )}

        {/* H04: 읽기 선행 잠금 그리드 */}
        <LockedFeatureGrid
          isUnlocked={isUnlocked}
          points={totalPoints}
        />

        {/* H05: 오늘의 말씀 */}
        <TodayVerseCard
          verse={TODAY_VERSE}
          hasReadToday={isCompleted}
          onShare={handleVerseShare}
          onMeditate={() => router.push('/meditation/new')}
        />

        {/* H06: 함께 읽는 사람들 (읽기 완료 후에만) */}
        <SocialFeedStrip
          activities={[]}
          isVisible={isCompleted}
          onEncourage={handleEncourage}
        />

        {/* H07: 진도 요약 */}
        <ProgressStrip
          overall={overallProgress}
          newTestament={ntProgress}
          readChapterCount={Math.round(overallProgress * 1189)}
        />

        {/* H08: 더보기 (접기/펼치기) */}
        <ExpandableMoreOptions />
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
