/**
 * 오디오 플레이어 페이지
 * 듣기 중심 UX, 본문 접힘/펼침, 속도 조절
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDuration, cn } from '@/lib/utils';
import { SPEED_OPTIONS } from '@/lib/constants';

export default function PlayerPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    currentPassage,
    isPlaying,
    speed,
    currentTime,
    duration,
    showText,
    pause,
    togglePlay,
    setSpeed,
    setCurrentTime,
    setDuration,
    toggleText,
  } = usePlayerStore();

  // 본문이 없으면 플랜 페이지로
  useEffect(() => {
    if (!currentPassage) {
      router.replace('/plan');
    }
  }, [currentPassage, router]);

  // 오디오 이벤트 핸들링
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      pause();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setDuration, setCurrentTime, pause]);

  // 재생/정지 동기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    if (isPlaying) {
      audio.play().catch(() => pause());
    } else {
      audio.pause();
    }
  }, [isPlaying, isReady, pause]);

  // 속도 변경
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
  }, [speed]);

  const handleSeek = (delta: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
    }
  };

  const handleSpeedChange = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const handleMeditation = () => {
    if (currentPassage) {
      router.push(`/meditation/new?passageId=${currentPassage.id}`);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentPassage) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="font-medium">{currentPassage.book}</span>
        <div className="min-w-touch" />
      </div>

      {/* 본문 정보 */}
      <div className="flex-1 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">{currentPassage.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {formatDuration(currentTime)} / {formatDuration(duration || currentPassage.durationSec)}
          </p>
        </div>

        {/* 본문 텍스트 (접힘/펼침) */}
        <Card
          className={cn(
            'mb-6 cursor-pointer transition-all',
            !showText && 'max-h-24 overflow-hidden'
          )}
          onClick={toggleText}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">본문</h3>
            <svg
              className={cn('h-5 w-5 transition-transform', showText && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className={cn('mt-3 whitespace-pre-line text-muted-foreground', !showText && 'text-ellipsis-2')}>
            {currentPassage.text}
          </p>
          {!showText && (
            <p className="mt-2 text-center text-sm text-primary">탭하여 전체 보기</p>
          )}
        </Card>
      </div>

      {/* 오디오 컨트롤 */}
      <div className="px-4 pb-8">
        {/* 진행 바 */}
        <div className="mb-6">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="mb-6 flex items-center justify-center gap-6">
          {/* 15초 뒤로 */}
          <button
            onClick={() => handleSeek(-15)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* 재생/정지 */}
          <button
            onClick={togglePlay}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            {isPlaying ? (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 15초 앞으로 */}
          <button
            onClick={() => handleSeek(15)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* 속도 조절 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleSpeedChange}
            className="rounded-full border px-4 py-2 text-sm font-medium"
          >
            {speed}x 속도
          </button>
        </div>

        {/* 묵상 CTA */}
        <Button fullWidth onClick={handleMeditation}>
          묵상 체크하기
        </Button>
      </div>

      {/* 오디오 엘리먼트 */}
      <audio ref={audioRef} src={currentPassage.audioUrl} preload="metadata" />
    </div>
  );
}
