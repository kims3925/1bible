# PRD-H06: SocialFeedStrip 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<SocialFeedStrip />` |
| **경로** | `apps/web/components/home/SocialFeedStrip.tsx` |
| **노출 조건** | 오늘 읽기 완료 후에만 (읽기 선행 구조) |
| **예상 소요** | 1일 |

---

## 1. 목적

홈에서 **"혼자가 아니다"** 라는 감각을 만든다. 같은 그룹·친구들의 활동 피드 표시 + 1클릭 응원으로 Loop 2 (동행 루프)의 씨앗 역할.

## 2. 레이아웃

```
👥 함께 읽는 사람들

┌──────────────────────────────────────────────┐
│ 👩 김집사님이 방금 요한복음 3장 완료 🎉       │
│                                    [👏 응원]  │
├──────────────────────────────────────────────┤
│ 👨 박권사님 7일 연속 달성! 🔥                 │
│                                    [👏 응원]  │
├──────────────────────────────────────────────┤
│ 👩 이자매님이 새 묵상을 남겼어요              │
│                                    [💬 보기]  │
├──────────────────────────────────────────────┤
│ [ 더 보기 → /app/together ]                  │
└──────────────────────────────────────────────┘
```

## 3. Props

```typescript
interface SocialFeedStripProps {
  activities: FeedActivity[];
  maxItems?: number; // 기본 3
  onEncourage: (activity: FeedActivity) => Promise<void>;
  onViewMeditation?: (activity: FeedActivity) => void;
  onViewAll: () => void;
}

interface FeedActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'reading_complete' | 'streak_milestone' | 'new_meditation' | 'badge_earned';
  message: string;           // 자동 생성된 한국어 문장
  metadata: Record<string, unknown>;
  createdAt: string;
  alreadyEncouraged?: boolean;
}
```

## 4. 데이터 소스

### 4-1. 뷰 `v_social_feed`

```sql
CREATE OR REPLACE VIEW v_social_feed AS
SELECT
  drc.id,
  drc.user_id,
  bp.display_name as user_name,
  bp.avatar_emoji,
  'reading_complete' as type,
  jsonb_build_object(
    'book_id', drc.book_id,
    'chapter_range', drc.chapter_range
  ) as metadata,
  drc.completed_at as created_at
FROM daily_reading_completions drc
JOIN bible_profiles bp ON bp.user_id = drc.user_id
WHERE drc.completed_at > NOW() - INTERVAL '6 hours'

UNION ALL

SELECT
  CONCAT('streak:', bp.user_id)::UUID,
  bp.user_id,
  bp.display_name,
  bp.avatar_emoji,
  'streak_milestone',
  jsonb_build_object('streak_days', bp.streak_days),
  bp.streak_updated_at
FROM bible_profiles bp
WHERE bp.streak_days IN (7, 14, 30, 50, 100, 365)
  AND bp.streak_updated_at > NOW() - INTERVAL '24 hours'

-- (묵상, 배지 등 추가 UNION)
ORDER BY created_at DESC
LIMIT 50;
```

### 4-2. 피드 필터링 (공개·그룹)

사용자가 속한 그룹 내 활동만 표시 (낯선 사람 피드는 제외):

```sql
SELECT * FROM v_social_feed sf
WHERE sf.user_id IN (
  SELECT gm2.user_id
  FROM group_members gm1
  JOIN group_members gm2 ON gm1.group_id = gm2.group_id
  WHERE gm1.user_id = auth.uid()
)
OR sf.user_id IN (
  -- 내가 팔로우한 사람
  SELECT following_user_id FROM follows WHERE follower_user_id = auth.uid()
)
LIMIT 10;
```

그룹이 없는 사용자에게는 **공개 설정한 묵상**이나 **대표 증언** 노출.

## 5. 응원 보내기

```typescript
async function sendEncouragement(activity: FeedActivity) {
  // 1) encouragements 테이블에 INSERT
  // 2) 받는 사람에게 알림 (이메일/푸시)
  // 3) 보낸 사람 +5P 적립
  // 4) 받는 사람 +3P 적립 (감사 포인트)
}
```

## 6. 실시간 업데이트

Supabase Realtime으로 `daily_reading_completions` INSERT 구독:

```tsx
useEffect(() => {
  const channel = supabase
    .channel('social-feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'daily_reading_completions',
    }, (payload) => {
      // 내 그룹인지 확인 후 피드 상단에 추가
    })
    .subscribe();
}, []);
```

## 7. 문구 생성 규칙

| 이벤트 | 템플릿 |
|---|---|
| reading_complete | `{이름}님이 방금 {책} {장} 완료 🎉` |
| streak_milestone (7일) | `{이름}님 7일 연속 달성! 🔥` |
| streak_milestone (30일) | `{이름}님 30일 대기록! ⚡` |
| new_meditation | `{이름}님이 새 묵상을 남겼어요` |
| badge_earned | `{이름}님이 '{배지명}' 배지 획득 🏅` |

## 8. 비어있을 때 (Empty State)

```
┌──────────────────────────────────────────────┐
│  👥 아직 함께하는 사람이 없어요               │
│                                               │
│  👉 부부·소그룹·교회와 함께 읽어보세요        │
│                                               │
│  [ + 그룹 만들기 ]  [ 초대 링크 받기 ]       │
└──────────────────────────────────────────────┘
```

이 Empty State가 **Loop 2 진입 최대 기회**. 강조.

## 9. 접근성

- 각 피드 항목 `role="listitem"`
- 응원 버튼 `aria-label="{이름}님에게 응원 보내기"`
- 실시간 추가 시 `aria-live="polite"` ("새 활동 1건")

## 10. 완료 기준

- [ ] `v_social_feed` 뷰 생성
- [ ] 그룹 필터링 동작
- [ ] 응원 보내기 → 알림 + 포인트 적립
- [ ] Realtime 실시간 업데이트
- [ ] Empty State + 그룹 만들기 유도
- [ ] Storybook 3개 (Filled / Empty / Loading)

## 11. Cowork 프롬프트

```
역할: A2 Dev Agent + 백엔드

첨부:
- CLAUDE.md
- docs/prd/PRD-H06-social-feed-strip.md
- supabase/migrations/*.sql

작업:
1) supabase/migrations/*.sql 에 v_social_feed 뷰 추가
2) lib/feed/get-social-feed.ts
3) components/home/SocialFeedStrip.tsx
4) components/home/FeedItem.tsx
5) app/api/encouragement/send/route.ts
6) Realtime 구독 훅: hooks/useSocialFeed.ts
7) Storybook + 테스트

중요:
- 그룹 없는 사용자의 Empty State가 "초대/그룹 생성" CTA로 연결 (Loop 2 핵심)
- 응원 중복 방지 (동일 activity_id, 동일 sender는 1회)
```
