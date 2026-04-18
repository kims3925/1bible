# PRD-H01: TopStatusBar 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<TopStatusBar />` |
| **경로** | `apps/web/components/home/TopStatusBar.tsx` |
| **의존성** | Supabase 프로필·포인트 조회 |
| **예상 소요** | 0.5일 |

---

## 1. 목적

홈 화면 최상단 56px 고정 띠. 사용자에게 **"오늘의 상태"** 를 한눈에 보여주고 리텐션 심리 장치(스트릭)를 항상 노출한다.

## 2. 표시 요소

```
┌─────────────────────────────────────────────────────┐
│  🔥 12일 연속        💎 1,240P      📤 공유         │
│  (스트릭)            (포인트)       (공유)           │
└─────────────────────────────────────────────────────┘
```

### 읽기 전 (잠금 상태)
- 🔥 **회색** 불꽃 + "12일 연속 읽기 중" (지속 중, 오늘 미완)
- 💎 **1,240P** (어제까지 잔액)
- 📤 공유 (상시)

### 읽기 후 (해금 상태)
- 🔥 **주황** 불꽃 + ✅ + "13일 연속!" (오늘 완료)
- 💎 **1,260P (+20)** 하이라이트 애니메이션
- 📤 공유

### 스트릭 끊기기 직전 (위기)
- ⚠️ **빨간** 불꽃 + "오늘 읽으면 스트릭 유지!"

## 3. Props 인터페이스

```typescript
interface TopStatusBarProps {
  streakDays: number;           // 12
  isCompletedToday: boolean;    // false 읽기 전, true 읽기 후
  points: number;               // 1240
  pointsDelta?: number;         // +20 (읽기 직후 3초간만 애니메이션)
  streakAtRisk?: boolean;       // 오늘 안 읽으면 스트릭 끊김 (23시 이후 true)
  onShareClick: () => void;
  onPointsClick?: () => void;   // 탭 시 포인트 상점으로
  onStreakClick?: () => void;   // 탭 시 진도 페이지로
}
```

## 4. 시각 명세

### 색상
```css
--color-streak-idle: #9CA3AF;      /* 회색 불꽃 (읽기 전) */
--color-streak-active: #FF8A3D;    /* 주황 불꽃 (읽기 후) */
--color-streak-risk: #EF4444;      /* 빨간 불꽃 (위기) */
--color-points: #4F7CFF;           /* 파란 보석 */
--color-bg: #FFFFFF;
--color-border: #F1F5F9;
```

### 레이아웃
- 높이: 56px
- 좌우 패딩: 16px
- 요소 간 간격: 스트릭 ←→ 포인트 ←→ 공유 = `flex space-between`
- 하단 1px 보더

### 폰트
- 숫자 (12일, 1,240P): `font-semibold` `text-base`
- 레이블 ("연속", "P"): `text-sm text-gray-500`

## 5. 상호작용

| 동작 | 결과 |
|---|---|
| 스트릭 탭 | `/app/progress` 로 이동 (탭 확장 화면) |
| 포인트 탭 | `/app/shop` 상점 화면 |
| 공유 탭 | 오늘의 성과 카드 모달 — "X일 연속 읽기 중" SNS 공유 |
| 장탭 (스트릭) | 스트릭 규칙 설명 툴팁 |

## 6. 애니메이션

- **스트릭 증가 시**: 1회 펄스 (scale 1.0 → 1.15 → 1.0, 400ms)
- **포인트 증가 시**: +20 플로팅 텍스트 위로 사라짐 (600ms, 읽기 직후 1회)
- `prefers-reduced-motion` 존중

## 7. 데이터 조회 전략

```tsx
// 상위 Server Component 에서 prefetch
const { data: profile } = await supabase
  .from('bible_profiles')
  .select('streak_days, longest_streak, total_points, updated_at')
  .eq('user_id', user.id)
  .single();

const { data: todayCompletion } = await supabase
  .from('daily_reading_completions')
  .select('id')
  .eq('user_id', user.id)
  .eq('completed_date', today())
  .maybeSingle();

<TopStatusBar
  streakDays={profile.streak_days}
  isCompletedToday={!!todayCompletion}
  points={profile.total_points}
/>
```

포인트는 **집계 컬럼 `total_points`** 를 사용 (매번 points_ledger SUM 하면 성능 저하). 트리거로 자동 업데이트:

```sql
CREATE TRIGGER trg_update_total_points
AFTER INSERT ON points_ledger
FOR EACH ROW
EXECUTE FUNCTION update_profile_points();
```

## 8. 실시간 업데이트

Supabase Realtime 구독으로 포인트 변경 감지:

```tsx
'use client';
useEffect(() => {
  const channel = supabase
    .channel(`points:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'points_ledger',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      setPoints(prev => prev + payload.new.amount);
      setPointsDelta(payload.new.amount);
      setTimeout(() => setPointsDelta(null), 3000);
    })
    .subscribe();
  return () => { channel.unsubscribe(); };
}, [userId]);
```

## 9. 접근성

- `role="banner"` 또는 `role="status"` (영역 의미 부여)
- 스트릭 숫자: `aria-label="{N}일 연속 읽기 중"`
- 포인트 증가 애니메이션: `aria-live="polite"` 로 스크린 리더에 안내
- 모든 버튼 최소 44x44px (WCAG AAA)

## 10. 완료 기준

- [ ] 3가지 상태 전부 렌더 확인 (읽기 전/후/위기)
- [ ] 포인트 증가 시 애니메이션 1회 재생
- [ ] Supabase Realtime 포인트 업데이트 동작
- [ ] 키보드 Tab 순서: 스트릭 → 포인트 → 공유
- [ ] Storybook 스토리 4개: Idle / Completed / AtRisk / Loading
- [ ] Vitest: 3가지 상태 스냅샷 + 클릭 핸들러 호출 검증

## 11. Cowork 프롬프트

```
역할: A2 Dev Agent + A4 UX Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-H01-top-status-bar.md
- apps/web/lib/supabase/client.ts
- packages/ui/src/tokens.ts (디자인 토큰)

작업:
1) components/home/TopStatusBar.tsx 구현
2) components/home/TopStatusBar.stories.tsx (Storybook 4 variants)
3) components/home/__tests__/TopStatusBar.test.tsx

제약:
- Server Component로 기본 데이터 prefetch, Client Component로 실시간 구독
- framer-motion 또는 CSS transition만 사용 (경량화)
- 디자인 토큰만 사용, 하드코딩 색상 금지
```
