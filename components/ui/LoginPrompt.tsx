/**
 * 로그인 유도 모달
 * 비회원이 개인저장 기능(진도관리, 묵상저장 등)을 시도할 때 표시
 */

'use client';

import { useRouter } from 'next/navigation';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function LoginPrompt({
  isOpen,
  onClose,
  title = '로그인이 필요합니다',
  message = '진도 저장, 묵상 기록 등 개인 기능을 사용하려면 로그인이 필요합니다.',
}: LoginPromptProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg animate-slide-up sm:bottom-auto sm:top-1/2 sm:inset-x-auto sm:w-full sm:-translate-y-1/2">
        <div className="rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-3xl">
          {/* 드래그 핸들 (모바일) */}
          <div className="mb-4 flex justify-center sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
          </div>

          {/* 아이콘 */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔐
            </div>
          </div>

          {/* 텍스트 */}
          <h3 className="mb-2 text-center text-xl font-bold text-slate-800">
            {title}
          </h3>
          <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
            {message}
          </p>

          {/* CTA 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth')}
              className="w-full rounded-2xl bg-blue-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
            >
              로그인 / 회원가입
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              나중에 할게요
            </button>
          </div>

          {/* 안내 */}
          <p className="mt-4 text-center text-xs text-slate-400">
            성경읽기는 로그인 없이 자유롭게 이용 가능합니다
          </p>
        </div>
      </div>
    </>
  );
}
