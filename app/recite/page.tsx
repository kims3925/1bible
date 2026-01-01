/**
 * 내목소리 낭독 페이지
 * MVP: 타이머 + 완료 체크
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProgressStore } from '@/stores';

export default function RecitePage() {
  const { markChapterComplete } = useProgressStore();

  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [targetBook, setTargetBook] = useState('gen');
  const [targetChapter, setTargetChapter] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsCompleted(false);
    setSeconds(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    markChapterComplete(targetBook, targetChapter);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSeconds(0);
  };

  return (
    <div className="page-container">
      <h1 className="mb-2 text-center text-2xl font-bold">내목소리 낭독</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        성경을 직접 소리내어 읽어보세요
      </p>

      {/* 타겟 선택 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">낭독 범위</h2>
        <div className="flex gap-2">
          <select
            value={targetBook}
            onChange={(e) => setTargetBook(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2"
            disabled={isActive}
          >
            <option value="gen">창세기</option>
            <option value="exo">출애굽기</option>
            <option value="mat">마태복음</option>
            <option value="jhn">요한복음</option>
            <option value="psa">시편</option>
            <option value="pro">잠언</option>
          </select>
          <select
            value={targetChapter}
            onChange={(e) => setTargetChapter(Number(e.target.value))}
            className="w-24 rounded-lg border border-border px-3 py-2"
            disabled={isActive}
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                {ch}장
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 타이머 */}
      <Card className="mb-4">
        <div className="py-8 text-center">
          <div
            className={cn(
              'mb-4 text-6xl font-bold tabular-nums',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {formatTime(seconds)}
          </div>

          {isCompleted && (
            <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
              낭독 완료! 수고하셨습니다.
            </div>
          )}

          <div className="flex justify-center gap-3">
            {!isActive && !isCompleted && (
              <Button size="lg" onClick={handleStart}>
                시작
              </Button>
            )}

            {isActive && (
              <>
                <Button size="lg" variant="outline" onClick={handlePause}>
                  일시정지
                </Button>
                <Button size="lg" onClick={handleComplete}>
                  낭독 완료
                </Button>
              </>
            )}

            {!isActive && seconds > 0 && !isCompleted && (
              <>
                <Button size="lg" onClick={() => setIsActive(true)}>
                  계속
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset}>
                  초기화
                </Button>
              </>
            )}

            {isCompleted && (
              <Button size="lg" onClick={handleReset}>
                다시 시작
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 안내 */}
      <Card>
        <h3 className="mb-2 font-semibold">낭독 팁</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>조용한 장소에서 또렷하게 읽어보세요</li>
          <li>천천히 의미를 음미하며 읽으면 더 좋습니다</li>
          <li>완료 버튼을 누르면 진도에 반영됩니다</li>
          <li className="text-xs text-muted-foreground/60">
            (녹음 기능은 추후 업데이트 예정)
          </li>
        </ul>
      </Card>
    </div>
  );
}
