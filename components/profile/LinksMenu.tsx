/**
 * 링크모음 메뉴 콘텐츠
 * 내부 콘텐츠 링크 + 외부 링크 + hunlink 연동
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProgressStore, useSessionStore, useNotesStore } from '@/stores';
import type { UserLink } from '@/types';

// 내부 콘텐츠 링크 정의
const INTERNAL_LINKS = [
  { id: 'progress', label: '나의 읽기 진도', icon: '📊', href: '/progress' },
  { id: 'notes', label: '묵상 노트', icon: '📝', href: '/notes' },
  { id: 'prayers', label: '기도제목', icon: '🙏', href: '/prayers' },
  { id: 'history', label: '묵상 기록', icon: '📚', href: '/history' },
  { id: '365plan', label: '365 통독', icon: '📅', href: '/365' },
  { id: 'meditation', label: '게으른 묵상', icon: '💭', href: '/meditation/new' },
];

// 더미 외부 링크
const SAMPLE_EXTERNAL_LINKS: UserLink[] = [
  { id: '1', userId: 'demo', label: 'Instagram', url: 'https://instagram.com', icon: '📸', sortOrder: 0, isVisible: true, type: 'sns' },
  { id: '2', userId: 'demo', label: 'YouTube', url: 'https://youtube.com', icon: '🎬', sortOrder: 1, isVisible: true, type: 'sns' },
  { id: '3', userId: 'demo', label: '나의 블로그', url: 'https://blog.example.com', icon: '✍️', sortOrder: 2, isVisible: true, type: 'link' },
];

export function LinksMenu() {
  const router = useRouter();
  const { getTotalProgress } = useProgressStore();
  const { getTotalMinutesRead, sessionLogs } = useSessionStore();
  const { meditationNotes, prayerNotes } = useNotesStore();

  const [showAddLink, setShowAddLink] = useState(false);
  const [externalLinks, setExternalLinks] = useState<UserLink[]>(SAMPLE_EXTERNAL_LINKS);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const totalProgress = getTotalProgress();
  const totalMinutes = getTotalMinutesRead();

  const handleAddLink = () => {
    if (!newLinkLabel || !newLinkUrl) return;
    const newLink: UserLink = {
      id: Date.now().toString(),
      userId: 'demo',
      label: newLinkLabel,
      url: newLinkUrl,
      icon: '🔗',
      sortOrder: externalLinks.length,
      isVisible: true,
      type: 'link',
    };
    setExternalLinks([...externalLinks, newLink]);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const handleDeleteLink = (id: string) => {
    setExternalLinks(externalLinks.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 읽기 진도 배지 */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-800">성경 읽기 진도</div>
            <div className="text-3xl font-bold text-blue-600">{totalProgress}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-600">
              {totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`
                : `${totalMinutes}분`} 읽음
            </div>
            <div className="text-sm text-blue-600">{sessionLogs.length}회 세션</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* 내부 콘텐츠 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          내 콘텐츠
        </h3>
        <div className="space-y-2">
          {INTERNAL_LINKS.map((link) => {
            let badge = '';
            if (link.id === 'notes') badge = `${meditationNotes.length}`;
            if (link.id === 'prayers') badge = `${prayerNotes.length}`;

            return (
              <button
                key={link.id}
                onClick={() => router.push(link.href)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm active:scale-[0.98]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-lg">
                  {link.icon}
                </span>
                <span className="flex-1 text-sm font-medium">{link.label}</span>
                {badge && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {badge}
                  </span>
                )}
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* 외부 링크 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            외부 링크
          </h3>
          <button
            onClick={() => setShowAddLink(!showAddLink)}
            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            + 추가
          </button>
        </div>

        {/* 링크 추가 폼 */}
        {showAddLink && (
          <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="링크 이름"
              className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddLink(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm hover:bg-white"
              >
                취소
              </button>
              <button
                onClick={handleAddLink}
                className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-400"
              >
                추가
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {externalLinks.filter((l) => l.isVisible).map((link) => (
            <div
              key={link.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-lg">
                {link.icon}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium text-blue-600 hover:underline"
              >
                {link.label}
              </a>
              <button
                onClick={() => handleDeleteLink(link.id)}
                className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
