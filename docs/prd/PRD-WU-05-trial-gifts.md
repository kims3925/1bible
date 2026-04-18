# PRD-WU-05: 은사 체크리스트 체험 페이지

| 항목 | 내용 |
|---|---|
| **작업 단위** | WU-05 |
| **의존성** | WU-02, WU-03 |
| **예상 소요** | 1일 (7은사 + 해설 콘텐츠 분량이 많아 소폭 증가) |
| **우선순위** | P0 |

---

## 1. 배경

고린도전서 12:4-11과 로마서 12:6-8 기반의 영적 은사 체크리스트. MBTI·DISC보다 **신학적 민감도가 높아** 감수 게이트가 더 중요하다.

## 2. MBTI·DISC와의 차이점

| 항목 | MBTI | DISC | 은사 |
|---|---|---|---|
| 문항 수 | 12 | 12 | **20** (은사당 약 3문항) |
| 형식 | 이진 선택 | 4지선다 | **5점 리커트 척도** |
| 결과 | 1유형 | 주/부 유형 | **Top 3 은사** |
| 근거 본문 | 성경 인물 | 성경 인물 | **고린도전서·로마서** |
| 소요 시간 | 3분 | 3분 | **5분** |

## 3. 7대 은사 (기본 구성)

1. 🔥 **가르침** (Teaching) — 로마서 12:7
2. 🤝 **봉사** (Service) — 로마서 12:7
3. 🙏 **권면** (Exhortation) — 로마서 12:8
4. 💰 **섬김의 베풂** (Giving) — 로마서 12:8
5. 👑 **지도** (Leadership) — 로마서 12:8
6. ❤️ **긍휼** (Mercy) — 로마서 12:8
7. 📖 **지혜·지식** (Wisdom/Knowledge) — 고전 12:8

선택에 따라 은사를 7개 또는 9개(방언·예언 포함)로 확장 가능. **초기 버전은 7개로 시작**.

## 4. 데이터 스키마

```
content/assessments/bible-gifts.json
```

```json
{
  "id": "bible-gifts",
  "title_ko": "은사 체크리스트",
  "description_ko": "고전 12장 기반 나의 영적 은사",
  "question_count": 20,
  "estimated_minutes": 5,
  "tier": "free",
  "scoring": "likert",
  "dimensions": ["teaching", "service", "exhortation", "giving", "leadership", "mercy", "wisdom"],
  "questions": [
    {
      "id": "q1",
      "dimension": "teaching",
      "text": "성경 구절을 다른 사람에게 설명할 때 뿌듯함을 느낀다"
    },
    {
      "id": "q2",
      "dimension": "mercy",
      "text": "슬퍼하는 사람 곁에 있으면 나도 마음이 아파온다"
    }
    // 20개
  ],
  "likert_scale": [
    { "value": 1, "label": "전혀 아니다" },
    { "value": 2, "label": "아니다" },
    { "value": 3, "label": "보통이다" },
    { "value": 4, "label": "그렇다" },
    { "value": 5, "label": "매우 그렇다" }
  ],
  "gift_definitions": {
    "teaching": {
      "name_ko": "가르침",
      "emoji": "🔥",
      "verses": ["롬 12:7", "엡 4:11"],
      "description": "진리를 명확히 전하고 해석하는 은사",
      "biblical_figures": ["에스라", "바울", "아볼로"],
      "practical_suggestions": ["주일학교 교사 지원", "성경공부 리더", "소그룹 말씀 나눔 인도"],
      "recommended_reading": ["사도행전 18장", "디모데후서 2장"]
    }
    // 7개
  }
}
```

## 5. 결과 계산 로직

