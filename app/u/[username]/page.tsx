/**
 * 공개 사용자 페이지 (발행된 페이지)
 * lazybible.com/u/{username}
 * Hub_Link FrontPage 패턴: 매니저에서 발행한 프로필 + 링크를 공개 표시
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ProfileSection,
  MenuTabs,
  BibleMenu,
  LinksMenu,
  TogetherMenu,
} from '@/components/profile';
import { useAuthStore } from '@/stores';
import type { MenuKey, UserProfile } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuthStore();

  const [activeMenu, setActiveMenu] = useState<MenuKey>('bible');

  // 발행된 사용자 데이터 조회 (MVP: 로컬 스토어에서 가져옴)
  const isOwner = user?.username === username;
  const isPublished = user?.username === username && user?.isPublished;

  // 프로필 구성
  const profile: UserProfile = user?.username === username && user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        statusMessage: user.bio || undefined,
        avatarUrl: user.avatarUrl,
        publicUrl: `/u/${user.username}`,
        theme: user.theme,
        badgeIds: [],
        createdAt: new Date().toISOString(),
      }
    : {
        id: 'unknown',
        username,
        displayName: username,
        statusMessage: undefined,
        avatarUrl: undefined,
        publicUrl: `/u/${username}`,
        theme: {
          bgColor: '#F8FAFC',
          cardColor: '#FFFFFF',
          textColor: '#1E293B',
          accentColor: '#2E75B6',
          buttonStyle: 'rounded',
          fontFamily: 'Pretendard',
          avatarShape: 'circle',
        },
        badgeIds: [],
        createdAt: new Date().toISOString(),
      };

  // 미발행 상태
  if (user?.username === username && !isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">&#128221;</div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">아직 발행되지 않았습니다</h2>
          <p className="mb-6 text-sm text-slate-500">
            매니저 대시보드에서 프로필을 편집하고 발행해주세요
          </p>
          <a
            href="/manager"
            className="inline-block rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400"
          >
            매니저로 이동
          </a>
        </div>
      </div>
    );
  }

  // 존재하지 않는 사용자
  if (!user || user.username !== username) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">&#128533;</div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">페이지를 찾을 수 없습니다</h2>
          <p className="mb-6 text-sm text-slate-500">
            @{username} 사용자의 페이지가 존재하지 않습니다
          </p>
          <a
            href="/landing"
            className="inline-block rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400"
          >
            홈으로 이동
          </a>
        </div>
      </div>
    );
  }

  // 발행된 공개 링크 (visible 필터링)
  const publishedLinks = user.links.filter((l) => l.isVisible);

  return (
    <div
      className="mx-auto min-h-screen max-w-lg"
      style={{
        backgroundColor: profile.theme.bgColor,
        fontFamily: profile.theme.fontFamily,
      }}
    >
      <div className="px-4 pb-24 pt-6">
        {/* 프로필 섹션 */}
        <div className="mb-6">
          <ProfileSection profile={profile} isOwner={isOwner} />
        </div>

        {/* 발행된 링크 목록 */}
        {publishedLinks.length > 0 && (
          <div className="mb-6 space-y-2">
            {publishedLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border p-4 transition-all hover:shadow-md active:scale-[0.98]"
                style={{
                  backgroundColor: profile.theme.cardColor,
                  borderColor: `${profile.theme.accentColor}30`,
                  color: profile.theme.textColor,
                }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: `${profile.theme.accentColor}15` }}
                  dangerouslySetInnerHTML={{ __html: link.icon }}
                />
                <span className="flex-1 text-sm font-medium">{link.label}</span>
                <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* 3메뉴 탭 */}
        <div className="mb-6">
          <MenuTabs
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            accentColor={profile.theme.accentColor}
          />
        </div>

        {/* 메뉴 콘텐츠 */}
        <div>
          {activeMenu === 'bible' && <BibleMenu />}
          {activeMenu === 'links' && <LinksMenu />}
          {activeMenu === 'together' && <TogetherMenu />}
        </div>
      </div>
    </div>
  );
}
