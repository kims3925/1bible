# PRD-H02: TodayStepCard 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<TodayStepCard />` |
| **경로** | `apps/web/components/home/TodayStepCard.tsx` |
| **중요도** | ⭐ 홈의 심장 — 가장 큰 CTA |
| **예상 소요** | 1일 |

---

## 1. 목적

**"오늘 뭐 하지?"** 라는 질문에 앱이 **단 하나의 답**을 던지는 카드. Hick's Law 적용 — 선택지를 1개로 수렴시켜 결정 마비를 제거한다.

## 2. 3가지 상태

### State A: `before` — 오늘 읽기 전
```
┌──────────────────────────────────────────────┐
│          📖 오늘의 한 걸음                    │
│                                               │
│          창세기 3장 · 약 7분                  │
│                                               │
│    ┌─────────────────────────────────┐       │
│    │   ▶  바로 듣기 시작               │       │
│    └─────────────────────────────────┘       │
│                                               │
│    ⚡ 오늘 끝내면 +10P · 🔓 모든기능 해금     │
└──────────────────────────────────────────────┘
```

### State B: `during` — 읽기 중
```
┌──────────────────────────────────────────────┐
│          📖 읽는 중                           │
│                                               │
│          창세기 3장 · 42% 진행                │
│          ▓▓▓▓░░░░░░░░░                       │
│                                               │
│    ┌─────────────────────────────────┐       │
│    │   ▶  이어서 듣기                  │       │
│    └─────────────────────────────────┘       │
│                                               │
│    약 4분 남음                                │
└──────────────────────────────────────────────┘
```

### State C: `after` — 완료
```
┌──────────────────────────────────────────────┐
│       ✅ 오늘 창세기 3장 읽기 완료!            │
│                                               │
│       +10P 적립 · 🔥 13일 연속!                │
│                                               │
│       🙏 오늘의 묵상을 남겨보세요 (+15P)       │
│    ┌─────────────────────────────────┐       │
│    │   태그 선택만 하면 끝             │       │
│    └─────────────────────────────────┘       │
└──────────────────────────────────────────────┘
```

## 3. Props 인터페이스

```typescript
type TodayStepCardState = 'before' | 'during' | 'after';

interface TodayStepCardProps {
  state: TodayStepCardState;
  plan: {
    bookId: string;          // "GEN"
    bookName: string;        // "창세기"
    chapterRange: string;    // "3장" or "1-3장"
    estimatedMinutes: number;
  };
  progress?: number;         // 0.42 (during 상태에만)
  pointsReward: number;      // 10
  streakDays?: number;       // 13 (after 상태에서 표시)
  onStart: () => void;
  onContinue?: () => void;
  onStartMeditation?: () => void;
}
```

## 4. 시각 명세

### 크기
- 모바일: 전체 너비, 높이 약 240px
- 데스크톱: max-width 680px, 중앙 정렬

### 색상 (State별)
| State | 배경 | 액센트 |
|---|---|---|
| before | 그라데이션 (파란색 소프트) | 파란 CTA 버튼 |
| during | 흰 배경 + 진행바 | 파란 CTA |
| after | 그라데이션 (그린 소프트) | 녹색 체크 + 주황 CTA |

### 그림자
- `shadow-lg` + `shadow-primary/10` (파란 그림자 은은히)

## 5. 상호작용

| State | 주 버튼 | 부 액션 |
|---|---|---|
| before | "바로 듣기 시작" → /app/read?bookId=GEN&chapter=3 | 없음 |
| during | "이어서 듣기" → 마지막 위치 복원 | "처음부터 다시" (작은 버튼) |
| after | "태그 선택만 하면 끝" → /app/meditation/new | "오늘 하나 더 읽기" 링크 |

## 6. 오늘의 한 걸음 플랜 계산

```typescript
// lib/reading/today-plan.ts

export async function getTodayPlan(userId: string): Promise<TodayPlan> {
  const profile = await getProfile(userId);
  const goalDays = profile.reading_goal_days; // 30/90/365

  // 1) 현재 진행 중인 plan이 있으면 이어서
  const activePlan = await getActivePlan(userId);
  if (activePlan) return activePlan;

  // 2) 없으면 다음 분량 자동 배정
  const nextReading = await computeNextReading({
    userId,
    goalDays,
    alreadyRead: profile.completed_chapters, // ["GEN-1", "GEN-2"]
  });

  return nextReading;
}
```

알고리즘:
- 사용자 목표 `reading_goal_days` 에 따라 하루 분량 계산
- 365일: 약 3장/일, 90일: 약 13장/일, 30일: 약 40장/일
- 진행 순서: 창세기 → 출애굽기 → ... → 계시록 (사용자가 커스텀 가능)

## 7. "읽기 완료" 판정

음원이 없으므로 본문 읽기 기준:

```typescript
// apps/web/app/app/read/page.tsx 에서 판정

function shouldMarkComplete(params: {
  scrollPercent: number;     // 스크롤 위치
  dwellTimeSeconds: number;   // 체류 시간
  estimatedMinutes: number;
}): boolean {
  return (
    params.scrollPercent >= 0.9 &&
    params.dwellTimeSeconds >= params.estimatedMinutes * 60 * 0.6
  );
}
```

완료 시 `daily_reading_completions` INSERT → 트리거로 스트릭·포인트 업데이트 → Realtime으로 홈 `TopStatusBar` 갱신.

## 8. 데이터 흐름

```
[Server Component / Home Page]
  ├── getTodayPlan(userId) → plan 결정
  ├── getActiveReadingSession(userId) → progress 확인
  ├── hasCompletedToday(userId) → state 결정
  │
  └── <TodayStepCard
        state={state}
        plan={plan}
        progress={progress}
        ...
      />
```

## 9. 접근성

- `role="region"` `aria-label="오늘의 한 걸음"`
- 주 CTA 버튼 최소 56px 높이, 중앙 대형
- State 변경 시 `aria-live="polite"` 로 알림
- 키보드 Enter/Space로 주 CTA 활성화

## 10. 완료 기준

- [ ] 3가지 state 전환 매끄럽게 동작
- [ ] plan 데이터 없을 때 Skeleton UI
- [ ] 클릭 시 `/app/read` 로 올바른 쿼리 파라미터 전달
- [ ] 완료 직후 State B → C 자동 전환 (Realtime)
- [ ] Storybook 3 variants + Loading
- [ ] E2E: 홈 → 읽기 → 완료 → 다시 홈에서 "완료" 카드 확인

## 11. Cowork 프롬프트

```
역할: A2 Dev Agent + A1 Architect

첨부:
- CLAUDE.md
- docs/prd/PRD-H02-today-step-card.md
- lib/reading/today-plan.ts (존재한다고 가정, 없으면 같이 작성)
- supabase/migrations/*.sql

작업 순서:
1) 먼저 lib/reading/today-plan.ts 의 getTodayPlan() 구현
2) components/home/TodayStepCard.tsx 구현 (3 states)
3) components/home/TodayStepCard.stories.tsx
4) __tests__/TodayStepCard.test.tsx

중요:
- 홈의 가장 큰 CTA — 시각적 위계 최강으로
- before 상태에서 "오늘 끝내면 +10P" 문구 반드시 표시 (읽기 선행 구조 강조)
- after 상태는 다음 행동(묵상) 유도가 핵심
```
