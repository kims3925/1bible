/**
 * H08: ExpandableMoreOptions — 접힘/펼침 더보기
 * 기존 12개 묶음책 진도바 + 특별 모드 + 함께읽기를 접어서 숨김
 * 펼침 상태는 localStorage에 저장
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookGroupProgress {
  id: string;
  name: string;
  progress: number; // 0~1
  totalBooks: number;
}

interface ExpandableMoreOptionsProps {
  bookGroups?: BookGroupProgress[];
  defaultExpanded?: boolean;
}

const DEFAULT_BOOK_GROUPS: BookGroupProgress[] = [
  { id: 'pentateuch', name: '모세오경', progress: 0, totalBooks: 5 },
  { id: 'history', name: '역사서', progress: 0, totalBooks: 12 },
  { id: 'poetry', name: '시가서', progress: 0, totalBooks: 5 },
  { id: 'major-prophets', name: '대선지서', progress: 0, totalBooks: 5 },
  { id: 'minor-prophets', name: '소선지서', progress: 0, totalBooks: 12 },
  { id: 'gospels', name: '사복음서', progress: 0, totalBooks: 4 },
  { id: 'acts', name: '사도행전', progress: 0, totalBooks: 1 },
  { id: 'pauline', name: '바울서신', progress: 0, totalBooks: 13 },
  { id: 'general', name: '일반서신', progress: 0, totalBooks: 8 },
  { id: 'revelation', name: '요한계시록', progress: 0, totalBooks: 1 },
];

const SPECIAL_MODES = [
  { icon: '🚗', label: '차에서 듣기', href: '/session?mode=driving' },
  { icon: '📅', label: '365일 일독 플랜', href: '/365' },
  { icon: '🌐', label: '영어로 읽기', href: '/session?mode=english' },
  { icon: '🌏', label: '영어·한국어 번갈아', href: '/session?mode=bilingual' },
];

const TOGETHER_OPTIONS = [
  { icon: '💑', label: '커플 읽기', href: '/together?type=couple' },
  { icon: '👥', label: '소그룹 읽기', href: '/together?type=small' },
  { icon: '🎙️', label: '내 목소리 낭독', href: '/recite' },
];

export function ExpandableMoreOptions({
  bookGroups = DEFAULT_BOOK_GROUPS,
  defaultExpanded = false,
}: ExpandableMoreOptionsProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // localStorage에서 상태 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem('home.moreOptions.expanded');
      if (saved !== null) {
        setExpanded(saved === 'true');
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem('home.moreOptions.expanded', String(next));
    } catch {
      // 무시
    }
  };

  // 구약/신약 분리
  const otGroups = bookGroups.slice(0, 5);
  const ntGroups = bookGroups.slice(5);
  const otOverall = otGroups.length > 0
    ? otGroups.reduce((s, g) => s + g.progress, 0) / otGroups.length
    : 0;
  const ntOverall = ntGroups.length > 0
    ? ntGroups.reduce((s, g) => s + g.progress, 0) / ntGroups.length
    : 0;

  return (
    <div className="mt-6">
      <details open={expanded} onToggle={handleToggle}>
        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-800">
          <span className="transition-transform" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }}>
            &#x25B6;
          </span>
          더 많은 읽기 방법
        </summary>

        <div className="mt-4 space-y-5">
          {/* 책별 이어서 읽기 */}
          <section>
            <h4 className="mb-2 text-xs font-semibold text-gray-500">📚 책별 이어서 읽기</h4>

            {/* 구약 */}
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-600">
                구약 (39권) &mdash; 전체 {Math.round(otOverall * 100)}%
              </p>
              <div className="space-y-1.5 pl-2">
                {otGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-gray-600">{group.name}</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-400 transition-all duration-500"
                          style={{ width: `${Math.max(group.progress * 100, 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-[10px] text-gray-500">
                      {Math.round(group.progress * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 신약 */}
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">
                신약 (27권) &mdash; 전체 {Math.round(ntOverall * 100)}%
              </p>
              <div className="space-y-1.5 pl-2">
                {ntGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-gray-600">{group.name}</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.max(group.progress * 100, 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-[10px] text-gray-500">
                      {Math.round(group.progress * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 특별 모드 */}
          <section>
            <h4 className="mb-2 text-xs font-semibold text-gray-500">🎭 특별 모드</h4>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_MODES.map((mode) => (
                <button
                  key={mode.href}
                  onClick={() => router.push(mode.href)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>{mode.icon}</span>
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 함께 읽기 */}
          <section>
            <h4 className="mb-2 text-xs font-semibold text-gray-500">👥 함께 읽기</h4>
            <div className="grid grid-cols-3 gap-2">
              {TOGETHER_OPTIONS.map((opt) => (
                <button
                  key={opt.href}
                  onClick={() => router.push(opt.href)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[11px] font-medium text-gray-600">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </details>
    </div>
  );
}
