# PRD-WU-02: 게스트 세션 인프라

| 항목 | 내용 |
|---|---|
| **작업 단위** | WU-02 |
| **의존성** | WU-01 (듀얼 랜딩 CTA 배선) 완료 |
| **선행 필요** | Supabase 마이그레이션 `20260420000003_trial_infra.sql` 적용 |
| **예상 소요** | 0.5일 (Cowork 기준 1세션) |
| **우선순위** | P0 — WU-03~06의 기반 |

---

## 1. 배경

`hublink.im/bible` 랜딩의 "무료 검사 시작" 버튼 3개는 **비회원도 바로 체험 가능**해야 한다. 하지만 결과를 저장·공유하거나 재조회하려면 결국 식별자가 필요하다. 이를 위해 **익명 게스트 세션 쿠키**를 발급해 서버가 동일 사용자임을 인식하게 한다.

가입 완료 시 이 게스트 세션의 모든 기록을 정식 user 계정으로 이전(claim)한다 — 이는 WU-06에서 담당.

## 2. 목표

1. 클라이언트·서버 양쪽에서 게스트 ID를 일관되게 읽고/생성할 수 있다
2. 쿠키 도메인을 `.hublink.im` 으로 설정해 서브도메인 간 세션 공유
3. 30일간 유지, 만료 시 자동 재생성
4. WU-03~05의 체험 페이지가 이 유틸만 import 하면 동작한다
5. 개인정보 저장 없음 — 순수 익명 UUID

## 3. 구현 범위

### 3-1. 신규 파일

```
apps/web/lib/trial/
├── guest-session.ts         # 핵심 유틸
├── guest-session.server.ts  # 서버 전용 (쿠키 Read + RPC 호출)
└── __tests__/
    └── guest-session.test.ts
```

### 3-2. API 설계

```typescript
// lib/trial/guest-session.ts (Client + Server 공용)

/** 쿠키 이름 */
export const GUEST_COOKIE_NAME = 'bible_guest_id';

/** guest_id 형식: "guest_" + UUID v4 */
export function generateGuestId(): string;

/** 유효한 guest_id 형식인지 검증 */
export function isValidGuestId(id: string): boolean;
```

```typescript
// lib/trial/guest-session.ts (Client only)
'use client';

/** 쿠키에서 guest_id 읽기, 없으면 새로 생성하고 저장 */
export function getOrCreateGuestId(): string;

/** 쿠키에서 읽기만 (없으면 null) */
export function readGuestId(): string | null;

/** guest_id 삭제 (가입 후 claim 완료 시) */
export function clearGuestId(): void;
```

```typescript
// lib/trial/guest-session.server.ts (Server only)

/** Route Handler / Server Component 에서 쿠키 읽기 */
export async function readGuestIdFromCookies(): Promise<string | null>;

/** 체험 응답 저장 */
export async function saveTrialAnswer(params: {
  guestId: string;
  assessmentId: string;
  answers: Record<string, unknown>;
  resultType?: string;
  refSource?: string;
}): Promise<{ id: string }>;

/** guest_id 로 자신의 체험 결과 조회 */
export async function listTrialAssessments(
  guestId: string
): Promise<TrialAssessment[]>;
```

## 4. DB 스키마 (마이그레이션에서 이미 생성됨)

이 PRD는 DB를 만들지 않고 **이미 만들어진 테이블을 사용**한다. 참조용:

```sql
-- 20260420000003_trial_infra.sql 에서 정의됨
trial_assessments (
  id UUID PK,
  guest_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  result_type TEXT,
  claimed_by_user_id UUID,
  ref_source TEXT,
  created_at TIMESTAMPTZ
)
```

RLS 정책:
- **INSERT**: 누구나 가능 (guest 포함). 단, `guest_id` 필수
- **SELECT**: `guest_id`가 쿠키와 일치해야 함 (Supabase RLS + request header)
- **UPDATE**: `claim_trial_assessments` RPC 함수를 통해서만

## 5. 쿠키 설정

```
Name:     bible_guest_id
Value:    guest_{UUID-v4}
Domain:   .hublink.im (프로덕션) / undefined (로컬)
SameSite: lax
Secure:   true (프로덕션)
MaxAge:   30일
HttpOnly: false  # 클라이언트 JS에서도 읽어야 함
```

## 6. 로직 세부

### 6-1. `getOrCreateGuestId()` 플로우

