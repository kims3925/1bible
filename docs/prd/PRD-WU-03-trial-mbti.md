# PRD-WU-03: MBTI 체험 페이지 (게스트 플로우 표준)

| 항목 | 내용 |
|---|---|
| **작업 단위** | WU-03 |
| **의존성** | WU-02 (게스트 세션 인프라) 완료 |
| **예상 소요** | 1.5일 |
| **우선순위** | P0 — 전환 퍼널 핵심 |
| **참조** | 이 PRD의 구조는 WU-04 (DISC), WU-05 (은사)에도 동일 적용 |

---

## 1. 배경과 목표

현재 `hublink.im/bible` 랜딩의 "성경인물 MBTI" 카드에 **"무료 검사 시작"** 버튼이 있다. 클릭 시 `bible.hublink.im/trial/mbti?ref=hublink-bible-mbti` 로 이동하며, **가입 없이** 문항을 풀고 결과까지 볼 수 있어야 한다.

**핵심 전환 가설**: 가입 문턱 없이 결과까지 도달한 사용자의 30% 이상이 "저장·공유"를 위해 가입한다.

## 2. 사용자 플로우

```
[hublink.im/bible 랜딩]
    ↓ "무료 검사 시작" 클릭
[bible.hublink.im/trial/mbti?ref=hublink-bible-mbti]
    ↓ (게스트 세션 쿠키 발급)
[소개 화면] "12문항 · 3분"
    ↓ "시작하기"
[문항 1/12]
    ↓ 답변
[문항 2/12]
    ... (12문항)
    ↓ 마지막 답변
[로딩 2초] "결과 분석 중..."
    ↓
[결과 화면]
    - 유형 발표 (예: "당신은 '모세' 유형입니다")
    - 성격 해설 3~4문단
    - 강점 3개
    - 성경적 적용 2개
    - "공유하기" 버튼 (SNS 카드)
    - "가입하고 결과 저장하기" CTA ← 전환 포인트
    - "다른 검사 해보기" (DISC, 은사)
```

## 3. 라우트 구조

```
apps/web/app/trial/
├── layout.tsx                    # 공통 레이아웃 (게스트 세션 발급)
├── page.tsx                      # /trial — 3종 검사 메뉴
├── mbti/
│   ├── page.tsx                  # 소개 + 시작
│   ├── quiz/page.tsx             # 12문항 스텝퍼
│   ├── result/page.tsx           # 결과
│   └── result-actions.tsx        # 공유·가입 유도
├── disc/  (WU-04)
└── gifts/ (WU-05)

apps/web/app/api/trial/
├── save-answer/route.ts          # POST — 응답 저장
└── get-result/route.ts           # GET  — 결과 재조회
```

## 4. 데이터 스키마

### 4-1. 문항 정의 파일

```
content/assessments/bible-mbti.json
```

```json
{
  "id": "bible-mbti",
  "title_ko": "성경인물 MBTI",
  "description_ko": "16유형 중 나와 닮은 성경인물은?",
  "question_count": 12,
  "estimated_minutes": 3,
  "tier": "free",
  "dimensions": ["EI", "SN", "TF", "JP"],
  "questions": [
    {
      "id": "q1",
      "dimension": "EI",
      "text": "모임에서 나는...",
      "options": [
        { "value": "E", "label": "먼저 다가가 이야기를 건다" },
        { "value": "I", "label": "조용히 분위기를 관찰한다" }
      ]
    }
    // ... 11개 추가
  ],
  "result_types": {
    "ENFJ": {
      "bible_figure": "모세",
      "title_ko": "공동체의 지도자 · 모세 유형",
      "description": "...",
      "strengths": ["...", "...", "..."],
      "biblical_application": ["...", "..."],
      "recommended_reading": ["출애굽기 3장", "신명기 6장"]
    }
    // ... 16유형 전부
  }
}
```

### 4-2. 결과 계산 로직

```typescript
// lib/assessments/mbti-calculator.ts

export function calculateMbtiResult(
  answers: Record<string, 'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'>
): { type: string; scores: Record<string, number> } {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  Object.values(answers).forEach(v => scores[v]++);

  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');

  return { type, scores };
}
```

## 5. 컴포넌트 명세

### 5-1. `<QuizStepper />` — 공용 스텝퍼

```tsx
interface QuizStepperProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  persistKey: string; // localStorage 임시 저장 키 (새로고침 대비)
}
```

- 한 화면에 한 문항
- 상단 진행바 `3 / 12` + 시각적 프로그레스
- 답변 시 자동 다음 (0.3초 딜레이)
- "이전" 버튼 지원 — 이전 답변 수정 가능
- localStorage에 답변 자동 저장 → 새로고침/뒤로가기도 안전

### 5-2. `<ResultReveal />` — 결과 카드

```tsx
interface ResultRevealProps {
  assessmentId: string;
  resultType: string;
  resultData: ResultTypeData;
  guestMode: boolean; // true면 "가입하고 저장" CTA 표시
  shareCardUrl: string;
}
```

- 결과 유형 큰 타이틀 + 성경 인물 이모지
- 3~4문단 해설
- 강점·적용 리스트
- "공유하기" → navigator.share 또는 링크 복사
- "가입하고 결과 저장하기" — 큰 파란 CTA
- "다른 검사 해보기" — 작은 링크

