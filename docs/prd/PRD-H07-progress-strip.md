# PRD-H07: ProgressStrip 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<ProgressStrip />` |
| **경로** | `apps/web/components/home/ProgressStrip.tsx` |
| **예상 소요** | 0.5일 |

---

## 1. 목적

홈에서 **간결한 진도 요약**을 보여준다. 상세 진도는 `/app/progress` 전용 페이지로 분리. 현재 원본 화면처럼 12개 묶음책 진도바를 전부 노출하면 인지 부하 과다.

## 2. 레이아웃

```
📊 내 진도                              [상세 →]

전체    ▓▓▓░░░░░░░░░░░░░░░░░░  32%
신약    ▓▓▓▓▓░░░░░░░░░░░░░░░  47%
```

## 3. Props

```typescript
interface ProgressStripProps {
  overall: number;      // 0.32
  newTestament: number; // 0.47
  oldTestament: number; // 0.28
  currentStreak: number;
  onExpandClick: () => void;
}
```

## 4. 표시 원칙

### 신규 사용자 (0% 상태)
```
📊 내 진도                              [상세 →]

아직 시작하지 않았어요 · 오늘부터 시작해보세요!
```

0%를 숫자로 보여주지 않음 — 심리적 부담 제거 (이전 분석 지적사항).

### 10% 미만
```
전체    ▓░░░░░░░░░░░░░░░░░░░  창세기 5장까지 읽음
```

### 10% 이상
```
전체    ▓▓▓░░░░░░░░░░░░░░░░░  32% · 367/1189장
```

## 5. 상세 페이지로 유도

"상세 →" 클릭 시 `/app/progress` 이동:
- 66권 각각 히트맵
- 묶음책별 진도 (12개)
- 월별 읽기 차트
- 완독 배지 컬렉션

## 6. 데이터 계산

```typescript
// lib/reading/progress.ts

export async function getUserProgress(userId: string) {
  const { data } = await supabase
    .from('daily_reading_completions')
    .select('book_id, chapter_range')
    .eq('user_id', userId);

  const readChapters = data.flatMap(expandChapterRange);
  const totalChapters = 1189;

  return {
    overall: readChapters.length / totalChapters,
    newTestament: countIn(readChapters, NT_BOOKS) / 260,
    oldTestament: countIn(readChapters, OT_BOOKS) / 929,
    readChapters,
  };
}
```

**성능**: 매 홈 방문마다 계산하면 부하. 집계 테이블 `user_progress_summary` 에 캐시:

```sql
CREATE TABLE user_progress_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  overall_pct NUMERIC(5,4),
  nt_pct NUMERIC(5,4),
  ot_pct NUMERIC(5,4),
  read_chapter_count INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 트리거로 자동 갱신
CREATE TRIGGER trg_update_progress_summary
AFTER INSERT ON daily_reading_completions
FOR EACH ROW
EXECUTE FUNCTION refresh_user_progress();
```

## 7. 접근성

- 진도바 `role="progressbar"` + `aria-valuenow` + `aria-valuemax`
- 신규 사용자 Empty State도 명확한 텍스트

## 8. 완료 기준

- [ ] 3가지 상태 (0% / <10% / >=10%) 렌더
- [ ] 상세 페이지 이동
- [ ] 집계 테이블 자동 갱신
- [ ] Storybook 3개

## 9. Cowork 프롬프트

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-H07-progress-strip.md
- supabase/migrations/*.sql (user_progress_summary 트리거 포함)

작업:
1) lib/reading/progress.ts
2) components/home/ProgressStrip.tsx
3) app/app/progress/page.tsx — 상세 페이지 (히트맵 포함)
4) Storybook + 테스트

핵심: 0% 표시 금지, 신규 유저 친화적 문구 사용
```
