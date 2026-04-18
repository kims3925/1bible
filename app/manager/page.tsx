/**
 * 매니저 대시보드
 * Hub_Link ManagerDashboard.jsx 패턴 참조
 * 프로필 편집 + 링크 관리 + 테마 설정 + 발행 → 공개 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useBlockStore } from '@/stores';
import type { UserLink, ProfileTheme, BlockVisibility } from '@/types';

type ManagerPanel = 'edit' | 'blocks' | 'links' | 'content' | 'settings';

const SIDEBAR_ITEMS: { key: ManagerPanel; label: string; icon: string }[] = [
  { key: 'edit', label: '프로필 편집', icon: '&#9998;' },
  { key: 'blocks', label: '콘텐츠 블록', icon: '&#9638;' },
  { key: 'links', label: '링크 관리', icon: '&#128279;' },
  { key: 'content', label: '콘텐츠', icon: '&#128221;' },
  { key: 'settings', label: '설정', icon: '&#9881;' },
];

const PRESET_THEMES: { id: string; label: string; bg: string; card: string; text: string; accent: string }[] = [
  { id: 'light', label: '라이트', bg: '#F8FAFC', card: '#FFFFFF', text: '#1E293B', accent: '#2E75B6' },
  { id: 'midnight', label: '미드나잇', bg: '#0F0F23', card: '#1A1A2E', text: '#E2E8F0', accent: '#6C5CE7' },
  { id: 'ocean', label: '오션', bg: '#0A192F', card: '#112240', text: '#CCD6F6', accent: '#64FFDA' },
  { id: 'sunset', label: '선셋', bg: '#1A0A2E', card: '#2D1B4E', text: '#E2D1F9', accent: '#FF6B6B' },
  { id: 'forest', label: '포레스트', bg: '#0B1D0E', card: '#1A2F1D', text: '#D1E7D4', accent: '#00B894' },
  { id: 'rose', label: '로즈', bg: '#2B0A1E', card: '#3D1530', text: '#F5D1E8', accent: '#FD79A8' },
  { id: 'snow', label: '스노우', bg: '#F8F9FA', card: '#FFFFFF', text: '#212529', accent: '#6C5CE7' },
  { id: 'warm', label: '웜톤', bg: '#FFF8F0', card: '#FFFFFF', text: '#3D2C1E', accent: '#D4956A' },
];

const LINK_ICONS = ['&#128279;', '&#127912;', '&#128250;', '&#128248;', '&#128722;', '&#128218;', '&#127891;', '&#9749;', '&#128240;', '&#128188;', '&#127925;', '&#127918;', '&#128172;', '&#127760;', '&#128241;', '&#127968;'];

/** v6.0 콘텐츠 블록 관리 서브 패널 */
function BlockManagerPanel() {
  const { blocks, toggleExpanded, setVisibility, toggleActive, moveBlock } = useBlockStore();
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">콘텐츠 블록 관리</h2>
        <p className="text-sm text-slate-500">블록 순서, 펼치기/접기, 공개/나만보기를 설정하세요</p>
      </div>

      <div className="space-y-2">
        {sorted.map((block, idx) => (
          <div
            key={block.id}
            className={cn(
              'rounded-2xl border bg-white p-4 transition-all',
              !block.isActive && 'opacity-50'
            )}
          >
            <div className="flex items-center gap-3">
              {/* 순서 이동 */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={idx === 0}
                  className="rounded p-0.5 text-slate-300 hover:text-slate-600 disabled:invisible"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={idx === sorted.length - 1}
                  className="rounded p-0.5 text-slate-300 hover:text-slate-600 disabled:invisible"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* 블록 정보 */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-700">{block.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{block.type}</span>
                  <span>&middot;</span>
                  <span>{block.isExpanded ? '펼침' : '접힘'}</span>
                  <span>&middot;</span>
                  <span>{block.visibility === 'public' ? '공개' : '나만보기'}</span>
                </div>
              </div>

              {/* 펼치기/접기 */}
              <button
                onClick={() => toggleExpanded(block.id)}
                className={cn(
                  'rounded-lg border px-2 py-1 text-[10px] font-medium',
                  block.isExpanded
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-400'
                )}
              >
                {block.isExpanded ? '펼침' : '접힘'}
              </button>

              {/* 공개/나만보기 */}
              <button
                onClick={() => setVisibility(block.id, block.visibility === 'public' ? 'private' : 'public')}
                className={cn(
                  'rounded-lg border px-2 py-1 text-[10px] font-medium',
                  block.visibility === 'public'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                )}
              >
                {block.visibility === 'public' ? '공개' : '비공개'}
              </button>

              {/* 활성/비활성 */}
              <button
                onClick={() => toggleActive(block.id)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-all',
                  block.isActive ? 'bg-blue-500' : 'bg-slate-300'
                )}
              >
                <div className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                  block.isActive ? 'left-[22px]' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
        <strong>v6.0 콘텐츠 블록 시스템:</strong> 모든 블록은 독립적으로 순서 변경, 펼치기/접기, 공개/비공개 제어가 가능합니다.
        발행 시 공개 + 활성 블록만 개인 페이지에 표시됩니다.
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const router = useRouter();
  const {
    user, isLoggedIn,
    updateProfile, addLink, updateLink, deleteLink, reorderLinks,
    publish, signOut,
  } = useAuthStore();

  const [activePanel, setActivePanel] = useState<ManagerPanel>('edit');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // 링크 추가 상태
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('&#128279;');

  // 편집 중인 링크
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // 로그인 체크
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace('/auth');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user) return null;

  const handleSave = () => {
    setSaveMessage('저장 완료!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handlePublish = () => {
    const url = publish();
    setPublishedUrl(url);
    setShowPublishModal(true);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${publishedUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setSaveMessage('링크가 복사되었습니다!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${publishedUrl}`;
    if (navigator.share) {
      await navigator.share({
        title: `${user.displayName} - 게을러도 성경일독`,
        url: fullUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleAddLink = () => {
    if (!newLinkLabel || !newLinkUrl) return;
    addLink({
      label: newLinkLabel,
      url: newLinkUrl,
      icon: newLinkIcon,
      isVisible: true,
      type: 'link',
    });
    setNewLinkLabel('');
    setNewLinkUrl('');
    setNewLinkIcon('&#128279;');
    setShowAddLink(false);
  };

  const handleThemeChange = (preset: typeof PRESET_THEMES[number]) => {
    updateProfile({
      theme: {
        ...user.theme,
        bgColor: preset.bg,
        cardColor: preset.card,
        textColor: preset.text,
        accentColor: preset.accent,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 모바일 햄버거 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-white shadow-lg transition-transform lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 사이드바 헤더 */}
        <div className="border-b p-5">
          <h1 className="text-lg font-bold text-slate-800">매니저</h1>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-3">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActivePanel(item.key);
                setSidebarOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                activePanel === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <span className="text-base" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 사이드바 푸터 */}
        <div className="border-t p-3">
          <button
            onClick={() => {
              signOut();
              router.push('/landing');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <span>&#8618;</span>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 pt-16 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-3xl">
          {/* 저장 메시지 */}
          {saveMessage && (
            <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg">
              {saveMessage}
            </div>
          )}

          {/* ========== 프로필 편집 패널 ========== */}
          {activePanel === 'edit' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">프로필 편집</h2>

              {/* 아바타 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">프로필 사진</h3>
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      'flex h-24 w-24 items-center justify-center overflow-hidden border-4 shadow-lg',
                      user.theme.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    )}
                    style={{ borderColor: user.theme.accentColor }}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-3xl font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${user.theme.accentColor}, ${user.theme.bgColor})` }}
                      >
                        {user.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-block cursor-pointer rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">
                      사진 변경
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateProfile({ avatarUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProfile({ theme: { ...user.theme, avatarShape: 'circle' } })}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs',
                          user.theme.avatarShape === 'circle' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'text-slate-500'
                        )}
                      >
                        원형
                      </button>
                      <button
                        onClick={() => updateProfile({ theme: { ...user.theme, avatarShape: 'square' } })}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs',
                          user.theme.avatarShape === 'square' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'text-slate-500'
                        )}
                      >
                        사각형
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 이름 & 소개 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">표시 이름</label>
                    <input
                      type="text"
                      value={user.displayName}
                      onChange={(e) => updateProfile({ displayName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      소개 <span className="text-slate-400">({user.bio.length}/150)</span>
                    </label>
                    <textarea
                      value={user.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 150) updateProfile({ bio: e.target.value });
                      }}
                      rows={3}
                      placeholder="자신을 소개해주세요"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* 테마 선택 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">테마</h3>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_THEMES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleThemeChange(preset)}
                      className={cn(
                        'rounded-xl border-2 p-3 transition-all',
                        user.theme.bgColor === preset.bg && user.theme.accentColor === preset.accent
                          ? 'border-blue-500 shadow-md'
                          : 'border-transparent hover:border-slate-200'
                      )}
                    >
                      <div
                        className="mb-2 h-12 rounded-lg"
                        style={{ background: `linear-gradient(135deg, ${preset.bg}, ${preset.accent})` }}
                      />
                      <div className="text-xs font-medium text-slate-600">{preset.label}</div>
                    </button>
                  ))}
                </div>

                {/* 커스텀 색상 */}
                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">강조 색상</label>
                    <input
                      type="color"
                      value={user.theme.accentColor}
                      onChange={(e) => updateProfile({ theme: { ...user.theme, accentColor: e.target.value } })}
                      className="h-10 w-14 cursor-pointer rounded-lg border"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">배경 색상</label>
                    <input
                      type="color"
                      value={user.theme.bgColor}
                      onChange={(e) => updateProfile({ theme: { ...user.theme, bgColor: e.target.value } })}
                      className="h-10 w-14 cursor-pointer rounded-lg border"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">버튼 스타일</label>
                    <div className="flex gap-1">
                      {(['rounded', 'square', 'pill'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateProfile({ theme: { ...user.theme, buttonStyle: style } })}
                          className={cn(
                            'border px-2.5 py-1.5 text-xs',
                            style === 'rounded' && 'rounded-lg',
                            style === 'square' && 'rounded-sm',
                            style === 'pill' && 'rounded-full',
                            user.theme.buttonStyle === style
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'text-slate-500'
                          )}
                        >
                          {style === 'rounded' ? '둥근' : style === 'square' ? '각진' : '필'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 active:scale-[0.98]"
              >
                저장하기
              </button>
            </div>
          )}

          {/* ========== 링크 관리 패널 ========== */}
          {activePanel === 'links' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">링크 관리</h2>
                <button
                  onClick={() => setShowAddLink(true)}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400"
                >
                  + 링크 추가
                </button>
              </div>

              {/* 링크 추가 폼 */}
              {showAddLink && (
                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
                  <h3 className="mb-3 font-semibold text-blue-800">새 링크 추가</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="링크 이름 (예: Instagram)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-blue-700">아이콘 선택</label>
                      <div className="flex flex-wrap gap-2">
                        {LINK_ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewLinkIcon(icon)}
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all',
                              newLinkIcon === icon
                                ? 'border-blue-500 bg-blue-100'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            )}
                            dangerouslySetInnerHTML={{ __html: icon }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddLink(false)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium hover:bg-slate-50"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleAddLink}
                        className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white hover:bg-blue-400"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 링크 리스트 */}
              <div className="space-y-3">
                {user.links.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                    <div className="mb-2 text-4xl">&#128279;</div>
                    <p className="text-sm text-slate-500">아직 링크가 없습니다</p>
                    <p className="text-xs text-slate-400">위의 &quot;+ 링크 추가&quot; 버튼을 눌러 추가하세요</p>
                  </div>
                ) : (
                  user.links.map((link) => (
                    <div
                      key={link.id}
                      className="group rounded-2xl border bg-white p-4 transition-all hover:shadow-md"
                    >
                      {editingLinkId === link.id ? (
                        /* 편집 모드 */
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateLink(link.id, { label: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, { url: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                          />
                          <button
                            onClick={() => setEditingLinkId(null)}
                            className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-medium text-white"
                          >
                            완료
                          </button>
                        </div>
                      ) : (
                        /* 보기 모드 */
                        <div className="flex items-center gap-4">
                          {/* 드래그 핸들 */}
                          <div className="cursor-grab text-slate-300 hover:text-slate-500">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
                            </svg>
                          </div>

                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-lg"
                            dangerouslySetInnerHTML={{ __html: link.icon }}
                          />

                          <div className="flex-1">
                            <div className="text-sm font-medium">{link.label}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{link.url}</div>
                          </div>

                          {/* 토글 */}
                          <button
                            onClick={() => updateLink(link.id, { isVisible: !link.isVisible })}
                            className={cn(
                              'relative h-6 w-11 rounded-full transition-all',
                              link.isVisible ? 'bg-blue-500' : 'bg-slate-300'
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                                link.isVisible ? 'left-[22px]' : 'left-0.5'
                              )}
                            />
                          </button>

                          {/* 편집 */}
                          <button
                            onClick={() => setEditingLinkId(link.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-500"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* 삭제 */}
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========== 콘텐츠 블록 패널 (v6.0) ========== */}
          {activePanel === 'blocks' && (
            <BlockManagerPanel />
          )}

          {/* ========== 콘텐츠 패널 ========== */}
          {activePanel === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">콘텐츠 관리</h2>

              {/* 성경읽기 설정 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">성경읽기 설정</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="text-sm font-medium">시간 선택 읽기</div>
                      <div className="text-xs text-slate-500">5분/10분/30분/1시간/2시간</div>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-blue-500 relative">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="text-sm font-medium">책별 일독</div>
                      <div className="text-xs text-slate-500">66권 책별/컬렉션별 선택</div>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-blue-500 relative">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="text-sm font-medium">게으른자의 묵상</div>
                      <div className="text-xs text-slate-500">선택만으로 묵상 기록 완성</div>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-blue-500 relative">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="text-sm font-medium">영어 병행 읽기</div>
                      <div className="text-xs text-slate-500">영어로읽기/번갈아읽기 모드</div>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-slate-300 relative">
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 공지사항 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">공지사항</h3>
                <textarea
                  rows={3}
                  placeholder="방문자에게 전할 메시지를 작성하세요"
                  className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
                />
                <button className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  저장
                </button>
              </div>
            </div>
          )}

          {/* ========== 설정 패널 ========== */}
          {activePanel === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">설정</h2>

              {/* 소셜 링크 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">소셜 링크</h3>
                <div className="space-y-3">
                  {[
                    { key: 'instagram' as const, label: 'Instagram', placeholder: '@username' },
                    { key: 'youtube' as const, label: 'YouTube', placeholder: 'channel URL' },
                    { key: 'twitter' as const, label: 'Twitter', placeholder: '@username' },
                    { key: 'tiktok' as const, label: 'TikTok', placeholder: '@username' },
                    { key: 'blog' as const, label: 'Blog', placeholder: 'blog URL' },
                  ].map((social) => (
                    <div key={social.key} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-slate-600">{social.label}</span>
                      <input
                        type="text"
                        value={user.socialLinks[social.key] || ''}
                        onChange={(e) =>
                          updateProfile({
                            socialLinks: { ...user.socialLinks, [social.key]: e.target.value },
                          })
                        }
                        placeholder={social.placeholder}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 계정 정보 */}
              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-4 font-semibold text-slate-700">계정 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">이메일</span>
                    <span className="text-slate-800">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">사용자 이름</span>
                    <span className="text-slate-800">@{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">페이지 URL</span>
                    <span className="text-blue-600">/u/{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">발행 상태</span>
                    <span className={user.isPublished ? 'text-green-600' : 'text-amber-600'}>
                      {user.isPublished ? '발행됨' : '미발행'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== 하단 액션 바 ========== */}
          <div className="sticky bottom-0 mt-8 flex gap-3 border-t bg-slate-50 pt-4 pb-6">
            <button
              onClick={() => window.open(`/u/${user.username}`, '_blank')}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              &#128065; 미리보기
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              &#128203; 링크 복사
            </button>
            <button
              onClick={handlePublish}
              className="flex-[2] rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400 active:scale-[0.98]"
            >
              &#128640; 발행하기
            </button>
          </div>
        </div>
      </main>

      {/* ========== 발행 완료 모달 (v6.0) ========== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">발행 완료!</h3>
            <p className="mb-1 text-sm text-slate-500">페이지가 성공적으로 발행되었습니다</p>
            <p className="mb-6 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-blue-600">
              {typeof window !== 'undefined' ? window.location.origin : ''}{publishedUrl}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => window.open(publishedUrl, '_blank')}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-400"
              >
                &#128279; 내 페이지 보기
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                &#128203; 링크 복사
              </button>
              <button
                onClick={handleShare}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                &#128228; SNS 공유
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
