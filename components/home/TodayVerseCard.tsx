/**
 * H05: TodayVerseCard — 오늘의 말씀 카드
 * 오늘 읽을 범위에서 자동 추출한 구절 표시
 * 공유하기 + 묵상하기 CTA
 */

'use client';

interface TodayVerseProps {
  verse: {
    text: string;
    reference: string;
  };
  hasReadToday: boolean;
  onShare: () => void;
  onMeditate?: () => void;
}

export function TodayVerseCard({
  verse,
  hasReadToday,
  onShare,
  onMeditate,
}: TodayVerseProps) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `오늘의 말씀 — ${verse.reference}`,
          text: `"${verse.text}" — ${verse.reference}\n\n📖 게을러도성경일독`,
          url: 'https://bible.hublink.im',
        });
      } catch {
        // 공유 취소
      }
    }
    onShare();
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
      <p className="mb-3 text-xs font-semibold text-blue-600">
        💭 {hasReadToday ? '오늘의 말씀' : '오늘 이 구절을 만나요'}
      </p>

      <blockquote cite={verse.reference} className="mb-3">
        <p className="text-base leading-relaxed text-gray-800">
          &ldquo;{verse.text}&rdquo;
        </p>
        <footer className="mt-2 text-right text-sm text-gray-500">
          &mdash; {verse.reference}
        </footer>
      </blockquote>

      {/* CTA 버튼 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
          aria-label="이 구절을 공유하기"
        >
          📤 공유하기
        </button>
        {hasReadToday && onMeditate && (
          <button
            onClick={onMeditate}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            🙏 묵상하기
          </button>
        )}
      </div>
    </div>
  );
}
