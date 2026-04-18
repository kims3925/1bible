/**
 * v6.0 그룹 페이지
 * lazybible.com/g/{groupname}
 * 그룹 피드 + 챌린지 + 게임존 + 랭킹
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ui/ShareButton';

type GroupTab = 'feed' | 'challenge' | 'game' | 'ranking';

// 데모 데이터
const DEMO_MEMBERS = [
  { id: '1', name: '김은혜', avatar: '🙂', streak: 45, todayDone: true, progress: 68 },
  { id: '2', name: '박민수', avatar: '😊', streak: 12, todayDone: true, progress: 35 },
  { id: '3', name: '이수진', avatar: '😄', streak: 90, todayDone: false, progress: 82 },
  { id: '4', name: '정현우', avatar: '🤗', streak: 8, todayDone: true, progress: 22 },
  { id: '5', name: '최미연', avatar: '😇', streak: 3, todayDone: false, progress: 5 },
];

const DEMO_FEED = [
  { id: 'f1', user: '김은혜', type: 'reading', text: '창세기 1~3장 읽기 완료!', time: '10분 전' },
  { id: 'f2', user: '박민수', type: 'meditation', text: '"하나님의 창조에 감사합니다" 묵상 기록', time: '25분 전' },
  { id: 'f3', user: '정현우', type: 'quiz', text: '성경 퀴즈 5/5 만점! 🎉', time: '1시간 전' },
  { id: 'f4', user: '김은혜', type: 'encouragement', text: '이수진님에게 응원 메시지를 보냈습니다 💌', time: '2시간 전' },
  { id: 'f5', user: '이수진', type: 'reading', text: '시편 23편 읽기 완료!', time: '3시간 전' },
];

const DEMO_CHALLENGES = [
  { id: 'c1', title: '신약 30일 통독', participants: 4, daysLeft: 12, progress: 60, myBet: 200 },
  { id: 'c2', title: '시편 일주일 챌린지', participants: 3, daysLeft: 3, progress: 57, myBet: 100 },
];

export default function GroupPage() {
  const params = useParams();
  const groupname = params.groupname as string;
  const [activeTab, setActiveTab] = useState<GroupTab>('feed');

  const tabs: { key: GroupTab; label: string; icon: string }[] = [
    { key: 'feed', label: '피드', icon: '📋' },
    { key: 'challenge', label: '챌린지', icon: '🏆' },
    { key: 'game', label: '게임존', icon: '🎮' },
    { key: 'ranking', label: '랭킹', icon: '📊' },
  ];

  const todayDoneCount = DEMO_MEMBERS.filter((m) => m.todayDone).length;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50">
      {/* 그룹 헤더 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pb-6 pt-8 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{groupname} 소그룹</h1>
          <ShareButton
            title={`${groupname} 소그룹에 참여하세요!`}
            description="게을러도성경일독 함께읽기 그룹"
            contentType="challenge-achieve"
            size="sm"
            className="text-white/70 hover:text-white"
          />
        </div>
        <div className="flex gap-4">
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
            <div className="text-lg font-bold">{DEMO_MEMBERS.length}</div>
            <div className="text-[10px] text-white/70">멤버</div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
            <div className="text-lg font-bold">{todayDoneCount}/{DEMO_MEMBERS.length}</div>
            <div className="text-[10px] text-white/70">오늘 읽기</div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
            <div className="text-lg font-bold">{DEMO_CHALLENGES.length}</div>
            <div className="text-[10px] text-white/70">챌린지</div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="sticky top-0 z-10 flex border-b bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 py-3 text-center text-xs font-medium transition-all',
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-400'
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24 pt-4">
        {/* 피드 */}
        {activeTab === 'feed' && (
          <div className="space-y-3">
            {/* 오늘 현황 */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">오늘 읽기 현황</h3>
              <div className="flex gap-2">
                {DEMO_MEMBERS.map((m) => (
                  <div key={m.id} className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-lg ring-2',
                      m.todayDone ? 'ring-green-400' : 'ring-slate-200'
                    )}>
                      {m.avatar}
                    </div>
                    <span className="text-[10px] text-slate-500">{m.name.slice(0, 2)}</span>
                    {m.todayDone && <span className="text-[10px] text-green-500">&#10003;</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 피드 목록 */}
            {DEMO_FEED.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">{item.user}</span>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 챌린지 */}
        {activeTab === 'challenge' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">진행 중인 챌린지</h3>
              <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">
                + 새 챌린지
              </button>
            </div>
            {DEMO_CHALLENGES.map((ch) => (
              <div key={ch.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">{ch.title}</h4>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {ch.myBet}P 베팅
                  </span>
                </div>
                <div className="mb-3 flex gap-4 text-xs text-slate-500">
                  <span>{ch.participants}명 참여</span>
                  <span>D-{ch.daysLeft}</span>
                </div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">진행률</span>
                  <span className="font-medium text-blue-600">{ch.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${ch.progress}%` }} />
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  완수 시 <span className="font-bold text-green-600">{ch.myBet * 2}P</span> 획득 / 실패 시 <span className="text-red-500">{ch.myBet}P</span> 소멸
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 게임존 */}
        {activeTab === 'game' && (
          <div className="space-y-3">
            {[
              { icon: '🧠', title: '성경 퀴즈 배틀', desc: '그룹원과 실시간 퀴즈 대결', status: 'PLAY' },
              { icon: '🎯', title: '성경 빙고', desc: '5x5 빙고판, 함께 채워가기', status: 'PLAY' },
              { icon: '💎', title: '말씀 보물찾기', desc: '이번 주 보물 구절 찾기', status: 'PLAY' },
              { icon: '🔗', title: '은혜 릴레이', desc: '은혜 구절 릴레이 전달', status: 'PLAY' },
              { icon: '🃏', title: '인물 카드 수집', desc: '성경 인물 카드 모으기', status: 'SOON' },
            ].map((game) => (
              <div key={game.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-3xl">{game.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">{game.title}</div>
                  <div className="text-xs text-slate-400">{game.desc}</div>
                </div>
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  game.status === 'PLAY' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                )}>
                  {game.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 랭킹 */}
        {activeTab === 'ranking' && (
          <div>
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">이번 주 랭킹</h3>
              <div className="space-y-2">
                {[...DEMO_MEMBERS]
                  .sort((a, b) => b.streak - a.streak)
                  .map((member, idx) => (
                    <div key={member.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <span className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        idx === 0 ? 'bg-amber-400 text-white' :
                        idx === 1 ? 'bg-slate-300 text-white' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 text-slate-500'
                      )}>
                        {idx + 1}
                      </span>
                      <span className="text-xl">{member.avatar}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-[10px] text-slate-400">{member.streak}일 연속</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">{member.progress}%</div>
                        <div className="text-[10px] text-slate-400">진도율</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-center text-xs text-blue-700">
              랭킹은 부담 없는 동기부여 목적입니다 😊
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
