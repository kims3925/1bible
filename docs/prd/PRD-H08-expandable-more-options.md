# PRD-H08: ExpandableMoreOptions 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<ExpandableMoreOptions />` |
| **경로** | `apps/web/components/home/ExpandableMoreOptions.tsx` |
| **예상 소요** | 0.5일 |

---

## 1. 목적

현재 원본 홈 화면에 있는 **"책으로 일독" 12개 묶음책 진도바 + 커플/소그룹/내목소리 낭독 + 영어 모드**를 전부 **접힘 상태로 숨긴다**. 필요한 사용자가 펼칠 때만 노출 → 첫 화면 인지 부하 대폭 감소.

## 2. 레이아웃

### 접힌 상태 (기본)
```
▼ 더 많은 읽기 방법
```

### 펼친 상태
```
▲ 더 많은 읽기 방법

  📚 책별 이어서 읽기
    ├── 구약 (39권) — 전체 12%
    │   ├── 모세오경 (5권) ▓▓▓░░ 67%
    │   ├── 역사서 (12권) ▓░░░░ 20%
    │   ├── 시가서 (5권) ▓▓▓▓░ 80%
    │   ├── 대선지서 (5권) ░░░░░ 0%
    │   └── 소선지서 (12권) ░░░░░ 0%
    │
    └── 신약 (27권) — 전체 47%
        ├── 사복음서 ▓▓▓▓▓ 100%
        ├── 사도행전 ▓▓░░░ 40%
        ├── 바울서신 (13권) ▓▓░░░ 38%
        ├── 일반서신 (8권) ░░░░░ 0%
        └── 요한계시록 ░░░░░ 0%

  🎭 특별 모드
    ├── 🚗 차에서 듣기 (배경 재생)
    ├── 📅 365일 일독 플랜
    ├── 🌐 영어로 읽기
    └── 🌏 영어·한국어 번갈아

  👥 함께 읽기
    ├── 💑 커플 읽기
    ├── 👥 소그룹 읽기
    └── 🎙️ 내 목소리 낭독
```

## 3. Props

```typescript
interface ExpandableMoreOptionsProps {
  defaultExpanded?: boolean; // 기본 false
  bookGroups: BookGroupProgress[];
  specialModes: SpecialMode[];
  togetherOptions: TogetherOption[];
  onSelect: (option: AnyOption) => void;
}
```

## 4. 사용자 행동 추적

```typescript
posthog.capture('more_options_expanded', {
  user_id,
  home_view_count_today, // 하루에 몇 번 펼쳤나
});
```

**KPI**: 하루 홈 방문 중 "더보기 펼침" 비율. 만약 이 비율이 80% 넘으면 → 기본 펼침으로 변경 검토. 20% 미만 → 아예 제거 검토.

## 5. 상태 유지

사용자가 펼친 상태를 **localStorage에 저장** — 다음 방문 시에도 펼친 상태 유지 (사용자 선호 존중).

```typescript
const [expanded, setExpanded] = useLocalStorage('home.moreOptions.expanded', false);
```

## 6. 애니메이션

- 펼침: Framer Motion `initial={{ height: 0 }}` → `animate={{ height: 'auto' }}`
- 300ms, easeInOut
- `prefers-reduced-motion` 시 즉시 전환

## 7. 접근성

- `<details>` / `<summary>` 시맨틱 요소 활용 (스크린 리더 기본 지원)
- 또는 ARIA `aria-expanded` + `aria-controls`
- 키보드 Enter/Space로 토글

## 8. 책별 진도 데이터

```typescript
const BOOK_GROUPS = [
  { id: 'pentateuch', name: '모세오경', books: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
  { id: 'history', name: '역사서', books: [...] },
  { id: 'poetry', name: '시가서', books: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
  { id: 'major-prophets', name: '대선지서', books: [...] },
  { id: 'minor-prophets', name: '소선지서', books: [...] },
  { id: 'gospels', name: '사복음서', books: ['MAT', 'MRK', 'LUK', 'JHN'] },
  { id: 'acts', name: '사도행전', books: ['ACT'] },
  { id: 'pauline', name: '바울서신', books: [...] },
  { id: 'general', name: '일반서신', books: [...] },
  { id: 'revelation', name: '요한계시록', books: ['REV'] },
];
```

## 9. 완료 기준

- [ ] 접힘/펼침 동작
- [ ] localStorage 상태 유지
- [ ] 10개 묶음책 진도 정확히 계산
- [ ] 특별 모드 4개 클릭 시 각 페이지 이동
- [ ] 함께 읽기 3개 옵션 동작
- [ ] 접근성 `<details>` 또는 ARIA
- [ ] Storybook 2개 (접힘/펼침)

## 10. Cowork 프롬프트

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-H08-expandable-more-options.md
- lib/reading/progress.ts (PRD-H07에서 구현)

작업:
1) components/home/ExpandableMoreOptions.tsx
2) components/home/BookGroupProgressItem.tsx
3) lib/reading/book-groups.ts (BOOK_GROUPS 정의)
4) hooks/useLocalStorage.ts (없으면 구현)
5) Storybook + 테스트

중요: <details>/<summary> 사용 우선 검토 (접근성 기본 지원)
```
