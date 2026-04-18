/**
 * 프로필 섹션 (Hub_Link FrontPage 패턴 참조)
 * 아바타 + 이름 + 상태메시지 + 소셜 버튼
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

interface ProfileSectionProps {
  profile: UserProfile;
  isOwner?: boolean;
}

export function ProfileSection({ profile, isOwner = false }: ProfileSectionProps) {
  const [liked, setLiked] = useState(false);
  const [cheered, setCheered] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [cheerCount, setCheerCount] = useState(18);
  const [followerCount, setFollowerCount] = useState(127);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleCheer = () => {
    setCheered(!cheered);
    setCheerCount((c) => (cheered ? c - 1 : c + 1));
  };

  const handleFollow = () => {
    setFollowed(!followed);
    setFollowerCount((c) => (followed ? c - 1 : c + 1));
  };

  return (
    <div className="text-center">
      {/* 고정 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: profile.theme.textColor }}>
          게을러도 성경일독
        </h1>
        <p className="text-sm opacity-70" style={{ color: profile.theme.textColor }}>
          작심삼일 <span className="font-semibold text-red-400">NO!</span> 이제{' '}
          <span className="font-semibold" style={{ color: profile.theme.accentColor }}>
            작심평생
          </span>
        </p>
      </div>

      {/* 아바타 */}
      <div className="mb-3 flex justify-center">
        <div
          className={cn(
            'flex h-24 w-24 items-center justify-center overflow-hidden border-4 shadow-lg',
            profile.theme.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
          )}
          style={{ borderColor: profile.theme.accentColor }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-3xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${profile.theme.accentColor}, ${profile.theme.bgColor})` }}
            >
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* 이름 */}
      <h2
        className="mb-1 text-xl font-bold"
        style={{ color: profile.theme.textColor }}
      >
        {profile.displayName}
      </h2>

      {/* 상태 메시지 */}
      {profile.statusMessage && (
        <p
          className="mb-4 text-sm opacity-70"
          style={{ color: profile.theme.textColor }}
        >
          {profile.statusMessage}
        </p>
      )}

      {/* 배지 */}
      {profile.badgeIds.length > 0 && (
        <div className="mb-4 flex justify-center gap-1">
          {profile.badgeIds.map((badge) => (
            <span
              key={badge}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${profile.theme.accentColor}20`,
                color: profile.theme.accentColor,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* 소셜 버튼 */}
      {!isOwner && (
        <div className="flex justify-center gap-3">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95',
              liked
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <span>{liked ? '&#10084;' : '&#9825;'}</span>
            <span>{likeCount}</span>
          </button>

          <button
            onClick={handleCheer}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95',
              cheered
                ? 'border-amber-300 bg-amber-50 text-amber-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <span>&#128079;</span>
            <span>{cheerCount}</span>
          </button>

          <button
            onClick={handleFollow}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95',
              followed
                ? 'text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
            style={followed ? { backgroundColor: profile.theme.accentColor, borderColor: profile.theme.accentColor } : {}}
          >
            <span>{followed ? '&#10003;' : '+'}</span>
            <span>{followed ? '팔로잉' : '팔로우'} {followerCount}</span>
          </button>
        </div>
      )}
    </div>
  );
}
