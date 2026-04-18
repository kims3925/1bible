/**
 * 함께읽기 메뉴 콘텐츠
 * 그룹 피드 + 보증금 챌린지 + 그룹 초대 + 랭킹
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface FeedItem {
  id: string;
  userName: string;
  avatar: string;
  action: string;
  detail: string;
  time: string;
}

const SAMPLE_FEED: FeedItem[] = [
  { id: '1', userName: '김은혜', avatar: '👩', action: '오늘 성경읽기 완료', detail: '마태복음 5-7장', time: '10분 전' },
  { id: '2', userName: '박민수', avatar: '👨', action: '묵상을 나눴습니다', detail: '"감사와 겸손으로 하루를 시작합니다"', time: '30분 전' },
  { id: '3', userName: '이수진', avatar: '👩', action: '7일 연속 읽기 달성!', detail: '스트릭 배지 획득', time: '1시간 전' },
  { id: '4', userName: '정현우', avatar: '👨', action: '창세기 완독!', detail: '50장 모두 완료', time: '2시간 전' },
];

const RANKING = [
  { name: '이수진', progress: 52, streak: 21 },
  { name: '김은혜', progress: 48, streak: 15 },
  { name: '정현우', progress: 42, streak: 12 },
  { name: '박민수', progress: 35, streak: 8 },
];

export function TogetherMenu() {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      {/* 그룹 요약 */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-indigo-800">주일학교 성경읽기반</h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
            4명
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-600">75%</div>
            <div className="text-[10px] text-indigo-500">참여율</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600">44%</div>
            <div className="text-[10px] text-indigo-500">평균 진도</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600">14일</div>
            <div className="text-[10px] text-indigo-500">평균 스트릭</div>
          </div>
        </div>
      </div>

      {/* 그룹 피드 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          그룹 피드
        </h3>
        <div className="space-y-3">
          {SAMPLE_FEED.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                {item.avatar}
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-semibold">{item.userName}</span>{' '}
                  <span className="text-slate-600">{item.action}</span>
                </div>
                <div className="text-xs text-slate-500">{item.detail}</div>
                <div className="mt-1 text-[10px] text-slate-400">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 그룹 랭킹 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          읽기 랭킹
        </h3>
        <div className="space-y-2">
          {RANKING.map((member, idx) => (
            <div
              key={member.name}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white',
                  idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-300'
                )}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {member.name}
                  {member.streak >= 7 && (
                    <span className="text-xs text-orange-500">&#128293;{member.streak}일</span>
                  )}
                </div>
                <ProgressBar value={member.progress} size="sm" showLabel={false} className="mt-1" />
              </div>
              <span className="text-sm font-semibold text-blue-600">{member.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 보증금 챌린지 */}
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center">
        <div className="mb-2 text-3xl">&#128176;</div>
        <h3 className="mb-1 font-semibold text-amber-800">보증금 챌린지</h3>
        <p className="mb-3 text-sm text-amber-700">
          보증금을 걸고 완주에 도전하세요!
        </p>
        <Button
          size="sm"
          onClick={() => router.push('/together?type=challenge')}
        >
          챌린지 보기
        </Button>
      </div>

      {/* 그룹 관리 */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setShowInvite(true)}>
          그룹 초대
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push('/together')}>
          그룹 관리
        </Button>
      </div>

      {/* 초대 모달 */}
      {showInvite && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowInvite(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-center text-lg font-bold">그룹 초대</h3>
            <div className="mb-4 space-y-3">
              <button className="flex w-full items-center gap-3 rounded-xl border p-3 hover:bg-slate-50">
                <span className="text-xl">&#128279;</span>
                <span className="text-sm font-medium">초대 링크 복사</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border p-3 hover:bg-slate-50">
                <span className="text-xl">&#128247;</span>
                <span className="text-sm font-medium">QR 코드 공유</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border p-3 hover:bg-slate-50">
                <span className="text-xl">&#128172;</span>
                <span className="text-sm font-medium">카카오톡 공유</span>
              </button>
            </div>
            <Button variant="outline" fullWidth onClick={() => setShowInvite(false)}>
              닫기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
