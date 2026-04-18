# PRD-WU-04: DISC 체험 페이지

| 항목 | 내용 |
|---|---|
| **작업 단위** | WU-04 |
| **의존성** | WU-02, WU-03 (QuizStepper 등 재사용) |
| **예상 소요** | 0.5일 (MBTI 구조 재사용하므로 짧음) |
| **우선순위** | P0 |

---

## 1. 배경

성경인물 DISC 검사는 MBTI와 구조가 같지만 4차원(Dominance / Influence / Steadiness / Conscientiousness)을 측정한다. WU-03에서 만든 `<QuizStepper />` 와 게스트 세션 인프라를 그대로 재사용한다.

## 2. MBTI와의 차이점

| 항목 | MBTI | DISC |
|---|---|---|
| 차원 | 4개 (EI/SN/TF/JP) | 4개 (D/I/S/C) |
| 문항 수 | 12개 | 12개 |
| 결과 유형 수 | 16 | 16 (DISC 조합 중 주요 16) |
| 성경 인물 예시 | 모세, 바울, 요한 | 다윗(D), 베드로(I), 룻(S), 느헤미야(C) |
| 계산 방식 | 각 차원의 다수결 | 점수 합산 + 주/부 유형 |

## 3. 데이터 스키마

```
content/assessments/bible-disc.json
```

```json
{
  "id": "bible-disc",
  "title_ko": "성경인물 DISC",
  "description_ko": "나의 리더십 스타일은?",
  "question_count": 12,
  "estimated_minutes": 3,
  "tier": "free",
  "dimensions": ["D", "I", "S", "C"],
  "scoring": "sum",
  "questions": [
    {
      "id": "q1",
      "text": "새로운 일이 생기면 나는...",
      "options": [
        { "value": "D", "label": "결단력 있게 주도한다" },
        { "value": "I", "label": "사람들을 모아 의견을 구한다" },
        { "value": "S", "label": "신중히 상황을 지켜본다" },
        { "value": "C", "label": "먼저 자료를 조사한다" }
      ]
    }
  ],
  "result_types": {
    "D": {
      "bible_figure": "다윗",
      "title_ko": "결단하는 리더 · 다윗 유형",
      "description": "...",
      "strengths": [...],
      "biblical_application": [...],
      "recommended_reading": ["사무엘상 17장", "시편 23편"]
    }
    // I, S, C, DI, DS, ... 조합 유형
  }
}
```

## 4. 결과 계산 로직

MBTI는 이진 선택의 다수결, DISC는 **4개 옵션 중 1개 선택 → 점수 합산**.

```typescript
// lib/assessments/disc-calculator.ts

export function calculateDiscResult(
  answers: Record<string, 'D'|'I'|'S'|'C'>
): { primary: string; secondary: string; scores: Record<string, number> } {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  Object.values(answers).forEach(v => scores[v]++);

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores,
  };
}
```

결과 타입 결정:
- 1위가 2위보다 **2점 이상 차이** → 단일 유형 (예: "D")
- 1-2위가 **1점 차이 이내** → 복합 유형 (예: "DI")

## 5. 라우트

```
apps/web/app/trial/disc/
├── page.tsx          # 소개
├── quiz/page.tsx     # 문항 스텝퍼 (QuizStepper 재사용)
└── result/page.tsx   # 결과
```

## 6. 완료 기준

- [ ] MBTI와 동일 UX 기준 충족
- [ ] 4옵션 라디오 UI (MBTI는 2옵션)
- [ ] 복합 유형 표시 로직 ("DI 복합형")
- [ ] 결과 페이지 해설 분량 MBTI 수준 유지
- [ ] 공유·가입 유도 CTA 동일 위치
- [ ] PostHog 이벤트 — `assessment_id: 'bible-disc'` 로 구분

## 7. Cowork 의뢰 프롬프트

```
역할: A2 Dev Agent

첨부:
- CLAUDE.md
- docs/prd/PRD-WU-04-trial-disc.md
- apps/web/app/trial/mbti/ 전체 (WU-03 산출물)
- apps/web/components/trial/QuizStepper.tsx

작업:
WU-03의 MBTI 페이지를 참조하여 DISC 버전을 구현하세요:
1) content/assessments/bible-disc.json (5문항 샘플 먼저)
2) lib/assessments/disc-calculator.ts
3) app/trial/disc/page.tsx
4) app/trial/disc/quiz/page.tsx
5) app/trial/disc/result/page.tsx

MBTI와의 핵심 차이:
- 4옵션 라디오 (MBTI는 2옵션)
- 복합 유형 표시 (primary + secondary)
- 스코어 합산 방식
```

## 8. 콘텐츠 작업

- [ ] 12문항 작성 (B4 Agent)
- [ ] 4대 유형 + 주요 복합형 해설 (D, I, S, C, DI, IS, SC, CD 최소 8개)
- [ ] 신학 감수
