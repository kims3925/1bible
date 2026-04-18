/**
 * 함께읽기 페이지
 * 커플읽기 / 소그룹읽기 / 보증금 챌린지 / 진도 비교
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RequireAuth } from '@/components/auth/RequireAuth';

type TabType = 'couple' | 'smallgroup' | 'challenge';

interface Member {
  name: string;
  avatar: string;
  status: 'done' | 'pending';
  time?: string;
  progress: number;
  streak: number;
}

function TogetherContent() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(defaultType || 'couple');
  const [myCheckin, setMyCheckin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [inviteCode] = useState('LBIBLE-2026');

  // 더미 데이터
  const couplePartner: Member = {
    name: '사랑하는 배우자',
    avatar: '💑',
    status: 'pending',
    progress: 35,
    streak: 7,
  };

  const groupMembers: Member[] = [
    { name: '김철수', avatar: '👨', status: 'done', time: '오전 7:30', progress: 42, streak: 15 },
    { name: '이영희', avatar: '👩', status: 'done', time: '오전 8:15', progress: 38, streak: 12 },
    { name: '박민수', avatar: '👨', status: 'pending', progress: 28, streak: 3 },
    { name: '정수진', avatar: '👩', status: 'pending', progress: 45, streak: 21 },
  ];

  const handleCheckin = () => {
    setMyCheckin(true);
  };

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`https://lazybible.app/invite/${inviteCode}`);
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">함께읽기</h1>

      {/* 탭 */}
      <div className="mb-6 flex rounded-xl bg-muted p-1">
        {([
          { key: 'couple' as const, label: '커플읽기' },
          { key: 'smallgroup' as const, label: '소그룹' },
          { key: 'challenge' as const, label: '챌린지' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 rounded-lg py-3 text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 커플 읽기 */}
      {activeTab === 'couple' && (
        <div>
          <Card className="mb-4">
            <div className="mb-4 text-center">
              <div className="mb-2 text-5xl">💑</div>
              <h2 className="text-lg font-semibold">함께 말씀을 읽어요</h2>
              <p className="text-sm text-muted-foreground">
                오늘 체크인을 하면 배우자에게 알림이 갑니다
              </p>
            </div>

            {/* 진도 비교 */}
            <div className="mb-4 rounded-xl bg-muted p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-center">
                  <div className="mb-1 text-2xl">🙋</div>
                  <div className="text-sm font-medium">나</div>
                  <div className="text-lg font-bold text-primary">32%</div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <div className="text-lg">VS</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl">💕</div>
                  <div className="text-sm font-medium">{couplePartner.name}</div>
                  <div className="text-lg font-bold text-pink-500">{couplePartner.progress}%</div>
                </div>
              </div>
              <ProgressBar value={32} showLabel={false} className="mb-1" />
              <ProgressBar value={couplePartner.progress} showLabel={false} color="secondary" />
            </div>

            {/* 파트너 상태 */}
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{couplePartner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {couplePartner.status === 'done' ? '오늘 체크인 완료' : '오늘 아직 안 읽었어요'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    연속 {couplePartner.streak}일째
                  </div>
                </div>
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-xl',
                    couplePartner.status === 'done'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {couplePartner.status === 'done' ? '&#10003;' : '&#8987;'}
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

          {/* 묵상 나눔 */}
          <Card className="mb-4">
            <h3 className="mb-3 font-semibold">오늘의 묵상 나눔</h3>
            <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
              오늘 읽은 말씀에 대한 묵상을 나눠보세요
            </div>
            <Button variant="outline" fullWidth className="mt-3">
              묵상 나누기
            </Button>
          </Card>

          <Button variant="outline" fullWidth onClick={() => setShowInviteModal(true)}>
            초대 링크 복사
          </Button>
        </div>
      )}

      {/* 소그룹 읽기 */}
      {activeTab === 'smallgroup' && (
        <div>
          <Card className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">주일학교 성경읽기반</h2>
                <p className="text-sm text-muted-foreground">
                  {groupMembers.filter((m) => m.status === 'done').length}/{groupMembers.length}명 체크인
                </p>
              </div>
              <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                4명
              </div>
            </div>

            {/* 전체 진도 */}
            <div className="mb-4 rounded-lg bg-muted p-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>그룹 평균 진도</span>
                <span className="font-medium">
                  {Math.round(groupMembers.reduce((sum, m) => sum + m.progress, 0) / groupMembers.length)}%
                </span>
              </div>
              <ProgressBar
                value={Math.round(groupMembers.reduce((sum, m) => sum + m.progress, 0) / groupMembers.length)}
                showLabel={false}
              />
            </div>

            {/* 멤버 목록 */}
            <div className="mb-4 space-y-2">
              {groupMembers
                .sort((a, b) => b.progress - a.progress)
                .map((member, idx) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.streak >= 7 && (
                          <span className="text-xs text-orange-500">
                            &#128293; {member.streak}일
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{member.progress}%</span>
                        {member.time && <span>&#183; {member.time}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={member.progress}
                      size="sm"
                      showLabel={false}
                      className="w-16"
                    />
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm',
                        member.status === 'done'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {member.status === 'done' ? '&#10003;' : '&#8987;'}
                    </div>
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
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateGroupModal(true)}>
              그룹 만들기
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(true)}>
              그룹 참여하기
            </Button>
          </div>
        </div>
      )}

      {/* 보증금 챌린지 */}
      {activeTab === 'challenge' && (
        <div>
          <Card className="mb-4">
            <div className="mb-4 text-center">
              <div className="mb-2 text-5xl">&#128176;</div>
              <h2 className="text-lg font-semibold">보증금 챌린지</h2>
              <p className="text-sm text-muted-foreground">
                보증금을 걸고 성경 일독에 도전하세요. 완주하면 전액 환급!
              </p>
            </div>

            {/* 챌린지 옵션 */}
            <div className="space-y-3">
              {[
                { period: '90일', amount: '10,000원', reward: '전액 환급 + 배지' },
                { period: '180일', amount: '30,000원', reward: '전액 환급 + 프리미엄 1개월' },
                { period: '365일', amount: '50,000원', reward: '전액 환급 + 프리미엄 3개월' },
              ].map((challenge) => (
                <div
                  key={challenge.period}
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div>
                    <div className="font-semibold">{challenge.period} 챌린지</div>
                    <div className="text-sm text-muted-foreground">보증금 {challenge.amount}</div>
                    <div className="text-xs text-green-600">{challenge.reward}</div>
                  </div>
                  <Button size="sm">참여</Button>
                </div>
              ))}
            </div>
          </Card>

          {/* 챌린지 규칙 */}
          <Card className="mb-4">
            <h3 className="mb-3 font-semibold">챌린지 규칙</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500">&#10003;</span>
                매일 최소 5분 이상 성경 읽기/듣기
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">&#10003;</span>
                주 2회까지 면제 (은혜의 날)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">&#10003;</span>
                완주 시 보증금 100% 환급
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">&#9888;</span>
                미완주 시 보증금은 성경 기부금으로 사용
              </li>
            </ul>
          </Card>

          {/* 진행 중인 챌린지 */}
          <Card>
            <h3 className="mb-3 font-semibold">진행 중인 챌린지</h3>
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              아직 참여 중인 챌린지가 없습니다
            </div>
          </Card>
        </div>
      )}

      {/* 초대 모달 */}
      {showInviteModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowInviteModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-center text-lg font-bold">초대 코드</h3>
            <div className="mb-4 rounded-lg bg-muted p-4 text-center">
              <div className="mb-1 text-sm text-muted-foreground">초대 코드</div>
              <div className="text-2xl font-bold text-primary">{inviteCode}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                닫기
              </Button>
              <Button className="flex-1" onClick={handleCopyInvite}>
                코드 복사
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 그룹 만들기 모달 */}
      {showCreateGroupModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowCreateGroupModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">그룹 만들기</h3>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">그룹 이름</label>
              <input
                type="text"
                placeholder="예: 주일학교 성경읽기반"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">그룹 유형</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="smallgroup">소그룹 (2-12명)</option>
                <option value="church">교회 그룹</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">플랜</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="365">365일 일독</option>
                <option value="180">180일 일독</option>
                <option value="90">90일 일독</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateGroupModal(false)}>
                취소
              </Button>
              <Button className="flex-1" onClick={() => setShowCreateGroupModal(false)}>
                만들기
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TogetherPage() {
  return (
    <RequireAuth from="together">
      <Suspense fallback={
        <div className="page-container">
          <div className="text-center">로딩 중...</div>
        </div>
      }>
        <TogetherContent />
      </Suspense>
    </RequireAuth>
  );
}
