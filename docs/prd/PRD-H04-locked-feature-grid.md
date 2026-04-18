# PRD-H04: LockedFeatureGrid 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<LockedFeatureGrid />` |
| **경로** | `apps/web/components/home/LockedFeatureGrid.tsx` |
| **중요도** | ⭐ 기획서 "읽기 선행 구조"의 시각적 구현 |
| **예상 소요** | 0.5일 |

---

## 1. 목적

기획서 v6.0의 제1원칙 **"읽어야 열린다(🔒→🔓)"** 를 시각적으로 구현한다. 4개 기능(묵상·게임·검사·상점)을 잠금 상태로 두고, 읽기 완료 시 해금 애니메이션 재생.

## 2. 레이아웃

### 잠금 상태 (읽기 전)
```
🔒 오늘 읽기를 마치면 열려요

┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ 🙏 묵상  │  │ 🎮 게임  │  │ 🧪 검사  │  │ 🎁 상점  │
│ +15P   │  │  5종    │  │ 12종    │  │         │
│ 🔒 잠금 │  │ 🔒 잠금 │  │ 🔒 잠금 │  │ 🔒 잠금 │
└────────┘  └────────┘  └────────┘  └────────┘
(회색)      (회색)      (회색)      (회색)
```

### 해금 상태 (읽기 후)
```
🔓 오늘의 보너스 활동

┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ 🙏 묵상  │  │ 🎮 퀴즈  │  │ 🧪 검사  │  │ 🎁 상점  │
│ +15P   │  │ 3문제   │  │ 오늘운세│  │ 1,260P  │
│ NEW ●  │  │         │  │ 1일1회  │  │         │
└────────┘  └────────┘  └────────┘  └────────┘
(컬러)      (컬러)      (컬러)      (컬러)
```

## 3. Props

```typescript
interface LockedFeatureGridProps {
  features: LockedFeature[];
  isUnlocked: boolean; // hasCompletedTodayReading() 결과
  onLockedTap: () => void; // 공통 토스트 "5분만 읽으면 열려요!"
}

interface LockedFeature {
  id: 'meditation' | 'game' | 'assessment' | 'shop';
  icon: string;
  label: string;
  subLabel: string; // "+15P", "5종" 등
  badge?: 'NEW' | 'HOT' | null;
  onClick: () => void; // 해금 시에만 호출됨
}
```

## 4. 잠금 시 UX

- 그리드 전체가 opacity 0.5 + 그레이스케일
- 각 카드 우하단에 🔒 아이콘
- 탭 시 `onLockedTap()` 호출 → 부드러운 토스트:
  ```
  ┌─────────────────────────────────┐
  │ 🔒 오늘 5분만 읽으면 열려요!      │
  │    [바로 읽으러 가기 →]          │
  └─────────────────────────────────┘
  ```
- **압박이 아닌 기대감** — 톤 중요 (기획서 Ⅲ절 명시)

## 5. 해금 애니메이션

완료 이벤트 수신 시 (Realtime):
1. 그레이스케일 페이드 아웃 (300ms)
2. 각 카드 순차적으로 scale 1.0 → 1.1 → 1.0 (stagger 100ms)
3. 🔒 아이콘 페이드 아웃, 서브 레이블 (+15P 등) 페이드 인
4. `aria-live` 로 "기능 4개가 해금되었습니다" 알림

`prefers-reduced-motion` 시 애니메이션 스킵 — 즉시 전환.

## 6. 기능별 연결

| ID | 해금 시 이동 |
|---|---|
| `meditation` | `/app/meditation/new` |
| `game` | `/app/game` (오늘의 퀴즈 3문제) |
| `assessment` | `/app/assessments/daily` (오늘 1회 가능한 검사) |
| `shop` | `/app/shop` |

## 7. 기능별 부가 로직

### `game`
- 매일 자정에 "오늘의 퀴즈 3문제" 자동 생성 (daily_missions 테이블)
- 이미 완료한 날은 체크마크 표시

### `assessment`
- 무거운 검사는 해금해도 부하 있음 → "하루 1회 가능" 제한
- `user_assessments` 중 오늘 완료한 게 있으면 "완료" 상태

### `shop`
- subLabel에 현재 보유 포인트 실시간 표시

## 8. 읽기 선행 가드 연동

```tsx
// Server Component에서
const hasCompleted = await hasCompletedTodayReading(userId);

<LockedFeatureGrid
  isUnlocked={hasCompleted}
  features={[...]}
  onLockedTap={() => toast({
    message: '🔒 오늘 5분만 읽으면 열려요!',
    action: { label: '바로 읽기', onClick: () => router.push('/app/read') },
  })}
/>
```

## 9. 접근성

- 잠금 카드: `aria-disabled="true"` + `aria-describedby="lock-help"`
- 해금 변화: `aria-live="polite"` 로 스크린 리더 알림
- 각 카드 최소 80x80px 터치 영역

## 10. 완료 기준

- [ ] 잠금/해금 두 상태 렌더
- [ ] 해금 애니메이션 (reduce-motion 대응)
- [ ] 잠금 탭 시 토스트 표시
- [ ] Realtime 완료 이벤트로 자동 해금
- [ ] Storybook: Locked / Unlocked / Unlocking (전환 중)

## 11. Cowork 프롬프트

```
역할: A2 Dev Agent + A4 UX Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-H04-locked-feature-grid.md
- lib/reading/guards.ts (hasCompletedTodayReading)
- components/ui/Toast.tsx

작업:
1) components/home/LockedFeatureGrid.tsx
2) components/home/LockedFeatureCard.tsx (개별 카드)
3) components/home/useFeatureUnlockAnimation.ts (훅)
4) Storybook + 테스트

핵심: "압박이 아닌 기대감" 톤 유지. 잠금 카드가 벌 같지 않도록 디자인.
```
