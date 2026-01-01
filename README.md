# 게을러도성경일독 (LazyBibleRead)

> **최소 입력 · 최대 은혜** | **눈은 쉬어도, 말씀은 흐르게**

성경 일독을 듣기 중심으로 쉽게 완수하고, 선택만으로 묵상을 기록할 수 있는 PWA 웹앱입니다.

## 핵심 기능

- **시간 기반 플랜**: 10분/1시간/하루/1달/3개월/1년 중 선택
- **카테고리 필터**: 전체/신약/구약/모세오경/시가서/복음서/바울서신
- **오디오 플레이어**: 1.0~2.0배속, 본문 접힘/펼침
- **게으른자의 묵상**: 선택 → 자동 문장 생성 → 저장 → 공유
- **기록 관리**: 히스토리 조회, 데이터 내보내기/가져오기

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **State**: Zustand
- **Storage**: IndexedDB (idb)
- **Testing**: Vitest + React Testing Library

## 시작하기

### 1. 의존성 설치

```bash
cd lazy-bible-read
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 테스트

```bash
# 테스트 실행
npm test

# 테스트 UI 모드
npm run test:ui
```

## 프로젝트 구조

```
lazy-bible-read/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 홈 (플랜 선택)
│   ├── plan/               # 오늘의 분량
│   ├── player/             # 오디오 플레이어
│   ├── meditation/         # 묵상 입력/상세
│   ├── history/            # 기록 목록
│   └── settings/           # 설정
├── components/
│   ├── ui/                 # 공통 UI 컴포넌트
│   └── layout/             # 레이아웃 컴포넌트
├── stores/                 # Zustand 상태 관리
├── lib/
│   ├── db/                 # IndexedDB 설정
│   ├── constants/          # 상수 (태그, 옵션)
│   ├── utils/              # 유틸리티 함수
│   ├── samplePassages.ts   # 샘플 성경 데이터
│   └── generateMeditationSummary.ts  # 자동 문장 생성
├── types/                  # TypeScript 타입
└── __tests__/              # 테스트 파일
```

## PWA 설정

앱을 홈 화면에 추가하면 네이티브 앱처럼 사용할 수 있습니다.

### 아이콘 추가

`public/icons/` 폴더에 다음 파일을 추가하세요:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

### 오디오 파일 추가

`public/audio/` 폴더에 `sample.mp3` 파일을 추가하세요.
저작권 문제가 없는 성경 오디오를 사용해주세요.

## 데이터 관리

- 모든 데이터는 브라우저의 IndexedDB에 저장됩니다
- 설정 > 데이터 내보내기로 JSON 백업 가능
- 설정 > 데이터 가져오기로 복원 가능

## 라이선스

MIT License

---

**게을러도성경일독** - 쓰지 않아도 되는 묵상, 선택하면 완성됩니다.
