# LazyBible — 듀얼 랜딩 + 홈 재설계 + MVP 개발계획서 v2.0

> **v2.0 개정 사항 (2026-04-18)**
> - 실제 배포된 `hublink.im/bible` 랜딩 화면(4장)을 기준으로 전면 재설계
> - 듀얼 랜딩 전략 (`hublink.im/bible` + `bible.hublink.im`) 역할 분담 확정
> - 랜딩의 각 카드·버튼이 **실제 기능으로 연결되는 배선 설계** 추가
> - 무료 검사 3종의 "게스트 체험 → 가입 전환" 플로우 상세화
> - v1.0 문서를 대체합니다

---

## Part 0. 현재 자산 인벤토리

시작 전에 **이미 만들어진 것**과 **새로 만들 것**을 정리합니다.

### 이미 배포되어 있는 것
- **`hublink.im/bible`**: SPA 랜딩 1페이지 (히어로 + 3-Step + 8개 기능 카드 + 3종 검사 + 포인트&게임존 + 완독 후기 + 요금제 3단 + 최종 CTA)
- **`bible.hublink.im`**: 단순 랜딩 + `/auth` 연결

### 새로 만들 것
- **`bible.hublink.im/app`**: 로그인 후 홈 (Part 3 재설계안)
- **`bible.hublink.im/trial/*`**: 비로그인 게스트 체험 (검사 3종)
- **두 랜딩을 엮는 라우팅·SSO·분석 배선**

---

## Part 1. 듀얼 랜딩 전략 (확정)

### 1-1. 두 랜딩의 명확한 역할 분담

| 구분 | `hublink.im/bible` | `bible.hublink.im` |
|---|---|---|
| **정체성** | HubLink 생태계 안의 쇼케이스 랜딩 | LazyBible 독립 서비스 |
| **깊이** | 마케팅 랜딩 (설득·설명·전환) | 앱 전체 (실행·이용) |
| **주 타겟** | HubLink 기존 유저 + 검색 유입 + 교회 의사결정자 | 설득 끝난 사용자 |
| **SEO 키워드** | "성경앱", "성경일독 앱", "교회 성경 플랫폼" | 브랜드 검색 중심 |
| **SSR 필요성** | **필수** (SEO·SNS 미리보기) | SPA 괜찮음 |
| **변경 빈도** | 주 1~2회 (문구·후기·가격) | 일 단위 (기능 업데이트) |
| **배포 주체** | HubLink 본체 저장소 | LazyBible 저장소 |

결정의 핵심: **마케팅 자산(랜딩)은 HubLink 본체에, 제품 자산(앱)은 Bible 서브도메인에**.

### 1-2. 두 랜딩이 만나는 지점 — 라우팅 규약

모든 CTA 버튼의 이동 경로를 통일합니다.

```
[hublink.im/bible 랜딩의 모든 CTA]
          │
          ▼
  ?referrer=hublink-bible 파라미터 부착
          │
          ▼
bible.hublink.im/auth → /onboarding → /app
          │
          ▼
  HubLink SSO 세션 있으면 스킵, 없으면 가입/로그인
```

구체적 매핑:

| 랜딩 버튼 위치 | 이동 경로 |
|---|---|
| 상단 "시작하기" | `bible.hublink.im/auth?ref=hublink-bible-topbar` |
| 히어로 "바로 성경읽기" | `bible.hublink.im/auth?ref=hublink-bible-hero` |
| "지금 바로 체험하기" (핵심기능 섹션) | `bible.hublink.im/trial?ref=hublink-bible-features` |
| MBTI "무료 검사 시작" | `bible.hublink.im/trial/mbti?ref=hublink-bible-mbti` |
| DISC "무료 검사 시작" | `bible.hublink.im/trial/disc?ref=hublink-bible-disc` |
| 은사 체크리스트 "무료 검사 시작" | `bible.hublink.im/trial/gifts?ref=hublink-bible-gifts` |
| Free "바로 읽기 시작" | `bible.hublink.im/auth?plan=free&ref=hublink-bible-pricing` |
| Premium "Premium 시작" | `bible.hublink.im/auth?plan=premium&ref=hublink-bible-pricing` |
| Church SaaS "문의하기" | `bible.hublink.im/contact/church?ref=hublink-bible-church` |
| 하단 "바로 성경읽기" | `bible.hublink.im/auth?ref=hublink-bible-footer` |