```typescript
// lib/assessments/gifts-calculator.ts

export function calculateGiftsResult(
  answers: Record<string, number>, // 1~5
  questions: GiftQuestion[]
): { topGifts: GiftResult[]; allScores: Record<string, number> } {
  const totals: Record<string, { sum: number; count: number }> = {};

  questions.forEach(q => {
    if (!totals[q.dimension]) totals[q.dimension] = { sum: 0, count: 0 };
    totals[q.dimension].sum += answers[q.id] ?? 3;
    totals[q.dimension].count++;
  });

  // 차원별 평균 점수 (0~5)
  const averages = Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, v.sum / v.count])
  );

  // Top 3 추출
  const topGifts = Object.entries(averages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([dimension, score]) => ({ dimension, score }));

  return { topGifts, allScores: averages };
}
```

## 6. UI 특이사항

### 6-1. 리커트 척도 위젯 (MBTI·DISC와 다름)

```tsx
<LikertScale
  question="성경 구절을 다른 사람에게 설명할 때 뿌듯함을 느낀다"
  value={3}  // 1~5
  onChange={(v) => ...}
  labels={['전혀 아니다', '아니다', '보통', '그렇다', '매우 그렇다']}
/>
```

- 5개의 원형 버튼, 가운데로 갈수록 작아지는 디자인
- 선택 시 즉시 다음 문항 (0.3초)
- 키보드: 1~5 숫자키 또는 방향키

### 6-2. 결과 화면 — Top 3 강조

- 1위 은사: 크게 + 상세 해설
- 2위 은사: 중간 + 간단 설명
- 3위 은사: 작게 + 한 줄
- 나머지 4개: 점수 막대그래프로 참고 제공
- **"당신의 사역 추천"**: 1위 은사의 `practical_suggestions` 3개

### 6-3. 추가 컴포넌트

```
components/trial/LikertScale.tsx         # 리커트 5점
components/trial/GiftResultHero.tsx      # Top 3 시각화
components/trial/GiftScoreChart.tsx      # 7은사 전체 막대
```

## 7. 라우트

```
apps/web/app/trial/gifts/
├── page.tsx
├── quiz/page.tsx
└── result/page.tsx
```

## 8. 신학 감수 (필수)

이 검사는 **감수 없이 배포 금지**. 감수 포인트:

1. 은사 정의가 정통 개신교 신학에 부합하는가
2. 은사 해설에 은사주의·극단주의 편향이 없는가
3. `practical_suggestions` 가 과도한 사역 의무감을 주지 않는가
4. 성경 본문 인용이 문맥에 맞는가
5. 각 은사의 "왜 이게 은사인가" 근거 구절이 정확한가

## 9. 완료 기준

- [ ] 20문항 리커트 5점 스텝퍼 동작
- [ ] Top 3 은사 결과 페이지
- [ ] 7은사 전체 점수 막대그래프
- [ ] 사역 추천 섹션 표시
- [ ] 공유·가입 CTA
- [ ] **신학 감수자 승인 완료** (배포 전 필수)
- [ ] PostHog 이벤트 — `assessment_id: 'bible-gifts'`

## 10. Cowork 의뢰 프롬프트

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-WU-05-trial-gifts.md
- content/assessments/bible-gifts.json (B4 Agent 산출물)
- apps/web/components/trial/QuizStepper.tsx (WU-03)

작업:
1) components/trial/LikertScale.tsx (리커트 5점)
2) lib/assessments/gifts-calculator.ts
3) app/trial/gifts/page.tsx
4) app/trial/gifts/quiz/page.tsx
5) app/trial/gifts/result/page.tsx
6) components/trial/GiftResultHero.tsx (Top 3)
7) components/trial/GiftScoreChart.tsx (7은사 막대)

주의: 결과 페이지의 해설 텍스트는 content/assessments/bible-gifts.json 의
gift_definitions 에서만 가져오세요. 하드코딩 금지 (감수 반영 용이성).
```

## 11. 콘텐츠 작업 선행

- [ ] 20문항 작성 (각 은사당 약 3문항, B4 Agent)
- [ ] 7은사 해설 작성 (신학 근거 포함)
- [ ] **신학 감수 완료** (필수 블로커)
- [ ] Joseph 최종 승인
