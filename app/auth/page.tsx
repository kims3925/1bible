/**
 * 로그인/회원가입 페이지
 * Hub_Link SSO 통합 + 네이버/카카오/구글/애플 소셜 로그인
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import type { Provider } from '@supabase/supabase-js';

type AuthTab = 'login' | 'signup';

const RESERVED_USERNAMES = [
  'manager', 'admin', 'demo', 'api', 'help', 'blog', 'about',
  'pricing', 'landing', 'auth', 'settings', 'community',
];

/** 소셜 로그인 버튼 설정 */
const SOCIAL_PROVIDERS: { provider: string; label: string; icon: string; bgColor: string; textColor: string }[] = [
  {
    provider: 'naver',
    label: '네이버',
    icon: 'N',
    bgColor: 'bg-[#03C75A]',
    textColor: 'text-white',
  },
  {
    provider: 'kakao',
    label: '카카오',
    icon: 'K',
    bgColor: 'bg-[#FEE500]',
    textColor: 'text-[#191919]',
  },
  {
    provider: 'google',
    label: 'Google',
    icon: 'G',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
  },
  {
    provider: 'apple',
    label: 'Apple',
    icon: '',
    bgColor: 'bg-black',
    textColor: 'text-white',
  },
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    isLoggedIn,
    isLoading,
    refreshSession,
  } = useAuthStore();

  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // 에러 파라미터 처리
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }, [searchParams]);

  // 세션 체크
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // 이미 로그인 되어있으면 매니저로 이동
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/manager');
    }
  }, [isLoggedIn, router]);

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
      setUsernameStatus('invalid');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('valid');
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력하세요');
      return;
    }
    const result = await signInWithEmail(email, password);
    if (result.success) {
      router.push('/manager');
    } else {
      if (result.error?.includes('Invalid login')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (result.error?.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 메일함을 확인해주세요');
      } else {
        setError(result.error || '로그인에 실패했습니다');
      }
    }
  };

  const handleSignUp = async () => {
    setError('');
    if (!email || !password || !username) {
      setError('모든 항목을 입력하세요');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    if (usernameStatus !== 'valid') {
      setError('유효한 사용자 이름을 입력하세요');
      return;
    }
    const result = await signUpWithEmail(email, password, username);
    if (result.success) {
      router.push('/manager');
    } else {
      if (result.error?.includes('already registered')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해주세요');
      } else {
        setError(result.error || '회원가입에 실패했습니다');
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setError('');
    try {
      await signInWithOAuth(provider as Provider);
    } catch {
      setError('소셜 로그인 처리 중 오류가 발생했습니다');
      setSocialLoading(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      tab === 'login' ? handleLogin() : handleSignUp();
    }
  };

  if (isLoggedIn) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">게을러도 성경일독</h1>
          <p className="mt-1 text-sm text-slate-400">작심삼일 NO! 이제 작심평생</p>
        </div>

        {/* 카드 */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-xl backdrop-blur">

          {/* 소셜 로그인 — 상단 배치 */}
          <div className="mb-6">
            <p className="mb-3 text-center text-sm text-slate-400">간편 로그인</p>
            <div className="space-y-2.5">
              {SOCIAL_PROVIDERS.map(({ provider, label, icon, bgColor, textColor }) => (
                <button
                  key={provider}
                  onClick={() => handleSocialLogin(provider)}
                  disabled={socialLoading !== null}
                  className={cn(
                    'flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]',
                    bgColor,
                    textColor,
                    socialLoading === provider && 'opacity-70',
                    socialLoading !== null && socialLoading !== provider && 'opacity-40',
                    provider === 'google' && 'border border-gray-300',
                  )}
                >
                  {provider === 'apple' ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  ) : (
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md text-xs font-black',
                      provider === 'naver' && 'bg-white/20',
                      provider === 'kakao' && 'bg-black/10',
                      provider === 'google' && 'bg-transparent',
                    )}>
                      {icon}
                    </span>
                  )}
                  {socialLoading === provider ? '연결 중...' : `${label}로 시작하기`}
                </button>
              ))}
            </div>
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-800/80 px-3 text-slate-500">또는 이메일로</span>
            </div>
          </div>

          {/* 탭 전환 */}
          <div className="mb-5 flex rounded-xl bg-slate-700/50 p-1">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                tab === 'login'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              로그인
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                tab === 'signup'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              회원가입
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* 로그인 폼 */}
          {tab === 'login' && (
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          )}

          {/* 회원가입 폼 */}
          {tab === 'signup' && (
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">사용자 이름</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setUsername(val);
                      validateUsername(val);
                    }}
                    placeholder="username"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 py-3 pl-9 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {username && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {usernameStatus === 'valid' ? (
                        <span className="text-green-400">&#10003;</span>
                      ) : (
                        <span className="text-red-400">&#10007;</span>
                      )}
                    </span>
                  )}
                </div>
                {username && usernameStatus === 'invalid' && (
                  <p className="mt-1 text-xs text-red-400">
                    영문, 숫자, 밑줄(_)만 사용 가능 (3자 이상, 예약어 제외)
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">비밀번호가 일치하지 않습니다</p>
                )}
              </div>
              <button
                onClick={handleSignUp}
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </div>
          )}

          {/* Hub_Link SSO 안내 */}
          <div className="mt-5 rounded-lg bg-slate-700/30 px-4 py-3">
            <p className="text-center text-xs text-slate-500">
              HUB LINK 계정으로도 로그인할 수 있습니다
            </p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/landing')}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            &#8592; 소개 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="text-slate-400">로딩 중...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
