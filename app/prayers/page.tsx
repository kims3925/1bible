/**
 * 내 기도노트 페이지
 */

'use client';

import { useState } from 'react';
import { useNotesStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MeditationStateTag } from '@/types';

export default function PrayersPage() {
  const { prayerNotes, addPrayerNote, deleteNote } = useNotesStore();
  const [showModal, setShowModal] = useState(false);
  const [prayerText, setPrayerText] = useState('');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleAddPrayer = () => {
    if (prayerText.trim()) {
      addPrayerNote({
        stateTag: 'gratitude' as MeditationStateTag,
        oneLine: prayerText,
      });
      setPrayerText('');
      setShowModal(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">내 기도노트</h1>

      <Button fullWidth className="mb-4" onClick={() => setShowModal(true)}>
        기도 작성하기
      </Button>

      {prayerNotes.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🙏</div>
          <p className="text-muted-foreground">아직 기도 기록이 없습니다</p>
          <p className="mt-1 text-sm text-muted-foreground">
            위 버튼을 눌러 기도를 작성해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prayerNotes.map((note) => (
            <Card key={note.id} className="relative">
              <button
                onClick={() => {
                  if (confirm('이 기도를 삭제하시겠습니까?')) {
                    deleteNote('prayer', note.id);
                  }
                }}
                className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                ×
              </button>

              <div className="mb-2 text-xs text-muted-foreground">
                {formatDate(note.createdAt)}
              </div>

              {note.oneLine && <p className="text-sm">{note.oneLine}</p>}
            </Card>
          ))}
        </div>
      )}

      {/* 기도 작성 모달 */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-5 shadow-xl">
            <h3 className="mb-4 text-center text-lg font-bold">기도 작성</h3>

            <textarea
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder="오늘의 기도를 작성하세요..."
              className="mb-4 h-32 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                취소
              </Button>
              <Button className="flex-1" onClick={handleAddPrayer}>
                저장하기
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
