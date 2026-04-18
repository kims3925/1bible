/**
 * 교회/단체 문의 폼 페이지
 * 비로그인 접근 가능 — Church SaaS 리드 수집
 *
 * church_inquiries 테이블:
 *   church_name, contact_name, contact_info, church_size,
 *   desired_start_date, message, source_ref, status
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { captureRefFromUrl, attachRefToEvent } from '@/lib/analytics/ref-tracker';

type ChurchSize = '<50' | '50-200' | '200-500' | '500+';

interface FormData {
  churchName: string;
  contactName: string;
  contactInfo: string;
  churchSize: ChurchSize | '';
  desiredStartDate: string;
  message: string;
}

const CHURCH_SIZE_OPTIONS: { value: ChurchSize; label: string }[] = [
  { value: '<50', label: '50명 미만' },
  { value: '50-200', label: '50~200명' },
  { value: '200-500', label: '200~500명' },
  { value: '500+', label: '500명 이상' },
];

function ChurchContactContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'direct';

  const [form, setForm] = useState<FormData>({
    churchName: '',
    contactName: '',
    contactInfo: '',
    churchSize: '',
    desiredStartDate: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    captureRefFromUrl();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // 검증
    if (!form.churchName.trim() || !form.contactName.trim() || !form.contactInfo.trim()) {
      setErrorMsg('교회명, 담당자명, 연락처는 필수 항목입니다.');
      setStatus('error');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('church_inquiries').insert({
        church_name: form.churchName.trim(),
        contact_name: form.contactName.trim(),
        contact_info: form.contactInfo.trim(),
        church_size: form.churchSize || null,
        desired_start_date: form.desiredStartDate || null,
        message: form.message.trim() || null,
        source_ref: ref,
      });

      if (error) {
        console.error('[church-inquiry] DB error:', error);
        setErrorMsg('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setStatus('error');
        return;
      }

      attachRefToEvent('church_inquiry_submitted', {
        church_size: form.churchSize,
        source_ref: ref,
      });

      setStatus('success');
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      setStatus('error');
    }
  };

  // 제출 완료 화면
  if (status === 'success') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/80 p-8 text-center shadow-xl backdrop-blur">
          <div className="mb-4 text-5xl">🙏</div>
          <h2 className="mb-2 text-xl font-bold text-white">문의가 접수되었습니다</h2>
          <p className="mb-6 text-sm text-slate-400">
            담당자가 확인 후 빠르게 연락드리겠습니다.
            <br />
            보통 1~2 영업일 내에 회신합니다.
          </p>
          <div className="space-y-3">
            <a
              href="/home"
              className="block w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
            >
              성경읽기 시작하기
            </a>
            <a
              href="/landing"
              className="block w-full rounded-xl border border-slate-600 py-3 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              소개 페이지로 돌아가기
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">⛪</div>
          <h1 className="text-2xl font-bold text-white">교회/단체 도입 문의</h1>
          <p className="mt-2 text-sm text-slate-400">
            Church SaaS로 성도들의 성경읽기를 함께 관리하세요.
            <br />
            단체 매니저 대시보드, 참여율 분석, 교회 브랜딩을 제공합니다.
          </p>
        </div>

        {/* 가격 안내 */}
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <span className="text-lg">💎</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-300">Church SaaS</p>
              <p className="text-xs text-slate-400">
                월 ₩49,000 · 10개 탭 매니저 대시보드 · 리포트 PDF
              </p>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-xl backdrop-blur"
        >
          <div className="space-y-4">
            {/* 교회명 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                교회/단체명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.churchName}
                onChange={(e) => updateField('churchName', e.target.value)}
                placeholder="예: 은혜교회"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 담당자명 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                담당자명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                placeholder="예: 김목사"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                연락처 (이메일 또는 전화) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.contactInfo}
                onChange={(e) => updateField('contactInfo', e.target.value)}
                placeholder="예: pastor@church.org 또는 010-1234-5678"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 교회 규모 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                교회 규모 (출석 성도 수)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHURCH_SIZE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField('churchSize', form.churchSize === value ? '' : value)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      form.churchSize === value
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 희망 시작일 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                희망 시작 시기
              </label>
              <input
                type="date"
                value={form.desiredStartDate}
                onChange={(e) => updateField('desiredStartDate', e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 추가 메시지 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                추가 문의사항
              </label>
              <textarea
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="궁금한 점이나 원하시는 기능이 있으면 자유롭게 작성해주세요."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-6 w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
          >
            {status === 'loading' ? '접수 중...' : '문의 접수하기'}
          </button>

          {/* 안내 */}
          <p className="mt-4 text-center text-xs text-slate-500">
            문의 내용은 안전하게 보관되며, 마케팅 목적으로 사용되지 않습니다.
          </p>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <a
            href="/landing"
            className="text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            ← 소개 페이지로 돌아가기
          </a>
        </div>
      </div>
    </main>
  );
}

export default function ChurchContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
          <div className="text-slate-400">로딩 중...</div>
        </div>
      }
    >
      <ChurchContactContent />
    </Suspense>
  );
}
