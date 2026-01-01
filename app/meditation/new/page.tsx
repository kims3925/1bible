/**
 * 묵상 입력 페이지
 * 게으른자의 묵상: 선택 → 자동 문장 → 저장
 */

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMeditationStore } from '@/stores';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { generateMeditationSummary } from '@/lib/generateMeditationSummary';
import { getPassageById } from '@/lib/samplePassages';
import { GRACE_TAGS, EMOTIONS, GRATITUDE_TAGS, DECISION_TAGS } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { saveMeditation } from '@/lib/db';
import type { MeditationEntry } from '@/types';

function MeditationNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passageId = searchParams.get('passageId') || '';

  const {
    graceTags,
    emotionPrimary,
    emotionSecondary,
    gratitudeTags,
    decisionTag,
    userNote,
    toggleGrace,
    setEmotionPrimary,
    toggleEmotionSecondary,
    toggleGratitude,
    setDecision,
    setUserNote,
    setPassage,
    reset,
  } = useMeditationStore();

  const [isSaving, setIsSaving] = useState(false);

  // 본문 정보 로드
  const passage = useMemo(() => getPassageById(passageId), [passageId]);

  useEffect(() => {
    if (passage) {
      setPassage(passage.id, passage.title);
    }
  }, [passage, setPassage]);

  // 자동 문장 생성
  const autoSummary = useMemo(() => {
    if (!emotionPrimary) return '';
    return generateMeditationSummary({
      graceTags,
      emotionPrimary,
      emotionSecondary,
      gratitudeTags,
      decisionTag,
    });
  }, [graceTags, emotionPrimary, emotionSecondary, gratitudeTags, decisionTag]);

  // 선택된 감정의 2차 옵션
  const secondaryOptions = useMemo(() => {
    const emotion = EMOTIONS.find((e) => e.id === emotionPrimary);
    return emotion?.secondary || [];
  }, [emotionPrimary]);

  // 저장
  const handleSave = async () => {
    if (!passage || !emotionPrimary) return;

    setIsSaving(true);

    const entry: MeditationEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      passageId: passage.id,
      passageTitle: passage.title,
      graceTags,
      emotionPrimary,
      emotionSecondary,
      gratitudeTags,
      decisionTag,
      autoSummary,
      userNote: userNote || undefined,
    };

    try {
      await saveMeditation(entry);
      reset();
      router.push(`/meditation/${entry.id}`);
    } catch (error) {
      console.error('저장 실패:', error);
      setIsSaving(false);
    }
  };

  const canSave = emotionPrimary !== '';

  if (!passage) {
    return (
      <>
        <Header title="묵상 기록" showBack />
        <div className="page-container flex items-center justify-center">
          <p className="text-muted-foreground">본문을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="게으른자의 묵상" showBack />

      <div className="page-container space-y-6 pt-4">
        {/* 본문 정보 */}
        <Card>
          <p className="text-sm text-muted-foreground">오늘의 말씀</p>
          <h2 className="mt-1 font-semibold">{passage.title}</h2>
        </Card>

        {/* 1. 은혜 선택 */}
        <section>
          <h3 className="section-title">어떤 은혜를 받았나요?</h3>
          <p className="helper-text mb-3">여러 개 선택 가능</p>
          <div className="flex flex-wrap gap-2">
            {GRACE_TAGS.map((tag) => (
              <Chip
                key={tag}
                selected={graceTags.includes(tag)}
                onClick={() => toggleGrace(tag)}
                size="sm"
              >
                {tag}
              </Chip>
            ))}
          </div>
        </section>

        {/* 2. 감정 선택 (1차) */}
        <section>
          <h3 className="section-title">지금 마음은 어떤가요?</h3>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emotion) => (
              <Chip
                key={emotion.id}
                selected={emotionPrimary === emotion.id}
                onClick={() => setEmotionPrimary(emotion.id)}
              >
                {emotion.label}
              </Chip>
            ))}
          </div>

          {/* 2차 감정 */}
          {secondaryOptions.length > 0 && (
            <div className="mt-4">
              <p className="helper-text mb-2">조금 더 구체적으로</p>
              <div className="flex flex-wrap gap-2">
                {secondaryOptions.map((sec) => (
                  <Chip
                    key={sec}
                    selected={emotionSecondary.includes(sec)}
                    onClick={() => toggleEmotionSecondary(sec)}
                    size="sm"
                  >
                    {sec}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. 감사 선택 */}
        <section>
          <h3 className="section-title">감사한 것이 있나요?</h3>
          <div className="flex flex-wrap gap-2">
            {GRATITUDE_TAGS.map((tag) => (
              <Chip
                key={tag}
                selected={gratitudeTags.includes(tag)}
                onClick={() => toggleGratitude(tag)}
                size="sm"
              >
                {tag}
              </Chip>
            ))}
          </div>
        </section>

        {/* 4. 결단 선택 */}
        <section>
          <h3 className="section-title">오늘의 작은 결단</h3>
          <div className="flex flex-wrap gap-2">
            {DECISION_TAGS.map((tag) => (
              <Chip
                key={tag}
                selected={decisionTag === tag}
                onClick={() => setDecision(tag)}
                size="sm"
              >
                {tag}
              </Chip>
            ))}
          </div>
        </section>

        {/* 자동 문장 미리보기 */}
        {autoSummary && (
          <Card className="bg-primary/5">
            <h3 className="mb-2 font-semibold">오늘의 묵상</h3>
            <p className="whitespace-pre-line text-muted-foreground">{autoSummary}</p>
          </Card>
        )}

        {/* 추가 메모 (선택) */}
        <section>
          <h3 className="section-title">한 줄 더 (선택)</h3>
          <textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="덧붙이고 싶은 말이 있다면..."
            className="w-full rounded-xl border border-border bg-background p-4 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
          />
        </section>

        {/* 저장 버튼 */}
        <Button
          fullWidth
          size="lg"
          onClick={handleSave}
          disabled={!canSave || isSaving}
        >
          {isSaving ? '저장 중...' : '묵상 저장하기'}
        </Button>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <Header title="게으른자의 묵상" showBack />
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </>
  );
}

export default function MeditationNewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MeditationNewContent />
    </Suspense>
  );
}