### 1-3. SSO 연결 설계

HubLink 본체에 이미 로그인한 사용자는 `/bible` 랜딩 CTA를 누르면 가입 없이 바로 앱으로 진입해야 합니다.

```
사용자가 hublink.im에 로그인한 상태 (쿠키: .hublink.im)
          │
          ▼
hublink.im/bible 방문 → "시작하기" 클릭
          │
          ▼
bible.hublink.im/auth 접근
  │
  ├─ 쿠키 도메인 .hublink.im 이므로 Supabase 세션 인식
  ├─ 유효하면 → /app (바로 홈)
  └─ 무효/없음 → Supabase Auth UI
```

구현 포인트 (Supabase Auth 설정):
```typescript
// lib/supabase/client.ts
export const supabase = createClient(URL, KEY, {
  auth: {
    cookieOptions: {
      domain: '.hublink.im',  // 핵심: 루트 도메인 공유
      sameSite: 'lax',
      secure: true,
    },
  },
});
```

### 1-4. 분석 지표 분리 (PostHog 이벤트 키)

두 랜딩의 전환율을 각각 추적합니다.

```typescript
// 공통 이벤트
posthog.capture('landing_viewed', {
  landing: 'hublink-bible' | 'bible-hublink-im',
  referrer: window.document.referrer,
});

posthog.capture('cta_clicked', {
  landing: 'hublink-bible',
  cta_id: 'hero-primary' | 'trial-mbti' | 'pricing-premium' | ...,
});

posthog.capture('trial_started', {
  trial_type: 'mbti' | 'disc' | 'gifts',
  from_landing: 'hublink-bible',
  is_guest: true,
});

posthog.capture('signup_completed', {
  entry_ref: 'hublink-bible-hero',  // ref 파라미터 그대로
});
```

이걸로 주간 리포트에서 "hublink.im/bible → 가입 전환율" vs "bible.hublink.im → 가입 전환율" 을 비교할 수 있습니다. 보통 **생태계 유입이 외부 검색 유입보다 3~5배 전환율 높습니다**. 이 수치를 실측해야 마케팅 예산 배분이 가능합니다.

---

## Part 2. `hublink.im/bible` 랜딩의 기능 연결 설계

이 파트가 이번 개정의 핵심입니다. 랜딩의 **"무료 검사 시작"** 과 **"지금 바로 체험하기"** 가 실제로 돌아가려면 뒷단 기능이 필요합니다.

### 2-1. 게스트 체험 아키텍처 (비로그인 3종 검사)

현재 랜딩에 있는 **"무료 검사 시작"** 버튼 3개 (MBTI, DISC, 은사)는 **가입 없이 체험 가능**해야 합니다. 가입 허들을 올리면 전환이 죽습니다.

```
[비회원 사용자]
    │
    ▼
/trial/mbti 접속
    │
    ▼
[12문항 응답] — 익명 세션(쿠키)에 임시 저장
    │
    ▼
[결과 카드 표시] — "당신은 모세 유형!"
    │
    ├─ [공유하기] → OG 이미지 생성 + SNS
    │
    └─ [가입하고 결과 저장하기] ← 핵심 전환 포인트
         │
         ▼
    가입 완료 시 임시 응답 → user_assessments 테이블 이전
    첫 보너스 50P 지급
```

이 설계의 핵심은 **"가입 없이 결과까지 보여준 후, 저장·공유를 위해 가입 유도"** 입니다. YouTube·ChatGPT·Duolingo 모두 쓰는 패턴입니다. 실측 전환율이 3~5배 높습니다.

### 2-2. 게스트 세션 처리

