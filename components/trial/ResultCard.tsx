/**
 * 검사 결과 카드 — 공통 UI
 * 결과 표시 + 공유하기 + 가입하고 결과 저장하기
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface ResultCardProps {
  /** 검사 종류 */
  assessmentType: string;
  /** 결과 타이틀 (예: "당신은 모세 유형!") */
  title: string;
  /** 부제 */
  subtitle: string;
  /** 아이콘/이모지 */
  icon: string;
  /** 설명 */
  description: string;
  /** 성경 구절 */
  verse?: string;
  verseRef?: string;
  /** 추가 정보 렌더 */
  children?: React.ReactNode;
}

export function ResultCard({
  assessmentType,
  title,
  subtitle,
  icon,
  description,
  verse,
  verseRef,
  children,
}: ResultCardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const handleShare = async () => {
    const shareData = {
      title: `나의 ${assessmentType} 결과: ${title}`,
      text: `${subtitle} — ${description}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* 취소 */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  const handleSave = () => {
    if (isLoggedIn) {
      router.push('/home');
    } else {
      router.push('/auth?ref=trial-result-save');
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 pb-8 pt-8">
        {/* 결과 카드 */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          {/* 상단 컬러 배너 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center text-white">
            <span className="mb-3 inline-block text-5xl">{icon}</span>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-blue-100">{subtitle}</p>
          </div>

          {/* 설명 */}
          <div className="px-6 py-6">
            <p className="text-sm leading-relaxed text-slate-700">{description}</p>

            {/* 성경 구절 */}
            {verse && (
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-sm italic leading-relaxed text-amber-800">
                  &ldquo;{verse}&rdquo;
                </p>
                {verseRef && (
                  <p className="mt-1 text-right text-xs font-medium text-amber-600">
                    — {verseRef}
                  </p>
                )}
              </div>
            )}

            {/* 추가 정보 (차트 등) */}
            {children}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          {/* 공유하기 */}
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            결과 공유하기
          </button>

          {/* 가입하고 결과 저장하기 (핵심 전환 포인트) */}
          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-blue-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
          >
            {isLoggedIn ? '홈으로 돌아가기' : '가입하고 결과 저장하기'}
          </button>

          {!isLoggedIn && (
            <p className="text-center text-xs text-slate-400">
              가입하면 검사 결과가 저장되고, 첫 보너스 50P가 지급됩니다!
            </p>
          )}

          {/* 다른 검사 보기 */}
          <button
            onClick={() => router.push('/explore')}
            className="w-full py-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            다른 검사도 해보기
          </button>
        </div>
      </div>
    </div>
  );
}
