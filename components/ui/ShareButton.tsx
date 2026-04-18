/**
 * v6.0 공유하기 버튼 + 공유 모달
 * 카카오톡/인스타/X/페이스북/링크복사 (navigator.share API)
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ShareContentType } from '@/types';

interface ShareButtonProps {
  title: string;
  description: string;
  contentType: ShareContentType;
  className?: string;
  size?: 'sm' | 'md';
}

export function ShareButton({
  title,
  description,
  contentType,
  className,
  size = 'sm',
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, text: description, url: shareUrl });
      setShowModal(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${title}\n${description}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareChannels = [
    { name: '카카오톡', icon: '💬', color: 'bg-yellow-400', onClick: handleNativeShare },
    { name: '인스타그램', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500', onClick: handleNativeShare },
    { name: 'X (트위터)', icon: '𝕏', color: 'bg-black', onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title + '\n' + description)}&url=${encodeURIComponent(shareUrl)}`) },
    { name: '페이스북', icon: 'f', color: 'bg-blue-600', onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`) },
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg font-medium text-slate-500 transition-all hover:text-blue-500',
          size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
          className
        )}
      >
        <svg className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        공유
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 공유 카드 미리보기 */}
            <div className="mb-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <div className="mb-1 text-sm font-bold text-slate-800">{title}</div>
              <div className="text-xs text-slate-500">{description}</div>
              <div className="mt-2 text-[10px] text-blue-400">게을러도성경일독</div>
            </div>

            {/* 공유 채널 */}
            <div className="mb-4 grid grid-cols-4 gap-3">
              {shareChannels.map((ch) => (
                <button
                  key={ch.name}
                  onClick={ch.onClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-full text-lg text-white', ch.color)}>
                    {ch.icon}
                  </div>
                  <span className="text-[10px] text-slate-500">{ch.name}</span>
                </button>
              ))}
            </div>

            {/* 링크 복사 */}
            <button
              onClick={handleCopyLink}
              className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied ? '✓ 복사됨!' : '🔗 링크 복사'}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-2 w-full py-2 text-sm text-slate-400"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