```typescript
// lib/trial/guest-session.ts
const GUEST_COOKIE = 'bible_guest_id';

export function getOrCreateGuestId(): string {
  let id = Cookies.get(GUEST_COOKIE);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    Cookies.set(GUEST_COOKIE, id, {
      expires: 30,  // 30일 유지
      domain: '.hublink.im',
    });
  }
  return id;
}

// 검사 응답 임시 저장
export async function saveTrialAnswer(
  guestId: string,
  assessmentId: string,
  answers: unknown
) {
  await supabase
    .from('trial_assessments')
    .insert({
      guest_id: guestId,
      assessment_id: assessmentId,
      answers,
    });
}

// 가입 완료 시 임시 데이터 이전
export async function claimTrialData(userId: string) {
  const guestId = Cookies.get(GUEST_COOKIE);
  if (!guestId) return;

  await supabase.rpc('claim_trial_assessments', {
    p_guest_id: guestId,
    p_user_id: userId,
  });

  Cookies.remove(GUEST_COOKIE);
}
```

### 2-3. 랜딩 각 섹션별 기능 연결 맵

| 랜딩 섹션 | 카드/버튼 | 실제 기능 연결 | 구현 상태 |
|---|---|---|---|
| **히어로** | "바로 성경읽기" | `/auth` (가입 또는 HubLink SSO) | ✅ 구현 필요 |
| **히어로 사회적 증거** | "1,283명이 함께" | 실시간 총 사용자 수 API | ✅ 구현 필요 |
| **이렇게 쉽습니다 3-Step** | 정보 표시 | 링크 없음 (설명만) | — |
| **핵심 기능 8개 카드** | 각 카드 | 설명만. 전체 CTA "지금 바로 체험하기"가 `/trial`로 | ✅ 구현 필요 |
| **3종 검사 "무료 검사 시작"** | 각 검사 | `/trial/{id}` 게스트 체험 플로우 | ✅ 구현 필요 |
| **포인트 & 게임존 3카드** | 설명 | 설명만 (로그인 후 이용) | — |
| **완독 후기 캐러셀** | 후기 순환 | CMS에서 후기 관리 (처음엔 하드코딩) | ✅ 구현 필요 |
| **요금제 Free "바로 읽기 시작"** | 가입 | `/auth?plan=free` | ✅ 구현 필요 |
| **요금제 Premium "Premium 시작"** | 결제 유도 | `/auth?plan=premium` → 가입 후 결제 | ⏳ Phase 2 |
| **요금제 Church SaaS "문의하기"** | 리드 폼 | `/contact/church` | ✅ 구현 필요 |
| **최종 CTA "바로 성경읽기"** | 가입 | `/auth` | ✅ 구현 필요 |

### 2-4. 실시간 지표 (히어로의 "1,283명")

이 숫자는 **조작 금지**입니다. 초기에는 실제 숫자가 작더라도 거짓말하지 마세요. 교회 대상 서비스의 생명은 신뢰입니다.

```typescript
// app/api/public/stats/route.ts
export async function GET() {
  const { count } = await supabase
    .from('bible_profiles')
    .select('*', { count: 'exact', head: true });

  return Response.json({
    totalUsers: count ?? 0,
    cachedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5분 캐시
    },
  });
}
```

- 초기 숫자가 100명 미만이면 **"첫 100명에 함께하세요"** 등으로 표현 전환
- 숫자가 신뢰 임계점(1,000명) 넘으면 자동 표시
- 과장 금지 (장기적으로 손해)

### 2-5. 랜딩 CMS화 (후기·통계 관리)

후기를 코드에 하드코딩하지 말고 **Supabase에서 가져오세요**. 그래야 Joseph님이 새 후기를 받을 때마다 개발자(에이전트) 없이 추가 가능합니다.

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,                     -- "교회 담임", "부부학교 1기"
  content TEXT NOT NULL,
  streak_days INT,                -- 표시용: "365일 연속"
  avatar_emoji TEXT,              -- ⛪, 👨‍🦰 등
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

랜딩에서는:
```typescript
// hublink.im/bible 랜딩 (SSR)
const { data: testimonials } = await supabase
  .from('testimonials')
  .select('*')
  .eq('is_published', true)
  .order('sort_order');
```

관리자는 Supabase 대시보드 또는 추후 `/admin/testimonials` 에서 직접 편집.

### 2-6. Church SaaS 문의 플로우

현재 "문의하기" 버튼이 어디로 가는지 미정입니다. 이 플로우가 Church SaaS 매출의 시작점입니다.

