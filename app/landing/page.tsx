/**
 * 랜딩페이지
 * hunlink 스타일 소개 + 기능 카드 + 사용자 후기 + 실시간 카운터 + CTA
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: '🎧',
    title: '읽어지게 하는 성경',
    description: '시간을 선택하면 바로 이어서 읽기가 진행됩니다. 의지력 없이도 자연스럽게.',
  },
  {
    icon: '📖',
    title: '시간/책별 선택읽기',
    description: '5분부터 2시간까지, 66권 책별/컬렉션별 원하는 방식으로.',
  },
  {
    icon: '🌍',
    title: '영어 병행 학습',
    description: '영어로읽기, 영어한국어번갈아읽기 모드로 성경과 영어를 동시에.',
  },
  {
    icon: '🚗',
    title: '진도관리 / 차에서듣기',
    description: '365일 플랜 + 오디오 배경재생. 출퇴근길에도 말씀과 함께.',
  },
  {
    icon: '💑',
    title: '함께읽기',
    description: '커플, 소그룹, 교회와 함께. 보증금 챌린지로 끝까지 완주.',
  },
  {
    icon: '🙏',
    title: '쉬운 묵상',
    description: '쓰지 않아도 되는 묵상. 선택만 하세요. 탭/선택만으로 묵상 기록 완성.',
  },
];

const TESTIMONIALS = [
  {
    name: '김은혜',
    role: '직장인',
    text: '출근길 10분씩 듣기로 시작했는데, 어느새 성경 일독을 완료했습니다. 정말 게을러도 됩니다!',
    days: 365,
  },
  {
    name: '박민수',
    role: '대학생',
    text: '영어 병행 읽기 덕분에 토익 점수도 올랐어요. 성경도 읽고 영어도 공부하고 일석이조!',
    days: 180,
  },
  {
    name: '이수진 & 정현우',
    role: '부부',
    text: '커플읽기로 매일 함께 성경을 읽으니 대화도 늘고 신앙도 깊어졌어요.',
    days: 270,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [userCount, setUserCount] = useState(1247);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // 실시간 카운터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 후기 캐러셀 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /**
   * CTA 라우팅 — 대표님 요청에 따른 UX 플로우:
   * - 시작하기/바로읽기 → /home (성경읽기 화면, 비회원도 접근 가능)
   * - 유료 플랜(Premium) → /auth (가입 필요)
   * - Church SaaS 문의 → /contact/church
   * - ref 파라미터는 모든 경로에 부착하여 유입 추적
   */
  const handleStartReading = (ref: string) => {
    router.push(`/home?ref=${ref}`);
  };

  const handleAuthCTA = (ref: string, extra?: string) => {
    const params = new URLSearchParams();
    params.set('ref', ref);
    if (extra) {
      extra.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k && v) params.set(k, v);
      });
    }
    router.push(`/auth?${params.toString()}`);
  };

  /** 비로그인 → 바로 체험 (검사 등) */
  const handleTrial = (type: string, ref: string) => {
    router.push(`/trial/${type}?ref=${ref}`);
  };

  /** Church SaaS 문의 */
  const handleChurchInquiry = () => {
    router.push('/contact/church?ref=bible-landing-church');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* 히어로 섹션 */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <p className="mb-4 text-sm font-medium tracking-widest text-blue-400 uppercase">
            Lazy Bible Read Platform
          </p>
          <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-5xl">
            성경을 읽지 못하는 것은
            <br />
            <span className="text-blue-400">게을러서가 아니라,</span>
            <br />
            구조화를 하지 못해서이다
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            작심삼일 <span className="font-bold text-red-400">NO!</span> 이제{' '}
            <span className="font-bold text-blue-400">작심평생</span>
          </p>
          <button
            onClick={() => handleStartReading('bible-landing-hero')}
            className="rounded-2xl bg-blue-500 px-10 py-4 text-lg font-bold shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
          >
            바로 성경읽기
          </button>
          <p className="mt-4 text-sm text-slate-400">
            회원가입 없이 바로 성경읽기를 시작하세요
          </p>
        </div>

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-8 animate-bounce">
          <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 실시간 카운터 */}
      <section className="border-y border-slate-700/50 bg-slate-800/50 py-8 text-center">
        <p className="text-sm text-slate-400">현재</p>
        <p className="my-2 text-4xl font-bold text-blue-400">
          {userCount.toLocaleString()}명
        </p>
        <p className="text-sm text-slate-400">이 함께 읽고 있습니다</p>
      </section>

      {/* 6대 핵심 기능 */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold">6대 핵심 기능</h2>
        <p className="mb-12 text-center text-slate-400">
          게을러도 성경 일독을 완주할 수 있는 비결
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all hover:border-blue-500/50 hover:bg-slate-800"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 사용자 후기 */}
      <section className="bg-slate-800/30 px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold">완독 후기</h2>
        <p className="mb-12 text-center text-slate-400">
          실제 사용자들의 이야기
        </p>

        <div className="mx-auto max-w-lg">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all duration-500',
                currentTestimonial === idx
                  ? 'scale-100 opacity-100'
                  : 'hidden'
              )}
            >
              <p className="mb-4 text-lg leading-relaxed text-slate-200">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
                <div className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
                  {testimonial.days}일 완주
                </div>
              </div>
            </div>
          ))}

          {/* 인디케이터 */}
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  currentTestimonial === idx
                    ? 'w-6 bg-blue-500'
                    : 'w-2 bg-slate-600'
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 플랜 안내 */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-bold">요금제</h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h3 className="mb-1 text-lg font-bold">Free</h3>
            <p className="mb-4 text-3xl font-bold">무료</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 기본 읽기 플랜
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 개인 챌린지
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 기본 TTS 오디오
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 기본 묵상
              </li>
            </ul>
            <button
              onClick={() => handleStartReading('bible-landing-pricing-free')}
              className="mt-6 w-full rounded-xl border border-slate-600 py-3 font-medium transition-all hover:bg-slate-700"
            >
              바로 읽기 시작
            </button>
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-slate-800 p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-bold">
              인기
            </div>
            <h3 className="mb-1 text-lg font-bold">Premium</h3>
            <p className="mb-4 text-3xl font-bold">
              &#8361;4,900<span className="text-base font-normal text-slate-400">/월</span>
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 고품질 성우 오디오
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 드라마바이블
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 영어학습 모드
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 오프라인 다운로드
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> AI 묵상 해설
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 광고 제거
              </li>
            </ul>
            <button
              onClick={() => handleAuthCTA('bible-landing-pricing', 'plan=premium')}
              className="mt-6 w-full rounded-xl bg-blue-500 py-3 font-medium transition-all hover:bg-blue-400"
            >
              Premium 시작
            </button>
          </div>

          {/* Church SaaS */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h3 className="mb-1 text-lg font-bold">Church SaaS</h3>
            <p className="mb-4 text-3xl font-bold">
              &#8361;49,000<span className="text-base font-normal text-slate-400">/월</span>
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 관리자 대시보드
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 참여율 분석
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 단체 챌린지
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 교회 브랜딩
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span> 리포트 출력
              </li>
            </ul>
            <button
              onClick={handleChurchInquiry}
              className="mt-6 w-full rounded-xl border border-slate-600 py-3 font-medium transition-all hover:bg-slate-700"
            >
              문의하기
            </button>
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="border-t border-slate-700/50 px-6 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          지금 시작하세요
        </h2>
        <p className="mb-8 text-lg text-slate-400">
          {userCount.toLocaleString()}명과 함께 성경 일독에 도전하세요
        </p>
        <button
          onClick={() => handleStartReading('bible-landing-footer')}
          className="rounded-2xl bg-blue-500 px-12 py-4 text-lg font-bold shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 active:scale-95"
        >
          바로 성경읽기
        </button>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-700/50 px-6 py-8 text-center text-sm text-slate-500">
        <p>게을러도성경일독 &copy; 2026 | 작심삼일 NO! 이제 작심평생</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-slate-300">이용약관</a>
          <a href="#" className="hover:text-slate-300">개인정보처리방침</a>
          <a href="#" className="hover:text-slate-300">고객센터</a>
        </div>
      </footer>
    </div>
  );
}
