# PRD-H03: QuickTimeSelector 컴포넌트

| 항목 | 내용 |
|---|---|
| **컴포넌트** | `<QuickTimeSelector />` |
| **경로** | `apps/web/components/home/QuickTimeSelector.tsx` |
| **예상 소요** | 0.3일 |

---

## 1. 목적

현재 화면(원본 앱)에 시간 선택 버튼이 9개 있는데, 게으른 사용자에게는 과한 선택지. **상단에 3개만(5/10/30분)** 노출하고 나머지는 "다르게 ▾" 바텀시트로 숨긴다.

## 2. 레이아웃

```
▼ 시간이 더 있으세요?

[ 5분 ]  [ 10분 ]  [ 30분 ]  [ 다르게 ▾ ]
```

- 3개 빠른 버튼 + 1개 "더보기"
- "더보기" 탭 시 바텀시트 열림: 1시간 / 2시간 / 시간 직접 입력 / 차에서 듣기 / 일독 플랜 / 영어 모드

## 3. Props

```typescript
interface QuickTimeSelectorProps {
  quickOptions?: number[];  // 기본 [5, 10, 30]
  onQuickSelect: (minutes: number) => void;
  onMoreClick: () => void;
}
```

## 4. 바텀시트 내용

```tsx
<BottomSheet title="읽기 방식 선택">
  <Section title="⏱ 시간으로">
    <Button>1시간</Button>
    <Button>2시간</Button>
    <Button>직접 입력</Button>
  </Section>

  <Section title="🎭 모드">
    <Button>🚗 차에서 듣기</Button>
    <Button>📅 일독 플랜</Button>
    <Button>🌐 영어로 읽기</Button>
    <Button>🌏 영어·한국어 번갈아</Button>
  </Section>

  <Section title="📚 책으로">
    <Button onClick={...}>전체 목록 보기</Button>
  </Section>
</BottomSheet>
```

## 5. 상호작용

- 빠른 버튼 탭 → 즉시 `/app/read?minutes=N` 로 이동
- 각 옵션 누르면 AI가 자동 분량 배정 후 바로 본문 뷰어

## 6. 프리뷰 기능 (선택)

각 시간 버튼에 호버·롱프레스 시:
```
[ 5분 ]
  ↓ (롱프레스 500ms)
"오늘 창세기 3장을 읽어요" 툴팁
```

## 7. 완료 기준

- [ ] 3개 빠른 버튼 + "다르게" 동작
- [ ] 바텀시트 옵션 7개 연결
- [ ] 각 버튼 터치 44x44px 이상
- [ ] 키보드 Tab 이동 가능
- [ ] Storybook 2개 (닫힘/열림)
