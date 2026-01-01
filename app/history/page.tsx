/**
 * 기록 페이지
 * 묵상 히스토리 목록
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { getAllMeditations } from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';
import { EMOTIONS } from '@/lib/constants';
import type { MeditationEntry } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<MeditationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await getAllMeditations();
        // 최신순 정렬
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setEntries(data);
      } catch (error) {
        console.error('로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  const getEmotionLabel = (id: string) => {
    return EMOTIONS.find((e) => e.id === id)?.label || id;
  };

  return (
    <>
      <Header title="묵상 기록" />

      <div className="page-container pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-4xl">📝</div>
            <h2 className="mb-2 text-lg font-semibold">아직 묵상 기록이 없어요</h2>
            <p className="mb-6 text-muted-foreground">
              오늘 말씀을 듣고 첫 묵상을 남겨보세요
            </p>
            <button
              onClick={() => router.push('/plan')}
              className="text-primary underline"
            >
              오늘의 말씀 보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                clickable
                onClick={() => router.push(`/meditation/${entry.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.passageTitle}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getEmotionLabel(entry.emotionPrimary)}
                      {entry.graceTags.length > 0 && ` · ${entry.graceTags[0]}`}
                    </p>
                    <p className="text-ellipsis-2 mt-2 text-sm text-muted-foreground">
                      {entry.autoSummary}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 통계 요약 (있을 경우) */}
        {entries.length > 0 && (
          <div className="mt-8 rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              총 <span className="font-semibold text-foreground">{entries.length}</span>개의 묵상 기록
            </p>
          </div>
        )}
      </div>
    </>
  );
}