### 5-3. `<GuestBanner />` — 상단 고지

```tsx
<div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm py-2 px-4 text-center">
  💡 비회원으로 체험 중입니다.
  <button onClick={signUp} className="underline ml-1">가입하면 결과가 저장돼요</button>
</div>
```

## 6. 접근성 요구사항

- **키보드 네비게이션**: Tab으로 옵션 이동, Enter/Space로 선택
- **스크린 리더**: 각 옵션 `role="radio"`, 그룹 `role="radiogroup"` + `aria-labelledby`
- **진행 상황**: `aria-live="polite"` 로 "문항 3/12" 안내
- **색상**: 선택/미선택 구분이 색상 외에도 보더·체크마크로 표현
- **폰트 스케일**: 사용자 설정 존중, 최소 16px
- **reduced-motion**: 진행바 애니메이션 비활성화

## 7. 분석 이벤트 (PostHog)

```typescript
posthog.capture('trial_started', {
  assessment_id: 'bible-mbti',
  ref: 'hublink-bible-mbti',
  is_guest: true,
  guest_id: guestId,
});

posthog.capture('trial_question_answered', {
  assessment_id: 'bible-mbti',
  question_id: 'q3',
  question_index: 3,
  total_questions: 12,
});

posthog.capture('trial_completed', {
  assessment_id: 'bible-mbti',
  result_type: 'ENFJ',
  duration_seconds: 142,
});

posthog.capture('trial_result_viewed', { ... });
posthog.capture('trial_shared', { platform: 'kakao' });
posthog.capture('trial_signup_clicked', { ... });
```

**핵심 퍼널 지표**:
- `trial_started` → `trial_completed`: 완주율 (목표 60%+)
- `trial_completed` → `trial_signup_clicked`: 가입 의향률 (목표 30%+)
- `trial_signup_clicked` → `signup_completed`: 최종 전환율

## 8. API 엔드포인트

### 8-1. `POST /api/trial/save-answer`

```typescript
// Request
{
  assessmentId: 'bible-mbti',
  answers: { q1: 'E', q2: 'I', ... },
  refSource?: 'hublink-bible-mbti'
}

// Response
{
  id: 'uuid',
  resultType: 'ENFJ',
  createdAt: '2026-04-18T...'
}
```

- 쿠키의 `guest_id` 자동 사용
- Rate limit: 10 req/min per guest_id
- 실패 시: 409 (이미 제출됨), 400 (유효성), 500 (서버)

### 8-2. `GET /api/trial/get-result?id={trialAssessmentId}`

- 본인의 guest_id와 일치하는 결과만 반환
- 다른 guest의 id 조회 시 404

## 9. 완료 기준

- [ ] `/trial/mbti` (소개) → `/trial/mbti/quiz` → `/trial/mbti/result` 3화면 구현
- [ ] 12문항 전부 답하면 결과 페이지 자동 이동
- [ ] 새로고침 후 답변 유지 (localStorage)
- [ ] 답변 미완료 상태로 `/result` 직접 접근 시 `/quiz` 로 리다이렉트
- [ ] 결과 페이지에서 "공유하기" 동작 (카카오·링크 복사)
- [ ] 결과 페이지에서 "가입하고 저장" → `/auth?ref=trial-mbti-result&next=/app/assessments` 이동
- [ ] PostHog 5개 이벤트 발송
- [ ] 접근성: 키보드만으로 완주 가능
- [ ] 모바일 환경 (iPhone SE 375px) 레이아웃 깨짐 없음
- [ ] E2E 테스트: Playwright로 "시작→완주→결과→공유" 시나리오 통과

## 10. 콘텐츠 작업 (B4 Meditation/Assessment Agent)

별도 트랙으로 진행:
- [ ] `content/assessments/bible-mbti.json` 문항 12개 + 16유형 해설 작성
- [ ] 신학 감수자 1회 검토 (이단적 해석 없음 확인)
- [ ] Joseph 최종 승인

## 11. Cowork 의뢰 프롬프트

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-WU-03-trial-mbti.md (이 문서)
- apps/web/lib/trial/guest-session.ts (WU-02 산출물)
- content/assessments/bible-mbti.json (임시 5문항 샘플만 있으면 OK)
- apps/web/components/ui/Button.tsx

작업:
다음 파일들을 순서대로 구현:
1) app/trial/layout.tsx — 공통 레이아웃 + 게스트 세션 발급
2) app/trial/mbti/page.tsx — 소개 화면
3) app/trial/mbti/quiz/page.tsx — 12문항 스텝퍼
4) app/trial/mbti/result/page.tsx — 결과 화면
5) app/api/trial/save-answer/route.ts — 저장 API
6) components/trial/QuizStepper.tsx — 재사용 컴포넌트
7) lib/assessments/mbti-calculator.ts — 결과 계산

각 단계 끝에 "다음 단계 진행할까요?" 확인받으세요.
```

## 12. 이 패턴을 WU-04/05 에 재사용

WU-04 (DISC), WU-05 (은사)는 이 PRD의 구조를 그대로 복제하되:
- 문항 수·차원만 다름 (DISC: 4차원, 은사: 7은사)
- `<QuizStepper />` 재사용
- 결과 계산 로직만 교체
- 페이지 구조 동일
