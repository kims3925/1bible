# PRD-H05: TodayVerseCard 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<TodayVerseCard />` |
| **경로** | `apps/web/components/home/TodayVerseCard.tsx` |
| **의존성** | `@vercel/og` (공유 카드 생성) |
| **예상 소요** | 1일 (OG 이미지 생성 포함) |

---

## 1. 목적

홈 화면에서 **하루 한 구절을 노출**하고, **공유 카드를 자동 생성**하여 바이럴 Loop 1(묵상 공유)의 진입점 역할을 한다.

## 2. 표시 원칙

- 랜덤 구절이 아니라 **오늘 읽을 범위에서 자동 추출** (맥락 일치)
- 읽기 전: "오늘 이 구절을 만나요" (기대감)
- 읽기 후: "오늘의 말씀" (묵상 유도)

## 3. 레이아웃

```
┌──────────────────────────────────────────────┐
│  💭 오늘의 말씀                               │
│                                               │
│  "근심하는 자 같으나 항상 기뻐하고           │
│   가난한 자 같으나 많은 사람을 부요하게      │
│   하고 아무 것도 없는 자 같으나 모든 것을    │
│   가진 자로다"                                │
│                                               │
│                        — 고린도후서 6:10     │
│                                               │
│  [ 📤 공유하기 ]  [ 🙏 묵상하기 ]            │
└──────────────────────────────────────────────┘
```

## 4. Props

```typescript
interface TodayVerseCardProps {
  verse: {
    text: string;
    reference: string;        // "고후 6:10"
    bookId: string;            // "CO2"
    chapter: number;
    verseNumber: number;
  };
  hasReadToday: boolean;
  onShare: () => void;
  onMeditate?: () => void;    // 읽기 후에만 노출
}
```

## 5. 오늘의 구절 선택 알고리즘

```typescript
// lib/reading/today-verse.ts

export async function selectTodayVerse(userId: string): Promise<Verse> {
  const todayPlan = await getTodayPlan(userId);
  // 오늘 읽을 범위: 예) GEN 3장 1~24절

  // 1) 범위 내 구절 중 "의미 있는 구절" 후보
  //    - verse_highlights 테이블에 등록된 유명 구절 우선
  //    - 없으면 중간 지점 구절
  const candidates = await supabase
    .from('bible_verses')
    .select('*, verse_highlights(weight)')
    .eq('book_id', todayPlan.bookId)
    .eq('chapter', todayPlan.chapter)
    .order('verse_highlights.weight', { ascending: false });

  // 2) 유저별 시드로 선택 (같은 날 같은 유저에게 같은 구절)
  const seed = hashUserDate(userId, today());
  const index = seed % Math.min(candidates.length, 5);

  return candidates[index];
}
```

사전 작업: `verse_highlights` 테이블에 주요 구절 가중치 등록 (예: 고후 6:10 → weight 10).

## 6. 공유 카드 생성

### 6-1. OG 이미지 엔드포인트

```
apps/web/app/api/og/verse/route.tsx
```

```tsx
import { ImageResponse } from '@vercel/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') ?? '';
  const reference = searchParams.get('ref') ?? '';
  const format = searchParams.get('format') ?? '1:1'; // 9:16, 1:1, 1.91:1

  const dimensions = {
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '1.91:1': { width: 1200, height: 628 },
  }[format];

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #4F7CFF 0%, #6B8FFF 100%)',
        padding: 80,
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Pretendard',
      }}>
        <div style={{ fontSize: 28, opacity: 0.8, marginBottom: 40 }}>
          💭 오늘의 말씀
        </div>
        <div style={{ fontSize: 56, lineHeight: 1.5, fontWeight: 600 }}>
          "{text}"
        </div>
        <div style={{ fontSize: 36, marginTop: 60, opacity: 0.9 }}>
          — {reference}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: 80,
          fontSize: 24,
          opacity: 0.7,
        }}>
          📖 게을러도성경일독 · bible.hublink.im
        </div>
      </div>
    ),
    { ...dimensions }
  );
}
```

### 6-2. 공유 모달

```tsx
<ShareModal>
  <Tabs>
    <Tab label="📱 스토리 (9:16)">
      <img src="/api/og/verse?format=9:16&text=...&ref=..." />
      <Button>카카오스토리로 공유</Button>
      <Button>인스타그램으로 공유</Button>
      <Button>이미지 다운로드</Button>
    </Tab>
    <Tab label="📝 피드 (1:1)">...</Tab>
    <Tab label="🔗 링크 미리보기">...</Tab>
  </Tabs>

  <Section title="링크 공유">
    <CopyableLink url="https://bible.hublink.im/v/co2/6/10" />
    <QRCode value={url} />
  </Section>
</ShareModal>
```

### 6-3. 딥링크 `/v/:book/:chapter/:verse`

- 비로그인도 접근 가능
- 해당 구절만 크게 표시 + "이 앱에서 더 읽기" CTA
- 열면 해당 구절부터 본문 뷰어로 이동 (로그인 상태면)

## 7. 공유 이벤트 추적

```typescript
posthog.capture('verse_shared', {
  verse_ref: 'CO2-6-10',
  format: '9:16',
  platform: 'kakao' | 'instagram' | 'link_copy',
});
```

공유 1회당 +10P 적립 (일 1회 제한, 중복 방지는 `share_cards` 테이블로).

## 8. 접근성

- 본문 텍스트는 `<blockquote>` 요소
- `cite` 속성에 reference 값
- 공유 버튼 `aria-label="이 구절을 공유하기"`

## 9. 완료 기준

- [ ] 오늘의 구절 자동 선택 로직
- [ ] 3가지 비율 OG 이미지 생성 (9:16, 1:1, 1.91:1)
- [ ] 공유 모달 + 카카오/인스타/링크복사
- [ ] 딥링크 `/v/:book/:chapter/:verse` 페이지
- [ ] 공유 1회 시 +10P 적립 (일 1회)
- [ ] PostHog 이벤트 추적
- [ ] Storybook 2개 (읽기 전/후)

## 10. Cowork 프롬프트

```
역할: A2 Dev Agent + C3 Growth Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-H05-today-verse-card.md
- 오늘의 구절 알고리즘 참고 (PRD 내 섹션 5)

작업 순서:
1) lib/reading/today-verse.ts — 구절 선택 로직
2) components/home/TodayVerseCard.tsx
3) components/share/ShareModal.tsx
4) app/api/og/verse/route.tsx — OG 이미지
5) app/v/[book]/[chapter]/[verse]/page.tsx — 딥링크
6) Storybook + 테스트

중요:
- 오늘의 구절은 유저별로 하루 안 바뀜 (UX 일관성)
- OG 이미지 로딩 빠르게 (5초 내)
- 공유 시 +10P 적립은 서버에서 처리 (클라이언트 조작 방지)
```