```
/contact/church
    ├─ 교회명 *
    ├─ 담당자 이름 *
    ├─ 연락처 (전화 또는 이메일) *
    ├─ 교회 규모 (<50 / 50-200 / 200-500 / 500+)
    ├─ 도입 희망 시기
    ├─ 자유 메시지
    └─ [제출]
          │
          ▼
    ├─ Supabase: church_inquiries 테이블 저장
    ├─ Joseph에게 이메일/카카오 즉시 알림
    ├─ 자동 답장 메일 발송 (24시간 내 연락)
    └─ PostHog: church_inquiry_submitted 이벤트
```

테이블:
```sql
CREATE TABLE church_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,     -- 전화 또는 이메일
  church_size TEXT,
  desired_start_date DATE,
  message TEXT,
  source_ref TEXT,                -- "hublink-bible-church"
  status TEXT DEFAULT 'new',      -- new/contacted/trial/converted/lost
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 3. 홈 화면 재설계 (`bible.hublink.im/app`)

### 3-1. 설계 원칙

1. **오늘 할 일 1개가 가장 크게 보인다** (Hick's Law)
2. **읽기 전/후 화면이 다르다** (기획서 "읽기 선행 구조" 시각화)
3. **스트릭·포인트·공유는 상단 상시 노출** (리텐션 엔진)

### 3-2. 읽기 **전** 홈 (🔒 잠금 상태)

```
┌─────────────────────────────────────────────────────┐
│  게을러도성경일독                          ☰ 메뉴    │
├─────────────────────────────────────────────────────┤
│   🔥 12일 연속 읽기중        💎 1,240P    📤 공유    │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ╔═══════════════════════════════════════════╗     │
│   ║        📖 오늘의 한 걸음                    ║     │
│   ║        창세기 3장 · 약 7분                  ║     │
│   ║   ┌─────────────────────────────────┐     ║     │
│   ║   │  ▶  바로 듣기 시작                │     ║     │
│   ║   └─────────────────────────────────┘     ║     │
│   ║   ⚡ 오늘 끝내면 +10P · 🔓 모든기능 해금    ║     │
│   ╚═══════════════════════════════════════════╝     │
│                                                      │
│   ▼ 시간이 더 있으세요?                              │
│   [ 10분 ]  [ 30분 ]  [ 다르게 ▾ ]                  │
│                                                      │
├─────────────────────────────────────────────────────┤
│   🔒 오늘 읽기를 마치면 열려요                       │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│   │ 🙏 묵상  │  │ 🎮 게임  │  │ 🧪 검사  │  │ 🎁 상점  │   │
│   │ 잠금    │  │ 잠금    │  │ 잠금    │  │ 잠금    │   │
│   └────────┘  └────────┘  └────────┘  └────────┘   │
├─────────────────────────────────────────────────────┤
│   💭 오늘의 말씀                                     │
│   "근심하는 자 같으나 항상 기뻐하고..."              │
│                          — 고후 6:10                 │
│   [ 📤 공유하기 ]                                   │
├─────────────────────────────────────────────────────┤
│   ▼ 더 많은 읽기 방법 (기본 접힘)                    │
├─────────────────────────────────────────────────────┤
│  🏠 홈    👥 함께    📅 365    📊 진도    👤 My      │
└─────────────────────────────────────────────────────┘
```

### 3-3. 읽기 **후** 홈 (🔓 해금 상태)

```
┌─────────────────────────────────────────────────────┐
│   🔥 13일 연속! ✅  💎 1,260P (+20)  📤 공유         │
├─────────────────────────────────────────────────────┤
│   ╔═══════════════════════════════════════════╗     │
│   ║  ✅ 오늘 창세기 3장 읽기 완료!              ║     │
│   ║  🙏 오늘의 묵상을 남겨보세요 (+15P)          ║     │
│   ║   [ 태그 선택만 하면 끝 ]                    ║     │
│   ╚═══════════════════════════════════════════╝     │
├─────────────────────────────────────────────────────┤
│   🔓 오늘의 보너스 활동                              │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│   │ 🙏 묵상  │  │ 🎮 퀴즈  │  │ 🧪 검사  │  │ 🎁 상점  │   │
│   │ +15P   │  │ 3문제   │  │ 오늘운세│  │ 1,260P  │   │
│   │ NEW    │  │         │  │ 1일1회  │  │         │   │
│   └────────┘  └────────┘  └────────┘  └────────┘   │
├─────────────────────────────────────────────────────┤
│   👥 함께 읽는 사람들                                │
│   • 김집사님이 방금 완료 🎉  [👏 응원]               │
│   • 박권사님 7일 연속 🔥    [👏 응원]               │
├─────────────────────────────────────────────────────┤
│   📊 내 진도                                         │
│   전체 ▓▓▓░░░░░░░ 32%  신약 ▓▓▓▓▓░░ 47%            │
├─────────────────────────────────────────────────────┤
│  🏠 홈    👥 함께    📅 365    📊 진도    👤 My      │
└─────────────────────────────────────────────────────┘
```

### 3-4. 8개 핵심 컴포넌트 (요약)

| 컴포넌트 | 역할 | 상태 전환 |
|---|---|---|
| `<TopStatusBar />` | 스트릭·포인트·공유 | 읽기 후 불꽃 주황+체크 |
| `<TodayStepCard />` | 오늘의 한 걸음 CTA | before/during/after |
| `<QuickTimeSelector />` | 5/10/30분 빠른 선택 | 상시 |
| `<LockedFeatureGrid />` | 4분할 잠금/해금 | 읽기 가드 연동 |
| `<TodayVerseCard />` | 오늘의 말씀 + 공유 | 상시 |
| `<SocialFeedStrip />` | 함께 읽는 사람들 | 읽기 후만 |
| `<ProgressStrip />` | 진도 요약 | 상시 |
| `<ExpandableMoreOptions />` | 더 많은 옵션 | 기본 접힘 |

각 컴포넌트의 상세 TypeScript 인터페이스는 이전 문서 Part 2-3을 그대로 사용합니다.

---

## Part 4. Claude Cowork 작업 지침서

### 4-1. 이번 프로젝트에서 Cowork이 담당할 영역

```
[Cowork이 담당]
├── hublink.im/bible 랜딩의 CTA 배선 (SSO + ref 파라미터)
├── /trial/{mbti,disc,gifts} 게스트 체험 3개
├── /contact/church 교회 문의 폼
├── /app 새 홈 화면 8개 컴포넌트
├── Supabase 마이그레이션 전체
├── 공유 카드 OG 이미지 생성
└── 베타 온보딩 플로우

