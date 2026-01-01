/**
 * My Page
 * 설정 + 플랜 관리 + 데이터
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProgressStore, useSessionStore, useNotesStore } from '@/stores';
import type { PlayMode, ContentSource } from '@/types';

export default function MyPage() {
  const { getTotalProgress, resetProgress } = useProgressStore();
  const { getTotalMinutesRead, sessionLogs } = useSessionStore();
  const { meditationNotes, prayerNotes } = useNotesStore();

  const [defaultMode, setDefaultMode] = useState<PlayMode>('listen');
  const [defaultSource, setDefaultSource] = useState<ContentSource>('pondang');
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);

  const totalProgress = getTotalProgress();
  const totalMinutes = getTotalMinutesRead();
  const totalSessions = sessionLogs.length;
  const totalNotes = meditationNotes.length + prayerNotes.length;

  const handleResetProgress = () => {
    if (confirm('정말 모든 진도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetProgress();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">My Page</h1>

      {/* 통계 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">내 통계</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalProgress}%</div>
            <div className="text-xs text-muted-foreground">전체 진도</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                : `${totalMinutes}m`}
            </div>
            <div className="text-xs text-muted-foreground">총 읽은 시간</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">총 세션 수</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalNotes}</div>
            <div className="text-xs text-muted-foreground">묵상 노트</div>
          </div>
        </div>
      </Card>

      {/* 기본 설정 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">기본 설정</h2>

        {/* 기본 모드 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">기본 모드</label>
          <div className="flex gap-2">
            {(['listen', 'read', 'recite'] as PlayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDefaultMode(mode)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                  defaultMode === mode
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-muted'
                )}
              >
                {mode === 'listen' ? '듣기' : mode === 'read' ? '읽기' : '낭독'}
              </button>
            ))}
          </div>
        </div>

        {/* 기본 소스 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">기본 소스</label>
          <select
            value={defaultSource}
            onChange={(e) => setDefaultSource(e.target.value as ContentSource)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="pondang">본당 (Pondang)</option>
            <option value="dramabible">드라마바이블</option>
            <option value="youtube">YouTube</option>
            <option value="text">텍스트만</option>
          </select>
        </div>

        {/* 기본 배속 */}
        <div>
          <label className="mb-2 block text-sm font-medium">기본 배속</label>
          <div className="flex gap-2">
            {[1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => setDefaultSpeed(speed)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                  defaultSpeed === speed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-muted'
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 플랜 관리 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">플랜 관리</h2>

        <div className="space-y-2">
          <Button variant="outline" fullWidth>
            일독 플랜 변경
          </Button>
          <Button variant="outline" fullWidth>
            시작일 재설정
          </Button>
        </div>
      </Card>

      {/* 데이터 관리 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">데이터 관리</h2>

        <div className="space-y-2">
          <Button variant="outline" fullWidth>
            데이터 내보내기 (JSON)
          </Button>
          <Button variant="outline" fullWidth>
            데이터 가져오기
          </Button>
          <Button
            variant="outline"
            fullWidth
            className="text-destructive hover:bg-destructive/10"
            onClick={handleResetProgress}
          >
            모든 데이터 초기화
          </Button>
        </div>
      </Card>

      {/* 앱 정보 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>게을러도성경일독 v0.1.0</p>
        <p className="mt-1">작심삼일 NO! 이제 작심평생</p>
      </div>
    </div>
  );
}
