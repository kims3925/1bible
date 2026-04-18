/**
 * 커뮤니티 페이지
 * 간증 피드 / 묵상 나눔 / 그룹 챌린지 / EL MUSIC / 주간 랭킹
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type CommunityTab = 'feed' | 'meditation' | 'challenge' | 'music' | 'ranking';

interface Post {
  id: string;
  userName: string;
  avatar: string;
  type: 'testimony' | 'meditation' | 'completion' | 'music';
  content: string;
  detail?: string;
  likes: number;
  comments: number;
  time: string;
  liked?: boolean;
}

const SAMPLE_POSTS: Post[] = [
  { id: '1', userName: '김은혜', avatar: '👩', type: 'testimony', content: '마태복음 5장을 읽으며 산상수훈의 복의 의미를 다시 생각하게 되었습니다. 심령이 가난한 자가 복이 있다는 말씀이 마음에 와닿았습니다.', likes: 15, comments: 3, time: '30분 전' },
  { id: '2', userName: '박민수', avatar: '👨', type: 'completion', content: '창세기 전체 완독!', detail: '50장 완독 달성', likes: 28, comments: 7, time: '1시간 전' },
  { id: '3', userName: '이수진', avatar: '👩', type: 'meditation', content: '오늘 묵상: 빌립보서 4:13 "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라"', detail: '은혜태그: 격려, 소망', likes: 22, comments: 5, time: '2시간 전' },
  { id: '4', userName: '정현우', avatar: '👨', type: 'music', content: 'EL MUSIC: "주님의 은혜" 새 찬양을 만들었습니다', detail: '시편 23편 기반 찬양', likes: 35, comments: 12, time: '3시간 전' },
  { id: '5', userName: '최미연', avatar: '👩', type: 'testimony', content: '21일 연속 읽기를 달성했습니다! 처음에는 5분도 힘들었는데, 이제는 매일 아침이 기대됩니다. 습관의 힘을 느끼고 있어요.', likes: 42, comments: 8, time: '4시간 전' },
];

const RANKING_DATA = [
  { rank: 1, name: '이수진', chapters: 156, streak: 21, badge: '&#129351;' },
  { rank: 2, name: '최미연', chapters: 142, streak: 18, badge: '&#129352;' },
  { rank: 3, name: '김은혜', chapters: 128, streak: 15, badge: '&#129353;' },
  { rank: 4, name: '정현우', chapters: 112, streak: 12, badge: '' },
  { rank: 5, name: '박민수', chapters: 95, streak: 8, badge: '' },
];

const TYPE_LABELS = {
  testimony: { label: '간증', color: 'bg-purple-100 text-purple-700' },
  meditation: { label: '묵상', color: 'bg-blue-100 text-blue-700' },
  completion: { label: '완독', color: 'bg-green-100 text-green-700' },
  music: { label: 'EL MUSIC', color: 'bg-pink-100 text-pink-700' },
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [posts, setPosts] = useState(SAMPLE_POSTS);

  const handleLike = (postId: string) => {
    setPosts(posts.map((p) =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const tabs: { key: CommunityTab; label: string }[] = [
    { key: 'feed', label: '전체' },
    { key: 'meditation', label: '묵상' },
    { key: 'challenge', label: '챌린지' },
    { key: 'music', label: 'EL MUSIC' },
    { key: 'ranking', label: '랭킹' },
  ];

  const filteredPosts = activeTab === 'feed'
    ? posts
    : activeTab === 'meditation'
    ? posts.filter((p) => p.type === 'meditation' || p.type === 'testimony')
    : activeTab === 'music'
    ? posts.filter((p) => p.type === 'music')
    : posts;

  return (
    <div className="page-container">
      <h1 className="mb-2 text-center text-2xl font-bold">커뮤니티</h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        함께 나누고 격려하는 공간
      </p>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 피드 */}
      {activeTab !== 'ranking' && (
        <div className="space-y-4">
          {/* 글쓰기 CTA */}
          <Card className="border-dashed">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                &#128172;
              </div>
              <input
                type="text"
                placeholder="묵상이나 간증을 나눠보세요..."
                className="flex-1 text-sm text-slate-500 focus:outline-none"
                readOnly
              />
              <Button size="sm">나누기</Button>
            </div>
          </Card>

          {filteredPosts.map((post) => {
            const typeInfo = TYPE_LABELS[post.type];
            return (
              <Card key={post.id}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{post.userName}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{post.time}</div>
                  </div>
                </div>

                <p className="mb-2 text-sm leading-relaxed">{post.content}</p>
                {post.detail && (
                  <p className="mb-3 text-xs text-muted-foreground">{post.detail}</p>
                )}

                <div className="flex items-center gap-4 border-t pt-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      'flex items-center gap-1 text-sm transition-colors',
                      post.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    )}
                  >
                    <span>{post.liked ? '&#10084;' : '&#9825;'}</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <span>&#128172;</span>
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <span>&#128257;</span>
                    <span>공유</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 랭킹 */}
      {activeTab === 'ranking' && (
        <div>
          <Card className="mb-4">
            <h3 className="mb-4 font-semibold">주간 읽기 랭킹</h3>
            <div className="space-y-3">
              {RANKING_DATA.map((r) => (
                <div
                  key={r.rank}
                  className={cn(
                    'flex items-center gap-4 rounded-xl p-3',
                    r.rank <= 3 ? 'bg-amber-50' : 'bg-slate-50'
                  )}
                >
                  <div className="text-center" style={{ minWidth: 32 }}>
                    {r.badge ? (
                      <span className="text-xl" dangerouslySetInnerHTML={{ __html: r.badge }} />
                    ) : (
                      <span className="text-lg font-bold text-slate-400">{r.rank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.chapters}장 읽음 &#183; 스트릭 {r.streak}일
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600">{r.chapters}</div>
                    <div className="text-[10px] text-muted-foreground">장</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">최고 스트릭</h3>
            <div className="space-y-2">
              {RANKING_DATA
                .sort((a, b) => b.streak - a.streak)
                .map((r, idx) => (
                <div key={r.name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  <span className="text-sm font-bold text-orange-500">
                    &#128293; {r.streak}일
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