[Cowork이 담당 안 함 — 별도 트랙]
├── hublink.im/bible 자체 디자인 변경 (HubLink 팀 영역)
├── TTS 음원 생성 (Phase 2)
├── 신학 감수 (사람이 수행)
└── 베타 테스터 모집 (Joseph 직접)
```

### 4-2. 작업 단위 구조

Cowork에서 한 세션에 하나의 **작업 단위(Work Unit, WU)** 만 다룹니다. 세션을 섞지 마세요.

```
WU-01: 듀얼 랜딩 CTA 배선 + ref 파라미터
WU-02: 게스트 세션 유틸 (guest-session.ts + trial_assessments 테이블)
WU-03: /trial/mbti 게스트 체험 페이지
WU-04: /trial/disc 게스트 체험 페이지
WU-05: /trial/gifts 게스트 체험 페이지
WU-06: 가입 시 게스트 데이터 claim 플로우
WU-07: /contact/church 문의 폼
WU-08: testimonials CMS 연결
WU-09: 실시간 사용자 수 API
WU-10: /app 새 홈 화면 (8개 컴포넌트)
WU-11: 읽기 선행 가드 3중 방어
WU-12: 포인트 시스템
WU-13: 공유 카드 생성
WU-14: 그룹 기능 기본
```

### 4-3. Cowork 프롬프트 템플릿

#### 템플릿: 게스트 체험 페이지 구현 (WU-03 예시)

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md (루트 규칙)
- docs/plans/02-home-redesign-and-mvp.md (이 문서 전체)
- content/assessments/bible-mbti.json (문항 데이터)
- lib/trial/guest-session.ts (WU-02에서 만든 유틸)

작업:
app/trial/mbti/page.tsx 를 구현하세요.

요구사항:
1. 비로그인 접근 가능 (middleware에서 /trial/* 화이트리스트)
2. 12문항 스텝퍼 UI — 한 화면에 한 문항
3. 진행률 상단 표시 (3/12 등)
4. 답변은 useReducer로 관리, 마지막 문항 답변 시 자동 제출
5. 제출 시 guest-session.ts의 saveTrialAnswer() 호출
6. /trial/mbti/result 로 push
7. URL query ?ref= 파라미터 PostHog에 전송

디자인:
- Tailwind, 중앙 정렬, max-w-2xl
- 한 문항 = 질문 + 5점 척도 Radio
- 뒤로 가기 가능 (답변 유지)

완료 기준:
1) TypeScript strict 통과
2) 12문항 전부 답하면 결과 페이지로 이동
3) 새로고침해도 답변 유지 (guest-session 쿠키)
4) 미답변 상태로 결과 페이지 접근 시 /trial/mbti 로 리다이렉트

먼저 작업 계획 5단계로 제시하고 승인받은 후 코드 작성하세요.
```

