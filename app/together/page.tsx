/**
 * 함께읽기 페이지
 * 커플읽기 / 소그룹읽기
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CheckinStatus {
  name: string;
  status: 'done' | 'pending';
  time?: string;
}

function TogetherContent() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') === 'smallgroup' ? 'smallgroup' : 'couple';

  const [activeTab, setActiveTab] = useState<'couple' | 'smallgroup'>(defaultType);
  const [myCheckin, setMyCheckin] = useState(false);

  // 더미 데이터
  const couplePartner: CheckinStatus = {
    name: '사랑하는 배우자',
    status: 'pending',
  };

  const groupMembers: CheckinStatus[] = [
    { name: '김철수', status: 'done', time: '오전 7:30' },
    { name: '이영희', status: 'done', time: '오전 8:15' },
    { name: '박민수', status: 'pending' },
    { name: '정수진', status: 'pending' },
  ];

  const handleCheckin = () => {
    setMyCheckin(true);
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">함께읽기</h1>

      {/* 탭 */}
      <div className="mb-6 flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setActiveTab('couple')}
          className={cn(
            'flex-1 rounded-lg py-3 text-sm font-medium transition-all',
            activeTab === 'couple'
              ? 'bg-white shadow'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          커플읽기
        </button>
        <button
          onClick={() => setActiveTab('smallgroup')}
          className={cn(
            'flex-1 rounded-lg py-3 text-sm font-medium transition-all',
            activeTab === 'smallgroup'
              ? 'bg-white shadow'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          소그룹읽기
        </button>
      </div>

      {/* 커플 읽기 */}
      {activeTab === 'couple' && (
        <div>
          <Card className="mb-4">
            <div className="mb-4 text-center">
              <div className="mb-2 text-6xl">💑</div>
              <h2 className="text-lg font-semibold">함께 말씀을 읽어요</h2>
              <p className="text-sm text-muted-foreground">
                오늘 체크인을 하면 배우자에게 알림이 갑니다
              </p>
            </div>

            <div className="mb-4 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{couplePartner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {couplePartner.status === 'done' ? '체크인 완료' : '대기 중'}
                  </div>
                </div>
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-lg',
                    couplePartner.status === 'done'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {couplePartner.status === 'done' ? '✓' : '⏳'}
                </div>
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleCheckin}
              disabled={myCheckin}
              variant={myCheckin ? 'secondary' : 'primary'}
            >
              {myCheckin ? '오늘 체크인 완료!' : '오늘 체크인하기'}
            </Button>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            초대 링크를 공유하여 배우자를 연결하세요
          </p>
          <Button variant="outline" fullWidth className="mt-2">
            초대 링크 복사
          </Button>
        </div>
      )}

      {/* 소그룹 읽기 */}
      {activeTab === 'smallgroup' && (
        <div>
          <Card className="mb-4">
            <div className="mb-4 text-center">
              <div className="mb-2 text-6xl">👥</div>
              <h2 className="text-lg font-semibold">소그룹 일독</h2>
              <p className="text-sm text-muted-foreground">
                함께 읽으면 더 멀리 갑니다
              </p>
            </div>

            <div className="mb-4 space-y-2">
              {groupMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between rounded-lg bg-muted p-3"
                >
                  <div>
                    <div className="font-medium">{member.name}</div>
                    {member.time && (
                      <div className="text-xs text-muted-foreground">{member.time}</div>
                    )}
                  </div>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm',
                      member.status === 'done'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {member.status === 'done' ? '✓' : '⏳'}
                  </div>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              onClick={handleCheckin}
              disabled={myCheckin}
              variant={myCheckin ? 'secondary' : 'primary'}
            >
              {myCheckin ? '오늘 체크인 완료!' : '오늘 체크인하기'}
            </Button>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              그룹 만들기
            </Button>
            <Button variant="outline" className="flex-1">
              그룹 참여하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TogetherPage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <div className="text-center">로딩 중...</div>
      </div>
    }>
      <TogetherContent />
    </Suspense>
  );
}
