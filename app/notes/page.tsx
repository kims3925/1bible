/**
 * 내 묵상노트 페이지
 */

'use client';

import { useNotesStore, STATE_TAG_LABELS, ACTION_TAG_LABELS } from '@/stores';
import { Card } from '@/components/ui/Card';

export default function NotesPage() {
  const { meditationNotes, deleteNote } = useNotesStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="page-container">
      <h1 className="mb-6 text-center text-2xl font-bold">내 묵상노트</h1>

      {meditationNotes.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📖</div>
          <p className="text-muted-foreground">아직 묵상 기록이 없습니다</p>
          <p className="mt-1 text-sm text-muted-foreground">
            홈에서 &quot;게으른묵상 실행하기&quot;를 눌러 시작해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meditationNotes.map((note) => (
            <Card key={note.id} className="relative">
              <button
                onClick={() => {
                  if (confirm('이 묵상을 삭제하시겠습니까?')) {
                    deleteNote('meditation', note.id);
                  }
                }}
                className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                ×
              </button>

              <div className="mb-2 text-xs text-muted-foreground">
                {formatDate(note.createdAt)}
              </div>

              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {STATE_TAG_LABELS[note.stateTag]}
                </span>
                {note.actionTag && (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {ACTION_TAG_LABELS[note.actionTag]}
                  </span>
                )}
              </div>

              {note.oneLine && (
                <p className="text-sm">{note.oneLine}</p>
              )}

              {note.relatedBookId && (
                <div className="mt-2 text-xs text-muted-foreground">
                  관련: {note.relatedBookId} {note.relatedChapter && `${note.relatedChapter}장`}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
