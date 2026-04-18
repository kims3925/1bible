/**
 * 오디오 플레이어 훅
 * HTML5 Audio API + Media Session API (잠금화면 컨트롤)
 */

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onChapterComplete?: () => void;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  speed: number;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    speed: 1.0,
  });

  // 오디오 엘리먼트 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadStart = () => setState((s) => ({ ...s, isLoading: true, error: null }));
    const handleCanPlay = () => setState((s) => ({ ...s, isLoading: false }));
    const handleLoadedMetadata = () => setState((s) => ({ ...s, duration: audio.duration }));
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setState((s) => ({ ...s, currentTime: time }));
      options.onTimeUpdate?.(time);
    };
    const handleEnded = () => {
      setState((s) => ({ ...s, isPlaying: false }));
      options.onEnded?.();
    };
    const handleError = () => {
      setState((s) => ({ ...s, isLoading: false, error: '오디오 로드에 실패했습니다' }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 소스 설정
  const loadSource = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = url;
    audio.load();
  }, []);

  // 재생
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setState((s) => ({ ...s, isPlaying: true }));
    } catch {
      setState((s) => ({ ...s, error: '재생에 실패했습니다' }));
    }
  }, []);

  // 일시정지
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  // 토글
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // 탐색
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
  }, []);

  // 상대적 탐색
  const seekRelative = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.currentTime + delta, audio.duration || 0));
  }, []);

  // 속도 변경
  const setSpeed = useCallback((speed: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
    setState((s) => ({ ...s, speed }));
  }, []);

  // Media Session API (잠금화면/차에서듣기 컨트롤)
  const setupMediaSession = useCallback(
    (metadata: { title: string; artist?: string; album?: string; artwork?: string }) => {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist || '게을러도성경일독',
        album: metadata.album || '성경',
        artwork: metadata.artwork
          ? [{ src: metadata.artwork, sizes: '512x512', type: 'image/png' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => seekRelative(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => seekRelative(15));
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', () => options.onChapterComplete?.());
    },
    [play, pause, seekRelative, options]
  );

  return {
    ...state,
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setSpeed,
    loadSource,
    setupMediaSession,
    audioRef,
  };
}
