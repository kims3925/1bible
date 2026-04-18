# PRD-WU-06: 가입 시 게스트 데이터 Claim 플로우

| 항목 | 내용 |
|---|---|
| **작업 단위** | WU-06 |
| **의존성** | WU-01, WU-02, WU-03~05 |
| **예상 소요** | 0.5일 |
| **우선순위** | P0 — 전환 경험의 결정적 순간 |

---

## 1. 배경

비회원이 `/trial/*`에서 MBTI·DISC·은사 검사를 하면 `trial_assessments` 테이블에 `guest_id`로 저장된다. 이 사용자가 결과 페이지에서 **"가입하고 저장"** 을 누르면:

1. `/auth?ref=trial-xxx-result&next=/app/assessments` 로 이동
2. 소셜 로그인 (Kakao/Google/Apple) 또는 매직 링크
3. Supabase에서 `auth.users` 생성
4. **이 순간** 게스트가 쌓아둔 모든 검사 결과를 정식 계정으로 이전해야 한다

이 "이전" 로직이 WU-06의 핵심이다. 실패하면 사용자가 "내가 한 검사 결과가 사라졌네?" 하고 이탈한다.

## 2. 플로우 다이어그램

```
게스트가 MBTI·DISC 두 개 체험 완료
   │
   ▼
trial_assessments 테이블
   ├── { guest_id: "guest_abc", assessment_id: "bible-mbti", ... }
   └── { guest_id: "guest_abc", assessment_id: "bible-disc", ... }

   ↓ "가입하고 저장" 클릭

/auth → 소셜 로그인 → /auth/callback (WU-01 구현)
   │
   ├── 1) exchangeCodeForSession → auth.users 레코드 생성
   │
   ├── 2) bible_profiles upsert (entry_ref 기록)
   │
   ├── 3) ⭐ claim_trial_assessments RPC 호출 ⭐
   │      ├── trial_assessments 의 claimed_by_user_id = 신규 user.id
   │      └── user_assessments 로 복사
   │
   ├── 4) 가입 보너스 포인트 +50P (claim 성공 시)
   │
   ├── 5) 쿠키 bible_guest_id 삭제
   │
   └── 6) /onboarding 또는 /app/assessments (결과 즉시 확인) 로 이동
```

## 3. 핵심 RPC 함수

마이그레이션에 포함 (`20260420000003_trial_infra.sql` 참조).

```sql
CREATE OR REPLACE FUNCTION claim_trial_assessments(
  p_guest_id TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_claimed_count INT;
  v_copied_count INT;
BEGIN
  -- 1) guest_id 형식 검증
  IF p_guest_id !~ '^guest_[0-9a-f-]{36}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_guest_id_format'
    );
  END IF;

  -- 2) 이미 claim된 건 제외하고 마킹
  UPDATE trial_assessments
  SET claimed_by_user_id = p_user_id,
      claimed_at = NOW()
  WHERE guest_id = p_guest_id
    AND claimed_by_user_id IS NULL;

  GET DIAGNOSTICS v_claimed_count = ROW_COUNT;

  -- 3) 정식 user_assessments 로 복사 (중복 방지)
  INSERT INTO user_assessments (user_id, assessment_id, answers, result_type, source, created_at)
  SELECT
    p_user_id,
    ta.assessment_id,
    ta.answers,
    ta.result_type,
    'claimed_from_guest',
    ta.created_at
  FROM trial_assessments ta
  WHERE ta.guest_id = p_guest_id
    AND ta.claimed_by_user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_assessments ua
      WHERE ua.user_id = p_user_id
        AND ua.assessment_id = ta.assessment_id
    );

  GET DIAGNOSTICS v_copied_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_count', v_claimed_count,
    'copied_count', v_copied_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. 클라이언트 측 호출

WU-01의 `/auth/callback/route.ts` 에 이미 통합되어 있음. 본 PRD는 **RPC 강화 + 테스트 + 실패 복구**에 집중.

## 5. 예외 처리

| 상황 | 처리 |
|---|---|
| 쿠키 `bible_guest_id` 없음 | 조용히 스킵 (사용자 체험 안 하고 바로 가입한 경우) |
| 게스트 체험 0개 | 스킵, 보너스 포인트 지급 안 함 |
| RPC 실패 (DB 에러) | Sentry에 보고, 사용자에게는 "결과는 잠시 후 동기화됩니다" 안내, Joseph에게 Slack 알림 |
| 이미 같은 `assessment_id`가 user_assessments에 존재 | 복사 스킵 (덮어쓰지 않음) |
| 동일 유저가 여러 브라우저/기기에서 체험 | 각 기기의 guest_id 별도 claim 필요 — **현 버전은 한 기기만 처리** |

## 6. 보너스 포인트 지급 로직

```typescript
// /auth/callback/route.ts (WU-01) 에서 claim 결과에 따라:

if (claimResult.copied_count > 0) {
  await supabase.from('points_ledger').insert({
    user_id: user.id,
    amount: 50,
    reason: 'signup_bonus_with_trial',
    metadata: { claimed_count: claimResult.copied_count },
  });
}
```

가입 보너스 구조:
- 단순 가입: +20P
- 게스트 체험 이어서 가입: +50P (보너스 +30P)

## 7. 체크리스트: 사용자 경험

가입 완료 후 `/app/assessments` 첫 화면에서:

```
┌─────────────────────────────────────────┐
│  🎉 환영해요, {닉네임}님!                │
│                                          │
│  가입 보너스: +50P                       │
│  저장된 검사 결과: 2개                   │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ 📊 성경인물 MBTI                   │  │
│  │ "공동체의 지도자 · 모세 유형"      │  │
│  │ [결과 다시 보기] [공유하기]        │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ 👑 성경인물 DISC                   │  │
│  │ "결단하는 리더 · 다윗 유형"        │  │
│  │ [결과 다시 보기] [공유하기]        │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [오늘의 성경 읽기 시작 →]               │
└─────────────────────────────────────────┘
```

이 화면은 **"가입해서 다행이다"** 감정을 만드는 결정적 순간. 여기서 읽기 플로우로 자연스럽게 연결.

## 8. 완료 기준

- [ ] `claim_trial_assessments` RPC 단위 테스트 (pgTAP 또는 Supabase CLI)
- [ ] `/auth/callback` 의 claim 호출 통합 테스트
- [ ] 가입 보너스 포인트 적립 검증
- [ ] 실패 시 Sentry 보고
- [ ] `/app/assessments` 첫 화면에 저장된 결과 표시
- [ ] E2E 시나리오 (Playwright):
  1. 게스트로 MBTI 체험 완료
  2. 다른 탭에서 DISC 체험 완료 (같은 쿠키)
  3. 가입 버튼 클릭
  4. 카카오 로그인 (테스트 계정)
  5. `/app/assessments` 에 2개 결과 모두 표시 확인
  6. 포인트 잔액 50P 확인

## 9. 추가 보안 고려

- **Guest ID 스쿼팅 방어**: 누군가 남의 `guest_id`를 알아내서 자기 계정으로 claim 시도할 수 있음
  - 방어: 쿠키는 `.hublink.im` 도메인에만 접근 가능 + HTTPS only + SameSite=lax
  - 추가: 처음 claim된 `guest_id`는 즉시 무효화 (재claim 불가)

- **Rate limit**: 동일 IP에서 `/auth/callback` 5 req/min 초과 시 차단

## 10. Cowork 의뢰 프롬프트

```
역할: A1 Architect + A2 Dev

첨부:
- CLAUDE.md
- docs/prd/PRD-WU-06-claim-trial-data.md
- apps/web/app/auth/callback/route.ts (WU-01 산출물)
- supabase/migrations/20260420000003_trial_infra.sql

작업:
1) RPC 함수 claim_trial_assessments 개선 (보안 강화, 이미 포함된 경우 스킵)
2) /auth/callback 의 claim 호출 부분 강화 (Sentry 보고, 실패 시 사용자 안내)
3) 단위 테스트:
   - lib/supabase/__tests__/claim-rpc.test.ts (Supabase CLI test)
4) E2E 테스트:
   - e2e/trial-to-signup.spec.ts (Playwright)
5) /app/assessments 페이지 업데이트 — claim 직후 저장된 결과 히어로 표시

특히 주의:
- 게스트 쿠키가 없을 때도 정상 작동 (스킵)
- 이미 claim 된 guest_id를 다시 시도해도 에러 없이 idempotent
```
