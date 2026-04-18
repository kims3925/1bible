/**
 * My Page
 * 프로필 + 통계 + 묵상록 + 기도제목 + 커스터마이징 + 설정
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoginPrompt } from '@/components/ui/LoginPrompt';
import { useProgressStore, useSessionStore, useNotesStore, useAuthStore } from '@/stores';
import type { PlayMode, ContentSource } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const { getTotalProgress, getTestamentProgress, resetProgress } = useProgressStore();
  const { getTotalMinutesRead, sessionLogs } = useSessionStore();
  const { meditationNotes, prayerNotes } = useNotesStore();
  const { isLoggedIn } = useAuthStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');

  const requireLogin = (action: () => void, message: string) => {
    if (isLoggedIn) {
      action();
    } else {
      setLoginPromptMessage(message);
      setShowLoginPrompt(true);
    }
  };

  const [activeSection, setActiveSection] = useState<'stats' | 'settings' | 'data'>('stats');
  const [defaultMode, setDefaultMode] = useState<PlayMode>('listen');
  const [defaultSource, setDefaultSource] = useState<ContentSource>('pondang');
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'nature' | 'book'>('light');

  const totalProgress = getTotalProgress();
  const otProgress = getTestamentProgress('OT');
  const ntProgress = getTestamentProgress('NT');
  const totalMinutes = getTotalMinutesRead();
  const totalSessions = sessionLogs.length;
  const totalNotes = meditationNotes.length + prayerNotes.length;

  // 스트릭 계산
  const streak = (() => {
    if (sessionLogs.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDates = new Set<string>();
    sessionLogs.forEach((log) => {
      sessionDates.add(new Date(log.startedAt).toDateString());
    });
    let count = 0;
    const checkDate = new Date(today);
    while (sessionDates.has(checkDate.toDateString())) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count;
  })();

  const handleResetProgress = () => {
    if (confirm('정말 모든 진도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetProgress();
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      progress: localStorage.getItem('lazy-bible-progress'),
      sessions: localStorage.getItem('lazy-bible-sessions'),
      notes: localStorage.getItem('lazy-bible-notes'),
      plan: localStorage.getItem('lazy-bible-plan'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lazybible-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <h1 className="mb-2 text-center text-2xl font-bold">My Page</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        나의 성경읽기 여정
      </p>

      {/* 프로필 카드 */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-400 text-2xl font-bold text-white">
            {streak > 0 ? streak : '?'}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold">게으른 성경독자</div>
            <div className="text-sm text-muted-foreground">
              {streak > 0 ? `${streak}일 연속 읽기 중` : '오늘 첫 읽기를 시작해보세요'}
            </div>
            <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Lv.{Math.floor(totalMinutes / 60) + 1}
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {totalProgress}% 완료
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 통계 그리드 */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <div className="text-2xl font-bold text-blue-600">{totalProgress}%</div>
          <div className="text-xs text-blue-600/70">전체 진도</div>
          <ProgressBar value={totalProgress} size="sm" showLabel={false} className="mt-2" />
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {totalMinutes >= 60
              ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
              : `${totalMinutes}m`}
          </div>
          <div className="text-xs text-orange-600/70">총 읽은 시간</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4">
          <div className="text-2xl font-bold text-green-600">{totalSessions}</div>
          <div className="text-xs text-green-600/70">총 세션 수</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          <div className="text-2xl font-bold text-purple-600">{totalNotes}</div>
          <div className="text-xs text-purple-600/70">묵상 노트</div>
        </div>
      </div>

      {/* 진도 요약 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">진도 요약</h2>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>구약 (39권)</span>
              <span className="font-medium">{otProgress}%</span>
            </div>
            <ProgressBar value={otProgress} showLabel={false} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>신약 (27권)</span>
              <span className="font-medium">{ntProgress}%</span>
            </div>
            <ProgressBar value={ntProgress} showLabel={false} />
          </div>
        </div>
      </Card>

      {/* 바로가기 */}
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">바로가기</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => requireLogin(() => router.push('/notes'), '묵상 노트를 보려면 로그인이 필요합니다.')}>
            내묵상노트 ({meditationNotes.length})
          </Button>
          <Button variant="outline" onClick={() => requireLogin(() => router.push('/prayers'), '기도 노트를 보려면 로그인이 필요합니다.')}>
            내기도제목 ({prayerNotes.length})
          </Button>
          <Button variant="outline" onClick={() => requireLogin(() => router.push('/history'), '묵상 기록을 보려면 로그인이 필요합니다.')}>
            묵상 기록
          </Button>
          <Button variant="outline" onClick={() => router.push('/progress')}>
            상세 진도
          </Button>
        </div>
      </Card>

      {/* 섹션 탭 */}
      <div className="mb-4 flex rounded-xl bg-muted p-1">
        {([
          { key: 'stats', label: '설정' },
          { key: 'settings', label: '테마' },
          { key: 'data', label: '데이터' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
              activeSection === key ? 'bg-white shadow' : 'text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 기본 설정 */}
      {activeSection === 'stats' && (
        <Card>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">기본 모드</label>
            <div className="flex gap-2">
              {(['listen', 'read', 'recite'] as PlayMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setDefaultMode(m)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                    defaultMode === m
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {m === 'listen' ? '듣기' : m === 'read' ? '읽기' : '낭독'}
                </button>
              ))}
            </div>
          </div>

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
      )}

      {/* 테마/커스터마이징 */}
      {activeSection === 'settings' && (
        <Card>
          <h3 className="mb-3 font-semibold">배경 테마</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'light', label: '라이트', color: 'bg-white border-2' },
              { key: 'dark', label: '다크', color: 'bg-slate-800 text-white' },
              { key: 'nature', label: '자연', color: 'bg-green-50' },
              { key: 'book', label: '북스타일', color: 'bg-amber-50' },
            ] as const).map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  'flex h-20 items-center justify-center rounded-xl border text-sm font-medium transition-all',
                  color,
                  theme === key ? 'ring-2 ring-primary ring-offset-2' : ''
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="mb-3 font-semibold">폰트 크기</h3>
            <div className="flex gap-2">
              {(['작게', '보통', '크게', '아주크게']).map((size) => (
                <button
                  key={size}
                  className="flex-1 rounded-lg border border-border py-2 text-sm hover:bg-muted"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 데이터 관리 */}
      {activeSection === 'data' && (
        <Card>
          <div className="space-y-2">
            <Button variant="outline" fullWidth onClick={handleExportData}>
              데이터 내보내기 (JSON)
            </Button>
            <Button variant="outline" fullWidth>
              데이터 가져오기
            </Button>
            <Button variant="outline" fullWidth>
              플랜 변경
            </Button>
            <Button variant="outline" fullWidth>
              시작일 재설정
            </Button>
            <hr className="my-2" />
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
      )}

      {/* 앱 정보 */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>게을러도성경일독 v0.2.0</p>
        <p className="mt-1">작심삼일 NO! 이제 작심평생</p>
      </div>

      {/* 비회원 로그인 유도 모달 */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginPromptMessage}
      />
    </div>
  );
}