### 4-4. 주간 워크플로우 (1주 = 2~3개 WU)

```
월: WU 우선순위 확정 + Cowork에 WU-N 의뢰
화: 중간 검토 + 수정 지시 + WU-N 완료
수: WU-N+1 시작
목: WU-N+1 완료 + WU-N+2 시작
금 AM: QA 자동 테스트 전체 돌리고 Preview 배포
금 PM: Joseph 수동 체크 + 주간 리포트
```

Phase 1 MVP 10주 × 주 평균 2개 WU = 약 20개 WU로 완성. 위 WU-01~14가 대부분 포함됩니다.

---

## Part 5. 음원 제외 MVP 10주 개발계획

### 5-1. 핵심 대체 전략

음원 없이도 "읽기 선행 구조"가 동작하려면:

1. **"읽기 모드" 기본** — 본문 크게, auto-scroll 옵션
2. **예상 시간 계산** — 글자수 기반 ("약 7분")
3. **완료 판정** — 스크롤이 끝까지 + 체류 시간 60% 이상

음원은 나중에 추가해도 기존 플로우 깨지지 않게 분리 설계.

### 5-2. 10주 스프린트

#### Week 1: Foundation + 듀얼 랜딩 배선
- 저장소 세팅, `.claude/agents/`, `CLAUDE.md`
- Supabase 프로젝트 + 기본 Auth 스키마
- Vercel 연결, `bible.hublink.im` 도메인
- **WU-01**: hublink.im/bible CTA 배선 + ref 파라미터
- **WU-09**: 실시간 사용자 수 API

**산출물**: 랜딩 클릭 → bible.hublink.im 진입 전체 플로우 OK

#### Week 2: 성경 텍스트 + 게스트 인프라
- KJV/ASV/WEB 원문 수집
- B1 Translator로 **요한복음 + 시편 + 잠언 + 창세기** 자체 번역
- 인간 감수자 섭외 + 요한복음 감수
- **WU-02**: 게스트 세션 유틸 + trial_assessments 테이블

**산출물**: DB에 4권 본문 + 게스트 체험 인프라 완성

#### Week 3: 게스트 체험 3종 + 가입 claim
- **WU-03, 04, 05**: MBTI/DISC/은사 체험 페이지 3개
- **WU-06**: 가입 시 게스트 데이터 claim 플로우
- 각 결과 페이지의 공유 카드 (간이 버전)

**산출물**: 비회원이 `/trial/mbti` → 결과 → 공유/가입 가능

#### Week 4: 인증 + 프로필 + 교회 문의
- `/auth` 소셜 로그인 3종 + HubLink SSO 연동
- `/onboarding` (닉네임, 읽기 목표 30/90/365일)
- **WU-07**: /contact/church 문의 폼
- **WU-08**: testimonials CMS

**산출물**: 가입·온보딩·교회 문의·랜딩 CMS 연결 전부 동작

#### Week 5: 읽기 엔진 + 선행 가드
- `/app/read` 본문 뷰어 (스크롤, 폰트 크기, 다크모드)
- 예상 시간 계산
- 완료 판정 로직
- **WU-11**: 읽기 선행 가드 3중 방어 (DB RLS + API + UI)

**산출물**: 사용자가 본문 읽으면 `daily_reading_completions`에 기록

