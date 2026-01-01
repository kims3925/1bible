/**
 * 묵상 상세 페이지
 * 저장된 묵상 기록 조회
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { getMeditation } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { EMOTIONS } from '@/lib/constants';
import type { MeditationEntry } from '@/types';

export default function MeditationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<MeditationEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const id = params.id as string;
        const data = await getMeditation(id);
        setEntry(data ?? null);
      } catch (error) {
        console.error('로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [params.id]);

  const handleShare = async () => {
    if (!entry) return;

    const text = `📖 ${entry.passageTitle}\n\n${entry.autoSummary}${entry.userNote ? `\n\n${entry.userNote}` : ''}\n\n- 게을러도성경일독`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // 공유 취소됨
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="묵상 기록" showBack />
        <div className="page-container flex items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </>
    );
  }

  if (!entry) {
    return (
      <>
        <Header title="묵상 기록" showBack />
        <div className="page-container flex items-center justify-center">
          <p className="text-muted-foreground">기록을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  const emotionLabel = EMOTIONS.find((e) => e.id === entry.emotionPrimary)?.label || entry.emotionPrimary;

  return (
    <>
      <Header
        title="묵상 기록"
        showBack
        rightAction={
          <button
            onClick={handleShare}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        }
      />

      <div className="page-container space-y-6 pt-4">
        {/* 본문 정보 */}
        <Card>
          <p className="text-sm text-muted-foreground">{formatDate(entry.createdAt)}</p>
          <h2 className="mt-1 text-xl font-bold">{entry.passageTitle}</h2>
        </Card>

        {/* 자동 생성 문장 */}
        <Card className="bg-primary/5">
          <p className="whitespace-pre-line text-lg leading-relaxed">{entry.autoSummary}</p>
          {entry.userNote && (
            <p className="mt-4 border-t pt-4 text-muted-foreground">{entry.userNote}</p>
          )}
        </Card>

        {/* 선택 태그들 */}
        <div className="space-y-4">
          {/* 은혜 */}
          {entry.graceTags.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">은혜</p>
              <div className="flex flex-wrap gap-2">
                {entry.graceTags.map((tag) => (
                  <Chip key={tag} size="sm" selected>
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 감정 */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">감정</p>
            <div className="flex flex-wrap gap-2">
              <Chip size="sm" selected>
                {emotionLabel}
              </Chip>
              {entry.emotionSecondary.map((sec) => (
                <Chip key={sec} size="sm" selected>
                  {sec}
                </Chip>
              ))}
            </div>
          </div>

          {/* 감사 */}
          {entry.gratitudeTags.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">감사</p>
              <div className="flex flex-wrap gap-2">
                {entry.gratitudeTags.map((tag) => (
                  <Chip key={tag} size="sm" selected>
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 결단 */}
          {entry.decisionTag && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">결단</p>
              <Chip size="sm" selected>
                {entry.decisionTag}
              </Chip>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3 pt-4">
          <Button fullWidth onClick={handleShare} variant="outline">
            공유하기
          </Button>
          <Button fullWidth onClick={() => router.push('/history')}>
            기록 목록으로
          </Button>
        </div>
      </div>
    </>
  );
}
