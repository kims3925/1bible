/**
 * 어드민 패널
 * Hub_Link AdminDashboard.jsx 패턴 참조
 * 7개 탭: 대시보드 / 회원관리 / 플랜관리 / 에이전트 / 콘텐츠·수익 / 가입승인 / 설정
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// 타입 정의
// ============================================

type AdminSection =
  | 'dashboard'
  | 'approval'
  | 'members'
  | 'plans'
  | 'agents'
  | 'content'
  | 'settings';

type AgentSubTab = 'overview' | 'logs' | 'kpi' | 'config';

type MemberPlan = 'pending' | 'free' | 'premium' | 'church';
type MemberStatus = 'active' | 'inactive' | 'pending';
type AgentStatus = 'active' | 'error' | 'paused';

interface Member {
  id: string;
  displayName: string;
  username: string;
  email: string;
  plan: MemberPlan;
  status: MemberStatus;
  streak: number;
  progress: number;
  joinedAt: string;
  lastActive: string;
}

interface AgentInfo {
  id: string;
  name: string;
  team: string;
  status: AgentStatus;
  successRate: number;
  tasksToday: number;
  lastRun: string;
  model: string;
  skills: string[];
  report: string[];
}

interface AgentLog {
  id: string;
  agentName: string;
  action: string;
  status: 'success' | 'error' | 'skipped';
  time: string;
  detail: string;
}

// ============================================
// 사이드바 네비게이션
// ============================================

const NAV_ITEMS: { key: AdminSection; label: string; icon: string; badge?: number }[] = [
  { key: 'dashboard', label: '대시보드', icon: '&#128202;' },
  { key: 'approval', label: '가입 승인', icon: '&#9203;', badge: 3 },
  { key: 'members', label: '회원 관리', icon: '&#128101;' },
  { key: 'plans', label: '플랜 관리', icon: '&#128142;' },
  { key: 'agents', label: '에이전트', icon: '&#129302;' },
  { key: 'content', label: '콘텐츠·수익', icon: '&#128176;' },
  { key: 'settings', label: '플랫폼 설정', icon: '&#9881;' },
];

// ============================================
// 더미 데이터
// ============================================

const MOCK_MEMBERS: Member[] = [
  { id: '1', displayName: '김은혜', username: 'grace_kim', email: 'grace@test.com', plan: 'premium', status: 'active', streak: 45, progress: 68, joinedAt: '2026-01-15', lastActive: '10분 전' },
  { id: '2', displayName: '박민수', username: 'minsu_p', email: 'minsu@test.com', plan: 'free', status: 'active', streak: 12, progress: 35, joinedAt: '2026-02-01', lastActive: '1시간 전' },
  { id: '3', displayName: '이수진', username: 'sujin_lee', email: 'sujin@test.com', plan: 'church', status: 'active', streak: 90, progress: 82, joinedAt: '2025-12-01', lastActive: '30분 전' },
  { id: '4', displayName: '정현우', username: 'hw_jung', email: 'hw@test.com', plan: 'free', status: 'active', streak: 8, progress: 22, joinedAt: '2026-03-01', lastActive: '3시간 전' },
  { id: '5', displayName: '최미연', username: 'miyeon_c', email: 'miyeon@test.com', plan: 'free', status: 'inactive', streak: 0, progress: 5, joinedAt: '2026-03-10', lastActive: '7일 전' },
  { id: '6', displayName: '한지원', username: 'jiwon_h', email: 'jiwon@test.com', plan: 'pending', status: 'pending', streak: 0, progress: 0, joinedAt: '2026-03-25', lastActive: '-' },
  { id: '7', displayName: '송다은', username: 'daeun_s', email: 'daeun@test.com', plan: 'pending', status: 'pending', streak: 0, progress: 0, joinedAt: '2026-03-26', lastActive: '-' },
  { id: '8', displayName: '오민재', username: 'minjae_oh', email: 'minjae@test.com', plan: 'pending', status: 'pending', streak: 0, progress: 0, joinedAt: '2026-03-27', lastActive: '-' },
];

const MOCK_AGENTS: AgentInfo[] = [
  {
    id: 'pm', name: 'PM Agent', team: 'A. 플랫폼 개발', status: 'active', successRate: 98, tasksToday: 12, lastRun: '5분 전', model: 'claude-sonnet-4-6',
    skills: ['스프린트 기획 및 태스크 분배', '5개 팀/16개 에이전트 간 작업 흐름 조율', '우선순위 결정 및 병목 감지', '인간 관리자와의 소통 창구'],
    report: ['Sprint #14 백로그 정리 완료 (23개 태스크 분배)', 'Dev/QA 에이전트 간 PR 리뷰 병목 해소 → 평균 리뷰 시간 4시간→1시간', 'Phase 1 마일스톤 진행률 78% (예정 대비 +3%)', '다음 스프린트 허브링크 페이지 고도화 우선순위 확정'],
  },
  {
    id: 'dev', name: 'Dev Agent', team: 'A. 플랫폼 개발', status: 'active', successRate: 95, tasksToday: 28, lastRun: '2분 전', model: 'claude-sonnet-4-6',
    skills: ['풀스택 코드 작성 및 기능 구현', 'PR 리뷰 및 버그 수정', '테스트 작성 및 CI/CD 파이프라인 관리', 'Next.js/NestJS 기반 개발'],
    report: ['어드민 패널 페이지 신규 생성 (7개 섹션, 16개 에이전트 모니터링)', '매니저 대시보드 Hub_Link 스타일로 재구성 완료', '인증 스토어(useAuthStore) + 로그인/회원가입 페이지 구현', 'TypeScript strict mode 타입 에러 0건 유지 중'],
  },
  {
    id: 'qa', name: 'QA Agent', team: 'A. 플랫폼 개발', status: 'active', successRate: 100, tasksToday: 8, lastRun: '15분 전', model: 'claude-haiku-4-5',
    skills: ['자동화 테스트 수행 및 버그 발견', '성능 모니터링 및 접근성 검사', '오디오 품질 검증', '사용자 피드백 분석'],
    report: ['매니저 대시보드 리팩토링 후 회귀 테스트 8건 통과', '메뉴 ON/OFF 토글 상태별 테스트 시나리오 5건 작성', 'Lighthouse 점수: Performance 92 / A11y 98 / SEO 100', '모바일 반응형 테스트 (375px~768px) 이상 없음'],
  },
  {
    id: 'ux', name: 'UX Agent', team: 'A. 플랫폼 개발', status: 'paused', successRate: 92, tasksToday: 0, lastRun: '2시간 전', model: 'claude-sonnet-4-6',
    skills: ['UI/UX 컴포넌트 설계', '모바일 우선 설계 원칙 적용', '디자인 시스템 관리', '프로토타입 제작 및 커스터마이징'],
    report: ['허브링크형 페이지 디자인 시안 3종 제작 완료', '8가지 프리셋 테마 컬러 팔레트 확정', '소셜 버튼(좋아요/응원/팔로우) 인터랙션 디자인', '일시정지: Phase 2 함께읽기 UX 설계 대기 중'],
  },
  {
    id: 'tts', name: 'TTS Agent', team: 'B. 콘텐츠 제작', status: 'active', successRate: 97, tasksToday: 156, lastRun: '1분 전', model: 'claude-haiku-4-5',
    skills: ['성경 66권 고품질 TTS 오디오 제작', '4개 언어 병렬 처리 자동화', '오디오 품질 관리 (노이즈, 발음)', 'CDN 배포 및 캐싱'],
    report: ['한국어 TTS: 42/66권 완료 (오늘 창세기~레위기 3권 추가)', '영어 ESV TTS: 28/66권 완료 (마태복음~사도행전)', '10 병렬 워커 가동 중, 평균 처리 시간 챕터당 18초', '오디오 품질 자동 검증 통과율 97.3%'],
  },
  {
    id: 'english', name: 'English Agent', team: 'B. 콘텐츠 제작', status: 'active', successRate: 94, tasksToday: 34, lastRun: '10분 전', model: 'claude-sonnet-4-6',
    skills: ['영어 성경 데이터 관리', '영한 병렬 데이터 정리', '단어 학습 카드 생성', '발음 가이드 및 번역 품질 관리'],
    report: ['영한 병렬 데이터 신약 27권 정리 완료', '단어 학습 카드 340장 생성 (요한복음 기반)', '번갈아읽기 모드 텍스트 싱크 정확도 96.2%', 'CEFR B1 수준 어휘 목록 1,200단어 정리'],
  },
  {
    id: 'meditation', name: 'Meditation Agent', team: 'B. 콘텐츠 제작', status: 'active', successRate: 96, tasksToday: 18, lastRun: '8분 전', model: 'claude-sonnet-4-6',
    skills: ['매일의 묵상 가이드 생성', '성경 본문 해설 작성', '핵심 구절 카드 디자인', '간증 카드 템플릿 제작'],
    report: ['3월 묵상 가이드 31일분 생성 완료', '은혜태그 자동 분류 정확도 94.8%', '오늘의 말씀 카드 디자인 4종 추가', '묵상 자동 요약(generateMeditationSummary) 품질 개선'],
  },
  {
    id: 'i18n', name: 'i18n Agent', team: 'B. 콘텐츠 제작', status: 'paused', successRate: 89, tasksToday: 0, lastRun: '1일 전', model: 'claude-haiku-4-5',
    skills: ['UI/메시지 5개국어 번역 (한/영/중/일/스페인어)', '묵상 가이드 다국어 번역', '푸시알림 및 에러 메시지 번역', '로컬라이제이션 품질 관리'],
    report: ['영어 UI 번역 98% 완료 (124/127 키)', '일본어/중국어 번역은 Phase 4 대기 중', '번역 키 네이밍 컨벤션 가이드 문서 작성', '일시정지: Phase 4 글로벌 확장 시 재가동 예정'],
  },
  {
    id: 'music', name: 'Music Agent', team: 'C. 수익화·창작', status: 'active', successRate: 88, tasksToday: 5, lastRun: '30분 전', model: 'claude-opus-4-6',
    skills: ['AI 기반 찬양/묵상 음악 자동 생성', 'EL MUSIC 음원 메타데이터 관리', '음원 유통 플랫폼 자동 배포 (DistroKid)', '수익 정산 및 관리 (70/30 분배)'],
    report: ['EL MUSIC 트랙 24곡 제작 완료, 12곡 배포 중', '시편 23편 기반 찬양 Spotify/Apple Music 등록', 'Suno API 활용 트랙 생성 성공률 88%', '이번 달 음원 수익 ₩8,500 (누적 ₩42,000)'],
  },
  {
    id: 'video', name: 'Video Agent', team: 'C. 수익화·창작', status: 'error', successRate: 72, tasksToday: 2, lastRun: '45분 전', model: 'claude-opus-4-6',
    skills: ['AI 영상 생성 (숏폼/롱폼)', 'YouTube/TikTok/Instagram 자동 배포', '썸네일 자동 생성', '동영상 콘텐츠 유통 및 수익화'],
    report: ['RunwayML API 타임아웃 오류 발생 (45분 전)', '묵상 영상 8편 YouTube 게시 완료 (총 조회수 1,240)', '숏폼 영상 자동 생성 파이프라인 구축 중', '오류 원인: API Rate Limit 초과 → 재시도 로직 추가 필요'],
  },
  {
    id: 'growth', name: 'Growth Agent', team: 'C. 수익화·창작', status: 'active', successRate: 91, tasksToday: 7, lastRun: '20분 전', model: 'claude-sonnet-4-6',
    skills: ['사용자 획득 전략 및 자동화', '푸시알림 캠페인 관리', 'A/B 테스트 설계 및 실행', '리텐션/바이럴 전략 수립'],
    report: ['A/B 테스트: 온보딩 Variant B +12% 전환율 → 적용 확정', '허브링크 페이지 공유율 28% (목표 30% 근접)', '아침 8시 푸시알림 CTR 34% (최고 성과 시간대)', '이탈 위험 사용자 15명 대상 리인게이지먼트 캠페인 발송'],
  },
  {
    id: 'ops', name: 'Ops Agent', team: 'D. 운영·법무', status: 'active', successRate: 99, tasksToday: 42, lastRun: '30초 전', model: 'claude-haiku-4-5',
    skills: ['AWS 기반 서버 인프라 관리', 'CI/CD 파이프라인 구축 및 운영', '모니터링/알림 시스템 운영', '보안 관리 및 백업/복구'],
    report: ['서버 헬스체크 정상: CPU 42%, Memory 68%, Disk 31%', 'Vercel 프론트엔드 배포 14회 성공 (오늘)', 'AWS ECS 백엔드 오토스케일링 정상 작동', 'SSL 인증서 갱신 완료 (만료일: 2026-09-15)'],
  },
  {
    id: 'legal', name: 'Legal Agent', team: 'D. 운영·법무', status: 'active', successRate: 100, tasksToday: 3, lastRun: '1시간 전', model: 'claude-sonnet-4-6',
    skills: ['성경 번역본 저작권 관리', 'AI 생성 콘텐츠 법적 검토', '개인정보보호법(PIPA) 준수', '이용약관 및 보증금 법률 검토'],
    report: ['개역개정 저작권 사용 허가 확인 (대한성서공회)', 'EL MUSIC AI 생성물 저작권 가이드라인 작성 완료', '보증금 챌린지 약관 법률 검토 완료 (전자상거래법 준수)', '공개 페이지 개인정보 노출 범위 가이드 문서 배포'],
  },
  {
    id: 'data', name: 'Data Agent', team: 'D. 운영·법무', status: 'active', successRate: 96, tasksToday: 15, lastRun: '5분 전', model: 'claude-sonnet-4-6',
    skills: ['KPI 대시보드 구축 및 운영', '사용자 행동 분석 및 코호트 분석', '수익 분석 및 통계', 'A/B 테스트 분석 및 데이터 파이프라인'],
    report: ['DAU 1,247 / MAU 3,892 (DAU/MAU 비율 32%)', '7일 리텐션 76.4% (전주 대비 +2.1%)', '메뉴 ON/OFF 효과 분석: 링크모음 OFF 시 읽기 시간 +18%', '코호트 분석: 1월 가입자 30일 리텐션 68% (최고 성과)'],
  },
  {
    id: 'page', name: 'Page Agent', team: 'E. 개인페이지', status: 'active', successRate: 93, tasksToday: 9, lastRun: '12분 전', model: 'claude-haiku-4-5',
    skills: ['사용자 개인 페이지 커스터마이징', '위젯 기반 페이지 빌더 관리', '테마 시스템 운영', 'hunlink 연동 및 프로필 페이지 빌드'],
    report: ['허브링크 페이지 템플릿 8종 제작 완료', '테마 프리셋 적용 사용자 67% (light 42%, midnight 18%)', '페이지 로딩 속도 최적화: 평균 1.2초 → 0.8초', '프로필 사진 리사이징 자동화 (WebP 변환, 50KB 이하)'],
  },
  {
    id: 'recommend', name: 'Recommend Agent', team: 'E. 개인페이지', status: 'active', successRate: 90, tasksToday: 22, lastRun: '3분 전', model: 'claude-sonnet-4-6',
    skills: ['개인화 읽기 순서 추천', '묵상 구절 추천 알고리즘', '함께읽기 그룹 매칭', '사용자 학습 경로 개인화'],
    report: ['오늘 맞춤 구절 추천 22건 발송 (클릭률 41%)', '신규 사용자 온보딩 플랜 추천 정확도 87%', '함께읽기 그룹 매칭 3건 성사 (커플 1, 소그룹 2)', '추천 알고리즘 v2 배포: 읽기 이력 기반 협업 필터링 적용'],
  },
];

const MOCK_LOGS: AgentLog[] = [
  { id: '1', agentName: 'TTS Agent', action: '창세기 1-3장 TTS 생성', status: 'success', time: '14:32', detail: '3개 챕터 완료 (2분 12초)' },
  { id: '2', agentName: 'Dev Agent', action: 'PR #42 코드 리뷰', status: 'success', time: '14:28', detail: '3개 파일 리뷰, 1개 수정 제안' },
  { id: '3', agentName: 'Video Agent', action: '묵상 영상 렌더링', status: 'error', time: '14:15', detail: 'RunwayML API 타임아웃' },
  { id: '4', agentName: 'Ops Agent', action: '서버 헬스체크', status: 'success', time: '14:10', detail: 'CPU 42%, Memory 68%' },
  { id: '5', agentName: 'Data Agent', action: 'KPI 리포트 생성', status: 'success', time: '14:05', detail: 'DAU 1,247 / MAU 3,892' },
  { id: '6', agentName: 'Music Agent', action: 'EL MUSIC 트랙 생성', status: 'success', time: '13:55', detail: '시편 23편 기반 찬양' },
  { id: '7', agentName: 'i18n Agent', action: 'UI 번역 (일본어)', status: 'skipped', time: '13:40', detail: 'Phase 4 대기 중' },
  { id: '8', agentName: 'Growth Agent', action: 'A/B 테스트 분석', status: 'success', time: '13:30', detail: 'Variant B +12% 전환율' },
];

// ============================================
// 어드민 로그인 상태
// ============================================

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // MVP: 하드코딩된 비밀번호
    if (password === 'lazybible2026!' || password === 'admin') {
      onLogin();
    } else {
      setError('비밀번호가 올바르지 않습니다');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">&#128737;</div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-400">게을러도성경일독 관리자</p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="관리자 비밀번호"
          className="mb-4 w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-400"
        >
          로그인
        </button>
      </div>
    </div>
  );
}

// ============================================
// 메인 어드민 대시보드
// ============================================

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentSubTab, setAgentSubTab] = useState<AgentSubTab>('overview');

  // 회원 관리 상태
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<MemberPlan | 'all'>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 에이전트 상태
  const [agents, setAgents] = useState<AgentInfo[]>(MOCK_AGENTS);
  const [skillModal, setSkillModal] = useState<AgentInfo | null>(null);
  const [reportModal, setReportModal] = useState<AgentInfo | null>(null);

  if (!isAuth) {
    return <AdminLogin onLogin={() => setIsAuth(true)} />;
  }

  // 필터링된 회원
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.displayName.includes(searchQuery) ||
      m.username.includes(searchQuery) ||
      m.email.includes(searchQuery);
    const matchPlan = planFilter === 'all' || m.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const pendingMembers = members.filter((m) => m.plan === 'pending');
  const activeMembers = members.filter((m) => m.status === 'active');

  const handleApprove = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, plan: 'free' as MemberPlan, status: 'active' as MemberStatus } : m))
    );
  };

  const handleReject = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleChangePlan = (id: string, plan: MemberPlan) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, plan } : m)));
  };

  const handleToggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'paused' ? 'active' as AgentStatus : 'paused' as AgentStatus }
          : a
      )
    );
  };

  const planCounts = {
    pending: members.filter((m) => m.plan === 'pending').length,
    free: members.filter((m) => m.plan === 'free').length,
    premium: members.filter((m) => m.plan === 'premium').length,
    church: members.filter((m) => m.plan === 'church').length,
  };

  const agentsByTeam = MOCK_AGENTS.reduce<Record<string, AgentInfo[]>>((acc, a) => {
    (acc[a.team] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 모바일 햄버거 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-slate-900 transition-transform lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-slate-700 p-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#128214;</span>
            <h1 className="text-lg font-bold text-white">게을러도성경일독</h1>
          </div>
          <span className="mt-1 inline-block rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setSidebarOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                activeSection === item.key
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="text-base" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.key === 'approval' ? pendingMembers.length : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-3">
          <button
            onClick={() => setIsAuth(false)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-red-400"
          >
            <span>&#8618;</span>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto p-4 pt-16 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">

          {/* ========== 대시보드 ========== */}
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">대시보드</h2>

              {/* 통계 카드 */}
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: '전체 회원', value: members.length, icon: '&#128101;', color: 'blue' },
                  { label: '활성 사용자', value: activeMembers.length, icon: '&#9989;', color: 'green' },
                  { label: '승인 대기', value: pendingMembers.length, icon: '&#9203;', color: 'amber' },
                  { label: '오늘 가입', value: 1, icon: '&#127381;', color: 'purple' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-2xl" dangerouslySetInnerHTML={{ __html: stat.icon }} />
                      <span className={cn(
                        'text-3xl font-bold',
                        stat.color === 'blue' && 'text-blue-600',
                        stat.color === 'green' && 'text-green-600',
                        stat.color === 'amber' && 'text-amber-600',
                        stat.color === 'purple' && 'text-purple-600',
                      )}>
                        {stat.value}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* KPI 요약 */}
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: '평균 완독률', value: '44%', sub: 'KPI 70%', trend: '+3%' },
                  { label: 'DAU/MAU', value: '58%', sub: 'KPI 60%', trend: '+5%' },
                  { label: '7일 리텐션', value: '76%', sub: 'KPI 80%', trend: '+2%' },
                  { label: '평균 스트릭', value: '18일', sub: 'KPI 21일', trend: '+1일' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="text-sm text-slate-500">{kpi.label}</div>
                    <div className="mt-1 text-2xl font-bold text-slate-800">{kpi.value}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-400">{kpi.sub}</span>
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">{kpi.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 플랜 분포 + 에이전트 상태 */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">플랜 분포</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Free', count: planCounts.free, color: 'bg-slate-400', total: members.length },
                      { label: 'Premium', count: planCounts.premium, color: 'bg-blue-500', total: members.length },
                      { label: 'Church SaaS', count: planCounts.church, color: 'bg-purple-500', total: members.length },
                      { label: '승인 대기', count: planCounts.pending, color: 'bg-amber-400', total: members.length },
                    ].map((p) => (
                      <div key={p.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-600">{p.label}</span>
                          <span className="font-medium">{p.count}명</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn('h-full rounded-full transition-all', p.color)}
                            style={{ width: `${p.total > 0 ? (p.count / p.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">에이전트 상태</h3>
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-green-50 p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{agents.filter((a) => a.status === 'active').length}</div>
                      <div className="text-xs text-green-700">활성</div>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{agents.filter((a) => a.status === 'paused').length}</div>
                      <div className="text-xs text-amber-700">일시정지</div>
                    </div>
                    <div className="rounded-xl bg-red-50 p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">{agents.filter((a) => a.status === 'error').length}</div>
                      <div className="text-xs text-red-700">오류</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {MOCK_LOGS.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
                        <span className={cn(
                          'h-2 w-2 rounded-full',
                          log.status === 'success' && 'bg-green-500',
                          log.status === 'error' && 'bg-red-500',
                          log.status === 'skipped' && 'bg-slate-400',
                        )} />
                        <span className="flex-1 truncate text-xs text-slate-600">{log.agentName}: {log.action}</span>
                        <span className="text-xs text-slate-400">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 최근 가입 */}
              <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-700">최근 가입 회원</h3>
                <div className="space-y-2">
                  {members.slice(-5).reverse().map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {m.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{m.displayName}</div>
                          <div className="text-xs text-slate-400">@{m.username} &middot; {m.joinedAt}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        m.plan === 'pending' && 'bg-amber-100 text-amber-700',
                        m.plan === 'free' && 'bg-slate-100 text-slate-600',
                        m.plan === 'premium' && 'bg-blue-100 text-blue-700',
                        m.plan === 'church' && 'bg-purple-100 text-purple-700',
                      )}>
                        {m.plan === 'pending' ? '대기' : m.plan === 'free' ? 'Free' : m.plan === 'premium' ? 'Premium' : 'Church'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== 가입 승인 ========== */}
          {activeSection === 'approval' && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-slate-800">가입 승인</h2>
              <p className="mb-6 text-sm text-slate-500">승인 대기 중인 회원을 관리합니다</p>

              {pendingMembers.length === 0 ? (
                <div className="rounded-2xl border bg-white py-16 text-center shadow-sm">
                  <div className="mb-2 text-4xl">&#10003;</div>
                  <p className="text-sm text-slate-500">승인 대기 중인 회원이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingMembers.map((m) => (
                    <div key={m.id} className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-lg font-bold text-amber-800">
                            {m.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{m.displayName}</div>
                            <div className="text-sm text-slate-500">@{m.username} &middot; {m.email}</div>
                            <div className="text-xs text-slate-400">가입 요청: {m.joinedAt}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(m.id)}
                            className="rounded-xl bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-400"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(m.id)}
                            className="rounded-xl bg-red-100 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== 회원 관리 ========== */}
          {activeSection === 'members' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">회원 관리</h2>

              {/* 검색 & 필터 */}
              <div className="mb-6 flex flex-wrap gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름, 사용자명, 이메일 검색..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as MemberPlan | 'all')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">전체 플랜</option>
                  <option value="pending">승인 대기</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="church">Church SaaS</option>
                </select>
              </div>

              {/* 회원 테이블 */}
              <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="px-4 py-3 font-semibold text-slate-600">회원</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">이메일</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">플랜</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">진도</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">스트릭</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">마지막 활동</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white',
                              m.status === 'active' ? 'bg-blue-500' : m.status === 'pending' ? 'bg-amber-400' : 'bg-slate-400'
                            )}>
                              {m.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{m.displayName}</div>
                              <div className="text-xs text-slate-400">@{m.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{m.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            m.plan === 'pending' && 'bg-amber-100 text-amber-700',
                            m.plan === 'free' && 'bg-slate-100 text-slate-600',
                            m.plan === 'premium' && 'bg-blue-100 text-blue-700',
                            m.plan === 'church' && 'bg-purple-100 text-purple-700',
                          )}>
                            {m.plan === 'pending' ? '대기' : m.plan === 'free' ? 'Free' : m.plan === 'premium' ? 'Premium' : 'Church'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${m.progress}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{m.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{m.streak}일</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{m.lastActive}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingMember(m)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500"
                              title="편집"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(m.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              title="삭제"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-slate-400">{filteredMembers.length}명 표시 / 전체 {members.length}명</div>
            </div>
          )}

          {/* ========== 플랜 관리 ========== */}
          {activeSection === 'plans' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">플랜 관리</h2>

              {/* 플랜별 통계 */}
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: '승인 대기', icon: '&#9203;', count: planCounts.pending, price: '-', color: 'amber' },
                  { label: 'Free', icon: '&#127381;', count: planCounts.free, price: '무료', color: 'slate' },
                  { label: 'Premium', icon: '&#11088;', count: planCounts.premium, price: '&#8361;4,900/월', color: 'blue' },
                  { label: 'Church SaaS', icon: '&#9962;', count: planCounts.church, price: '&#8361;49,000/월', color: 'purple' },
                ].map((plan) => (
                  <button
                    key={plan.label}
                    onClick={() => {
                      const planKey = plan.label === '승인 대기' ? 'pending' : plan.label === 'Free' ? 'free' : plan.label === 'Premium' ? 'premium' : 'church';
                      setPlanFilter(planKey as MemberPlan);
                      setActiveSection('members');
                    }}
                    className={cn(
                      'rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md',
                      plan.color === 'amber' && 'border-amber-200 hover:border-amber-300',
                      plan.color === 'slate' && 'border-slate-200 hover:border-slate-300',
                      plan.color === 'blue' && 'border-blue-200 hover:border-blue-300',
                      plan.color === 'purple' && 'border-purple-200 hover:border-purple-300',
                    )}
                  >
                    <span className="text-2xl" dangerouslySetInnerHTML={{ __html: plan.icon }} />
                    <div className="mt-2 text-2xl font-bold text-slate-800">{plan.count}명</div>
                    <div className="text-sm font-medium text-slate-600">{plan.label}</div>
                    <div className="text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: plan.price }} />
                  </button>
                ))}
              </div>

              {/* 플랜 변경 테이블 */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-700">회원 플랜 변경</h3>
                <div className="space-y-3">
                  {members.filter((m) => m.plan !== 'pending').map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {m.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{m.displayName}</div>
                          <div className="text-xs text-slate-400">@{m.username}</div>
                        </div>
                      </div>
                      <select
                        value={m.plan}
                        onChange={(e) => handleChangePlan(m.id, e.target.value as MemberPlan)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none',
                          m.plan === 'free' && 'border-slate-200 bg-slate-50',
                          m.plan === 'premium' && 'border-blue-200 bg-blue-50 text-blue-700',
                          m.plan === 'church' && 'border-purple-200 bg-purple-50 text-purple-700',
                        )}
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="church">Church SaaS</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수익 요약 */}
              <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-700">월 예상 수익</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-slate-500">Premium</div>
                    <div className="text-xl font-bold text-blue-600">&#8361;{(planCounts.premium * 4900).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{planCounts.premium}명 &times; &#8361;4,900</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Church SaaS</div>
                    <div className="text-xl font-bold text-purple-600">&#8361;{(planCounts.church * 49000).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{planCounts.church}명 &times; &#8361;49,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">합계</div>
                    <div className="text-xl font-bold text-slate-800">&#8361;{(planCounts.premium * 4900 + planCounts.church * 49000).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">월 정기 수익</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== 에이전트 ========== */}
          {activeSection === 'agents' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">에이전트 관리</h2>

              {/* 서브탭 */}
              <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                {[
                  { key: 'overview' as AgentSubTab, label: '개요' },
                  { key: 'logs' as AgentSubTab, label: '로그' },
                  { key: 'kpi' as AgentSubTab, label: 'KPI' },
                  { key: 'config' as AgentSubTab, label: '설정' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setAgentSubTab(tab.key)}
                    className={cn(
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                      agentSubTab === tab.key
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 에이전트 개요 */}
              {agentSubTab === 'overview' && (
                <div className="space-y-6">
                  {Object.entries(agentsByTeam).map(([team, teamAgents]) => (
                    <div key={team}>
                      <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">{team}</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {teamAgents.map((agent) => (
                          <div key={agent.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-700">{agent.name}</span>
                              <span className={cn(
                                'h-2.5 w-2.5 rounded-full',
                                agent.status === 'active' && 'bg-green-500',
                                agent.status === 'paused' && 'bg-amber-400',
                                agent.status === 'error' && 'bg-red-500',
                              )} />
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">성공률</span>
                                <span className={cn('font-medium', agent.successRate >= 95 ? 'text-green-600' : agent.successRate >= 85 ? 'text-amber-600' : 'text-red-600')}>
                                  {agent.successRate}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    agent.successRate >= 95 ? 'bg-green-500' : agent.successRate >= 85 ? 'bg-amber-400' : 'bg-red-500'
                                  )}
                                  style={{ width: `${agent.successRate}%` }}
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">오늘 태스크</span>
                                <span className="font-medium text-slate-600">{agent.tasksToday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">마지막 실행</span>
                                <span className="text-slate-500">{agent.lastRun}</span>
                              </div>
                            </div>
                            {/* Skill / Report 버튼 */}
                            <div className="mt-3 flex gap-2 border-t pt-3">
                              <button
                                onClick={() => setSkillModal(agent)}
                                className="flex-1 rounded-lg bg-indigo-50 py-1.5 text-[11px] font-semibold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95"
                              >
                                Skill
                              </button>
                              <button
                                onClick={() => setReportModal(agent)}
                                className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100 active:scale-95"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 에이전트 로그 */}
              {agentSubTab === 'logs' && (
                <div className="rounded-2xl border bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left">
                        <th className="px-4 py-3 font-semibold text-slate-600">시간</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">에이전트</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">작업</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">상태</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">상세</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_LOGS.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500">{log.time}</td>
                          <td className="px-4 py-3 font-medium">{log.agentName}</td>
                          <td className="px-4 py-3">{log.action}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              log.status === 'success' && 'bg-green-100 text-green-700',
                              log.status === 'error' && 'bg-red-100 text-red-700',
                              log.status === 'skipped' && 'bg-slate-100 text-slate-500',
                            )}>
                              {log.status === 'success' ? '성공' : log.status === 'error' ? '오류' : '건너뜀'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{log.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* KPI */}
              {agentSubTab === 'kpi' && (
                <div className="space-y-6">
                  {/* 성공률 차트 (CSS 바 차트) */}
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-700">에이전트별 성공률</h3>
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <div key={agent.id} className="flex items-center gap-3">
                          <span className="w-32 truncate text-xs text-slate-600">{agent.name}</span>
                          <div className="flex-1 h-4 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                agent.successRate >= 95 ? 'bg-green-500' : agent.successRate >= 85 ? 'bg-amber-400' : 'bg-red-500'
                              )}
                              style={{ width: `${agent.successRate}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium text-slate-600">{agent.successRate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 오늘 태스크 차트 */}
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-700">오늘 태스크 수</h3>
                    <div className="flex items-end gap-2" style={{ height: 160 }}>
                      {agents.map((agent) => {
                        const maxTasks = Math.max(...agents.map((a) => a.tasksToday), 1);
                        return (
                          <div key={agent.id} className="flex flex-1 flex-col items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-600">{agent.tasksToday}</span>
                            <div
                              className={cn(
                                'w-full rounded-t',
                                agent.status === 'active' ? 'bg-blue-400' : agent.status === 'error' ? 'bg-red-400' : 'bg-slate-300'
                              )}
                              style={{ height: `${(agent.tasksToday / maxTasks) * 120}px`, minHeight: agent.tasksToday > 0 ? 4 : 0 }}
                            />
                            <span className="w-full truncate text-center text-[8px] text-slate-400">
                              {agent.name.replace(' Agent', '')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* API 비용 */}
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-700">Claude API 비용</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl bg-slate-50 p-4 text-center">
                        <div className="text-xs text-slate-500">오늘</div>
                        <div className="text-lg font-bold text-slate-800">$12.40</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 text-center">
                        <div className="text-xs text-slate-500">이번 주</div>
                        <div className="text-lg font-bold text-slate-800">$68.50</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 text-center">
                        <div className="text-xs text-slate-500">이번 달</div>
                        <div className="text-lg font-bold text-slate-800">$245.80</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        { model: 'claude-haiku-4-5', calls: 1240, cost: '$18.60' },
                        { model: 'claude-sonnet-4-6', calls: 580, cost: '$145.00' },
                        { model: 'claude-opus-4-6', calls: 42, cost: '$82.20' },
                      ].map((m) => (
                        <div key={m.model} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-slate-500">{m.model}</span>
                          <span className="text-slate-400">{m.calls} calls</span>
                          <span className="font-medium text-slate-700">{m.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 에이전트 설정 */}
              {agentSubTab === 'config' && (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'h-3 w-3 rounded-full',
                            agent.status === 'active' && 'bg-green-500',
                            agent.status === 'paused' && 'bg-amber-400',
                            agent.status === 'error' && 'bg-red-500',
                          )} />
                          <div>
                            <div className="font-semibold text-slate-700">{agent.name}</div>
                            <div className="text-xs text-slate-400">{agent.team}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">{agent.model}</span>
                          <button
                            onClick={() => handleToggleAgent(agent.id)}
                            className={cn(
                              'relative h-6 w-11 rounded-full transition-all',
                              agent.status !== 'paused' ? 'bg-green-500' : 'bg-slate-300'
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                                agent.status !== 'paused' ? 'left-[22px]' : 'left-0.5'
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== 콘텐츠·수익 ========== */}
          {activeSection === 'content' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">콘텐츠 &middot; 수익</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* TTS 진행 현황 */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">TTS 오디오 제작</h3>
                  <div className="space-y-3">
                    {[
                      { lang: '한국어', done: 42, total: 66 },
                      { lang: '영어 (ESV)', done: 28, total: 66 },
                      { lang: '중국어', done: 0, total: 66 },
                      { lang: '일본어', done: 0, total: 66 },
                    ].map((tts) => (
                      <div key={tts.lang}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-600">{tts.lang}</span>
                          <span className="font-medium text-slate-700">{tts.done}/{tts.total}권</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(tts.done / tts.total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EL MUSIC */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">EL MUSIC</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">24</div>
                      <div className="text-xs text-blue-700">제작 완료 트랙</div>
                    </div>
                    <div className="rounded-xl bg-green-50 p-3 text-center">
                      <div className="text-xl font-bold text-green-600">12</div>
                      <div className="text-xs text-green-700">배포 완료</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { title: '시편 23편 - 목자의 노래', status: '배포', plays: 342 },
                      { title: '시편 91편 - 은밀한 곳', status: '배포', plays: 218 },
                      { title: '로마서 8장 - 정죄없는 삶', status: '제작중', plays: 0 },
                    ].map((track) => (
                      <div key={track.title} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                        <div>
                          <div className="text-xs font-medium">{track.title}</div>
                          {track.plays > 0 && <div className="text-[10px] text-slate-400">{track.plays}회 재생</div>}
                        </div>
                        <span className={cn(
                          'rounded px-2 py-0.5 text-[10px] font-medium',
                          track.status === '배포' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {track.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 묵상 영상 */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">묵상 영상</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-purple-50 p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">8</div>
                      <div className="text-xs text-purple-700">YouTube 게시</div>
                    </div>
                    <div className="rounded-xl bg-indigo-50 p-3 text-center">
                      <div className="text-xl font-bold text-indigo-600">1,240</div>
                      <div className="text-xs text-indigo-700">총 조회수</div>
                    </div>
                  </div>
                </div>

                {/* 수익 현황 */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">수익 현황 (이번 달)</h3>
                  <div className="space-y-3">
                    {[
                      { source: 'Premium 구독', amount: planCounts.premium * 4900 },
                      { source: 'Church SaaS', amount: planCounts.church * 49000 },
                      { source: '보증금 챌린지 수수료', amount: 45000 },
                      { source: 'YouTube 광고', amount: 12000 },
                      { source: 'EL MUSIC 수익', amount: 8500 },
                    ].map((rev) => (
                      <div key={rev.source} className="flex justify-between text-sm">
                        <span className="text-slate-600">{rev.source}</span>
                        <span className="font-medium text-slate-800">&#8361;{rev.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between text-sm font-bold">
                      <span>합계</span>
                      <span className="text-blue-600">
                        &#8361;{(planCounts.premium * 4900 + planCounts.church * 49000 + 45000 + 12000 + 8500).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== 플랫폼 설정 ========== */}
          {activeSection === 'settings' && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-800">플랫폼 설정</h2>

              <div className="space-y-6">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">서비스 정보</h3>
                  <div className="space-y-3">
                    {[
                      { label: '서비스명', value: '게을러도성경일독' },
                      { label: '도메인', value: 'lazybible.com' },
                      { label: 'Frontend', value: 'Next.js 15 + Vercel' },
                      { label: 'Backend', value: 'NestJS + AWS ECS' },
                      { label: 'Database', value: 'PostgreSQL (Supabase)' },
                      { label: 'Auth', value: 'Supabase Auth' },
                      { label: 'Cache', value: 'Redis' },
                      { label: 'TTS', value: 'ElevenLabs / Azure Speech' },
                      { label: 'AI', value: 'Claude API (Anthropic)' },
                    ].map((info) => (
                      <div key={info.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                        <span className="text-sm text-slate-500">{info.label}</span>
                        <span className="text-sm font-medium text-slate-700">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-700">관리자 비밀번호 변경</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="현재 비밀번호"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="새 비밀번호"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <button className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
                      변경
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="mb-2 font-semibold text-red-800">위험 영역</h3>
                  <p className="mb-4 text-sm text-red-600">아래 작업은 되돌릴 수 없습니다</p>
                  <div className="flex gap-3">
                    <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                      캐시 초기화
                    </button>
                    <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                      전체 데이터 내보내기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========== 회원 편집 모달 ========== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800">회원 정보 편집</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">이름</label>
                <input
                  type="text"
                  defaultValue={editingMember.displayName}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">사용자명</label>
                <input
                  type="text"
                  defaultValue={editingMember.username}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">이메일</label>
                <input
                  type="email"
                  defaultValue={editingMember.email}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">플랜</label>
                <select
                  defaultValue={editingMember.plan}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="church">Church SaaS</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white hover:bg-blue-400"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 삭제 확인 모달 ========== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mb-4 text-4xl">&#9888;</div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">회원 삭제</h3>
            <p className="mb-6 text-sm text-slate-500">
              이 회원의 모든 데이터가 삭제됩니다.<br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteMember(showDeleteConfirm)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-400"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Skill 모달 ========== */}
      {skillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSkillModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white',
                skillModal.status === 'active' ? 'bg-indigo-500' : skillModal.status === 'error' ? 'bg-red-500' : 'bg-slate-400'
              )}>
                {skillModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{skillModal.name}</h3>
                <p className="text-xs text-slate-400">{skillModal.team}</p>
              </div>
            </div>

            <div className="mb-2 text-sm font-semibold text-indigo-700">Skills</div>
            <div className="space-y-2">
              {skillModal.skills.map((skill, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl bg-indigo-50 px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-700">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700">{skill}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
              <span className="font-mono">{skillModal.model}</span>
              <span>&middot;</span>
              <span className={cn(
                skillModal.status === 'active' && 'text-green-600',
                skillModal.status === 'paused' && 'text-amber-600',
                skillModal.status === 'error' && 'text-red-600',
              )}>
                {skillModal.status === 'active' ? '활성' : skillModal.status === 'paused' ? '일시정지' : '오류'}
              </span>
            </div>

            <button
              onClick={() => setSkillModal(null)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ========== Report 모달 ========== */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReportModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white',
                reportModal.status === 'active' ? 'bg-emerald-500' : reportModal.status === 'error' ? 'bg-red-500' : 'bg-slate-400'
              )}>
                {reportModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{reportModal.name}</h3>
                <p className="text-xs text-slate-400">{reportModal.team} &middot; 오늘 {reportModal.tasksToday}건 수행</p>
              </div>
            </div>

            <div className="mb-2 text-sm font-semibold text-emerald-700">Report</div>
            <div className="space-y-2">
              {reportModal.report.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="mt-0.5 text-emerald-500">&#10003;</span>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
              <span>성공률: <span className={cn('font-medium', reportModal.successRate >= 95 ? 'text-green-600' : reportModal.successRate >= 85 ? 'text-amber-600' : 'text-red-600')}>{reportModal.successRate}%</span></span>
              <span>마지막 실행: {reportModal.lastRun}</span>
            </div>

            <button
              onClick={() => setReportModal(null)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