#### Week 6: 새 홈 화면 (WU-10)
- `<TopStatusBar />` 스트릭·포인트·공유
- `<TodayStepCard />` 3상태
- `<QuickTimeSelector />` 5/10/30분
- `<LockedFeatureGrid />` 잠금/해금 4분할
- `<TodayVerseCard />` 오늘의 말씀
- `<ExpandableMoreOptions />` 접힘

**산출물**: `/app` 접속 시 새 홈. 읽기 전/후 상태 전환 동작

#### Week 7: 포인트 시스템 + 일일 미션
- **WU-12**: points_ledger 테이블 + RLS (읽기 가드 통합)
- 적립 이벤트 (읽기 완료, 묵상, 응원)
- daily_missions 자동 생성
- 포인트 조회 API + UI

**산출물**: 읽기 완료 +10P, 미션 완료 추가 포인트 상단 반영

#### Week 8: 묵상 + 정식 검사 3종 + 공유 카드
- `<MeditationTagPicker />` 쓰지 않아도 되는 묵상
- 로그인 사용자용 정식 검사 3종 (결과 저장·재조회)
- **WU-13**: 공유 카드 OG 이미지 (9:16, 1:1, 1.91:1)
- QR 코드 + 딥링크

**산출물**: 완독·묵상·검사 3가지 공유 카드 전부 동작

#### Week 9: 그룹 기능 (WU-14)
- 그룹 생성 + QR/링크 초대
- 소그룹 모드 (2~15명)
- `/g/[slug]` 그룹 페이지
- Supabase Realtime 피드
- 응원 보내기 +5P

**산출물**: 2명 이상 그룹 만들어 서로 진도 공유

#### Week 10: 콘텐츠 블록 + 베타 오픈
- 드래그&드롭 블록 재정렬 (dnd-kit)
- 펼치기/접기/공개/나만보기
- 부부학교 1기 50명 베타 온보딩
- PostHog 퍼널 확인

**산출물**: 베타 50명 운영 + 전환 퍼널 수치 확보

### 5-3. DB 스키마 (듀얼 랜딩용 신규 테이블)

기존 Part 1 문서의 스키마에 추가:

```sql
-- 게스트 체험 (Week 2)
CREATE TABLE trial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,        -- 쿠키의 guest_* id
  assessment_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  result_type TEXT,
  claimed_by_user_id UUID,        -- 가입 시 user_id로 이전
  ref_source TEXT,                -- "hublink-bible-mbti"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trial_guest ON trial_assessments(guest_id);
CREATE INDEX idx_trial_unclaimed
  ON trial_assessments(guest_id)
  WHERE claimed_by_user_id IS NULL;

-- 게스트 데이터 이전 함수
CREATE OR REPLACE FUNCTION claim_trial_assessments(
  p_guest_id TEXT,
  p_user_id UUID
) RETURNS INT AS $$
DECLARE
  claimed_count INT;
BEGIN
  UPDATE trial_assessments
  SET claimed_by_user_id = p_user_id
  WHERE guest_id = p_guest_id
    AND claimed_by_user_id IS NULL;

  GET DIAGNOSTICS claimed_count = ROW_COUNT;

  -- 정식 user_assessments 테이블로 복사
  INSERT INTO user_assessments (user_id, assessment_id, answers, result_type)
  SELECT p_user_id, assessment_id, answers, result_type
  FROM trial_assessments
  WHERE guest_id = p_guest_id
    AND claimed_by_user_id = p_user_id;

  RETURN claimed_count;
END;
$$ LANGUAGE plpgsql;

-- 교회 문의 (Week 4)
CREATE TABLE church_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  church_size TEXT,
  desired_start_date DATE,
  message TEXT,
  source_ref TEXT,
  status TEXT DEFAULT 'new',
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 후기 CMS (Week 4)
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  streak_days INT,
  avatar_emoji TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 랜딩 방문 추적 (선택, Week 1)
-- PostHog로 대체 가능하므로 테이블 생략
```

### 5-4. MVP 완료 기준 (8개)