```
1. Cookies.get('bible_guest_id') 호출
2. 값이 있고 isValidGuestId(value) === true 면 → 그대로 반환
3. 값이 없거나 무효 형식이면:
   a. newId = generateGuestId()  // "guest_" + crypto.randomUUID()
   b. Cookies.set(...)  // 위 규격대로
   c. PostHog 이벤트: 'guest_session_created' { guest_id: newId }
   d. newId 반환
```

### 6-2. `saveTrialAnswer()` 플로우 (서버)

```
1. guest_id 검증 — 형식 유효성 + 쿠키와 일치
2. assessmentId 검증 — ALLOWED_ASSESSMENTS 에 포함되는가
3. answers 검증 — zod 스키마로 구조 확인
4. Supabase INSERT trial_assessments
5. 결과 id 반환
```

### 6-3. 검증 스키마 (zod 예시)

```typescript
import { z } from 'zod';

const GuestIdSchema = z
  .string()
  .regex(/^guest_[0-9a-f-]{36}$/);

const AllowedAssessmentId = z.enum(['bible-mbti', 'bible-disc', 'bible-gifts']);

const SaveAnswerSchema = z.object({
  guestId: GuestIdSchema,
  assessmentId: AllowedAssessmentId,
  answers: z.record(z.string(), z.unknown()),
  resultType: z.string().optional(),
  refSource: z.string().max(50).optional(),
});
```

## 7. 완료 기준 (Definition of Done)

- [ ] `lib/trial/guest-session.ts` 클라이언트 유틸 3개 함수 구현
- [ ] `lib/trial/guest-session.server.ts` 서버 유틸 3개 함수 구현
- [ ] Vitest 단위 테스트 10개 이상 통과 (쿠키 생성, 형식 검증, claim 시뮬레이션)
- [ ] TypeScript strict 통과
- [ ] `isValidGuestId('guest_invalid')` === false 검증
- [ ] 2개 탭에서 동시 접속 시 동일 guest_id 공유 확인 (수동 테스트)
- [ ] 30일 후 만료 동작 (쿠키 속성 검증)

## 8. 보안 고려사항

- **Guest ID 예측 불가성**: `crypto.randomUUID()` 사용 (v4, 122-bit entropy)
- **CSRF**: `SameSite=lax` + Origin 검증으로 방어
- **폭주 방지**: `/api/trial/*` Route Handler에서 rate limit (10 req/min per guest_id)
- **PII 저장 금지**: guest_id는 순수 랜덤. 이메일·이름 등 절대 저장 X
- **답변 데이터**: 개인정보 간주. 30일 자동 삭제 cron job 추가 (claim 안 된 경우)

## 9. Cowork 의뢰 프롬프트 (복붙용)

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-WU-02-guest-session-infra.md (이 문서)
- supabase/migrations/20260420000003_trial_infra.sql
- apps/web/lib/supabase/client.ts (WU-01 산출물)

작업:
PRD 명세대로 다음 파일을 구현하세요:
1) apps/web/lib/trial/guest-session.ts (client + 공용)
2) apps/web/lib/trial/guest-session.server.ts (server only)
3) apps/web/lib/trial/__tests__/guest-session.test.ts

제약:
- crypto.randomUUID() 사용 (Node 20+ 지원)
- js-cookie 이미 설치되어 있다고 가정
- zod 스키마 필수
- TypeScript strict

먼저 3개 파일의 스켈레톤(함수 시그니처 + 주석)을 보여주고 승인받은 후 구현하세요.
```

## 10. 검증 시나리오

| 시나리오 | 기대 결과 |
|---|---|
| 신규 방문자가 `/trial/mbti` 접속 | 새 guest_id 생성, 쿠키 저장 |
| 같은 방문자가 `/trial/disc` 이동 | 같은 guest_id 재사용 |
| 하루 뒤 재방문 | 같은 guest_id 유지 |
| 31일 뒤 재방문 | 쿠키 만료 → 새 guest_id |
| 브라우저 시크릿 모드 | 새 guest_id (정상) |
| guest_id 값을 `xyz` 같은 무효값으로 조작 | 자동 재발급 |
| `.hublink.im` 다른 서브도메인 방문 | 쿠키 공유됨 (확인용) |

## 11. 다음 단계

이 PRD 완료 후 WU-03 (MBTI 체험 페이지)에서 `getOrCreateGuestId()` 와 `saveTrialAnswer()`를 사용한다.
