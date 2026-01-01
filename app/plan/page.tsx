/**
 * 플랜 페이지
 * 오늘의 분량 확인 + 듣기 시작 / 묵상 기록
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore, usePlayerStore } from '@/stores';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils';
import { PLAN_OPTIONS, CATEGORY_OPTIONS } from '@/lib/constants';

export default function PlanPage() {
  const router = useRouter();
  const { selectedPlan, selectedCategory, todayPassage, generateTodayPassage } = usePlanStore();
  const { setPassage } = usePlayerStore();

  // 본문이 없으면 생성
  useEffect(() => {
    if (!todayPassage) {
      generateTodayPassage();
    }
  }, [todayPassage, generateTodayPassage]);

  const handleStartListening = () => {
    if (todayPassage) {
      setPassage(todayPassage);
      router.push('/player');
    }
  };

  const handleMeditation = () => {
    if (todayPassage) {
      router.push(`/meditation/new?passageId=${todayPassage.id}`);
    }
  };

  const planInfo = PLAN_OPTIONS.find((p) => p.type === selectedPlan);
  const categoryInfo = CATEGORY_OPTIONS.find((c) => c.type === selectedCategory);

  if (!todayPassage) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <Header title="오늘의 말씀" showBack />

      <div className="page-container pt-4">
        {/* 플랜 정보 */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{planInfo?.icon}</span>
          <span>{planInfo?.label}</span>
          <span>·</span>
          <span>{categoryInfo?.label}</span>
        </div>

        {/* 오늘의 본문 카드 */}
        <Card className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">{todayPassage.title}</h2>
            <p className="mt-1 text-muted-foreground">{todayPassage.book}</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>약 {formatDuration(todayPassage.durationSec)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span>오디오</span>
            </div>
          </div>
        </Card>

        {/* 본문 미리보기 */}
        <Card className="mb-6">
          <h3 className="mb-3 font-semibold">본문 미리보기</h3>
          <p className="text-ellipsis-2 text-muted-foreground">
            {todayPassage.text.slice(0, 150)}...
          </p>
        </Card>

        {/* CTA 버튼들 */}
        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={handleStartListening}>
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            듣기 시작
          </Button>

          <Button fullWidth size="lg" variant="outline" onClick={handleMeditation}>
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            묵상 기록하기
          </Button>
        </div>

        {/* 다른 본문 선택 */}
        <button
          onClick={generateTodayPassage}
          className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          다른 본문 보기
        </button>
      </div>
    </>
  );
}