1. ✅ `hublink.im/bible` 모든 CTA가 `bible.hublink.im/*` 로 정상 이동
2. ✅ 비회원이 `/trial/{mbti|disc|gifts}` 완주 가능
3. ✅ 가입 시 게스트 데이터 자동 이전
4. ✅ 읽기 선행 가드 3중 방어 동작 (DB + API + UI)
5. ✅ 공유 카드 3가지 포맷 동작
6. ✅ 그룹 초대·수락·피드·응원 동작
7. ✅ Church SaaS 문의 폼 → Joseph 알림 수신
8. ✅ 베타 50명 D7 리텐션 40% 이상

### 5-5. 두 랜딩의 KPI 분리 추적

| 지표 | hublink.im/bible | bible.hublink.im |
|---|---|---|
| 월 방문자 | 목표 5,000 (SEO 유입) | 목표 2,000 (브랜드 검색) |
| 체류 시간 | 1분 30초+ | — |
| CTA 클릭률 | 히어로 20%+, 검사 10%+ | 시작하기 30%+ |
| 가입 전환율 | 5%+ | 15%+ (대부분 재방문) |
| `/trial` 완주율 | 60%+ (시작자 대비) | — |
| `/trial` → 가입 전환 | 30%+ | — |
| Church 문의 건수 | 월 5건+ | — |

---

## Part 6. 즉시 실행 체크리스트 (이번 주 Day 1~5)

### Day 1 (월)
- [ ] 이 문서를 `docs/plans/02-dual-landing-and-mvp-v2.md` 로 저장
- [ ] ADR 업데이트: `docs/adr/ADR-002-dual-landing.md` (v1 "서브도메인 승"을 "듀얼 랜딩"으로 갱신)
- [ ] `hublink.im/bible` 랜딩 현재 버전 스크린샷 4장 `/docs/reference/landing-current/` 저장
- [ ] WU-01 ~ WU-14 목록을 GitHub Issues로 생성

### Day 2 (화)
- [ ] Cowork에 WU-01 (CTA 배선) 의뢰 — Part 4 템플릿 사용
- [ ] 동시에 Supabase 마이그레이션 Week 1~2분 준비
- [ ] `hublink.im/bible` 후기 영역 실제 후기 3~5개 수집 (부부학교 1기)

### Day 3 (수)
- [ ] WU-01 완료 검토 + Preview 배포
- [ ] WU-02 (게스트 세션 유틸) 의뢰
- [ ] 신학 감수자 2명째 접촉

### Day 4 (목)
- [ ] WU-02 완료 + WU-03 (MBTI 체험) 시작
- [ ] testimonials 테이블에 실제 후기 시드

### Day 5 (금)
- [ ] 주간 리뷰 + Week 2 백로그 확정
- [ ] 첫 PostHog 퍼널 리포트 확인 (hublink.im/bible 방문자 수)
- [ ] Joseph 본업(HubLink)과의 시간 배분 점검

---

## 부록 A. 현재 랜딩 개선 제안 (작은 조정)

현재 `hublink.im/bible` 랜딩은 전반적으로 훌륭하지만 3가지 보강 지점이 있습니다.

1. **히어로의 "1,283명"** — 초기에 이 숫자가 작으면 오히려 역효과. 실제 수가 1,000명 넘기 전까지는 **"첫 100분을 모십니다"** 같은 희소성 프레이밍으로 변경 검토
2. **핵심 기능 8개 카드** — 모두 같은 위계인데, "읽기 선행 구조" 하나만 강조해서 차별화 포인트로 키울 것
3. **완독 후기 캐러셀** — 현재 1명만 보임. **최소 3명 이상 로테이션** 필요. 부부·소그룹·교회 3가지 사용 사례 각 1명씩 권장

## 부록 B. hublink.im/bible 랜딩 기술 스택 추정

스크린샷 기반 추정 (확인 필요):
- React 또는 Next.js (SPA)
- Tailwind 기반 디자인
- 반응형 OK
- 캐러셀 라이브러리 사용 중 (Swiper 추정)
- 현재 CMS 없이 하드코딩된 것으로 보임

→ 이번 MVP에서 **testimonials CMS 연결**만 추가하면 Joseph님이 직접 후기 관리 가능

---

**문서 끝** — 이 문서는 `docs/plans/02-dual-landing-and-mvp-v2.md` 로 저장하고, Cowork 세션 시작 시 첨부합니다.
