/**
 * 인증 + 발행 상태 관리 스토어
 * Hub_Link SSO 통합 — Supabase Auth 기반
 * Hub_Link 패턴: 로그인 → 매니저 편집 → 발행 → 공개 페이지
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { UserLink, ProfileTheme } from '@/types';
import type { User, Session, Provider } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  theme: ProfileTheme;
  links: UserLink[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    blog?: string;
  };
  isPublished: boolean;
  publishedAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // Supabase Auth actions
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Profile sync
  syncProfile: (supabaseUser: User) => Promise<void>;

  // Profile edit actions
  updateProfile: (updates: Partial<Pick<AuthUser, 'displayName' | 'bio' | 'avatarUrl' | 'theme' | 'socialLinks'>>) => void;

  // Link actions
  addLink: (link: Omit<UserLink, 'id' | 'userId' | 'sortOrder'>) => void;
  updateLink: (id: string, updates: Partial<UserLink>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (links: UserLink[]) => void;

  // Publish action
  publish: () => string;
}

const DEFAULT_THEME: ProfileTheme = {
  bgColor: '#F8FAFC',
  cardColor: '#FFFFFF',
  textColor: '#1E293B',
  accentColor: '#2E75B6',
  buttonStyle: 'rounded',
  fontFamily: 'Pretendard',
  avatarShape: 'circle',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      supabaseUser: null,
      session: null,
      isLoggedIn: false,
      isLoading: false,

      signUpWithEmail: async (email, password, username) => {
        const supabase = createClient();
        set({ isLoading: true });

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: username,
              platform: 'bible',
            },
          },
        });

        if (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Hub_Link 패턴: 프론트에서 profiles upsert (트리거 독립)
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            username,
            display_name: username,
            plan: 'free',
            role: 'customer',
            platform: 'bible',
          }, { onConflict: 'id' });

          await get().syncProfile(data.user);
        }

        set({ isLoading: false });
        return { success: true };
      },

      signInWithEmail: async (email, password) => {
        const supabase = createClient();
        set({ isLoading: true });

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }

        if (data.user) {
          await get().syncProfile(data.user);
        }

        set({
          session: data.session,
          supabaseUser: data.user,
          isLoading: false,
        });

        return { success: true };
      },

      signInWithOAuth: async (provider) => {
        const supabase = createClient();

        // Supabase에서 지원하는 provider로 변환
        // 네이버는 커스텀 OIDC로 처리
        const redirectTo = `${window.location.origin}/auth/callback`;

        if (provider === 'naver' as Provider) {
          // 네이버는 Supabase Third-party Auth (OIDC) 사용
          // Supabase Dashboard에서 Naver OIDC provider 설정 필요
          await supabase.auth.signInWithOAuth({
            provider: 'naver' as Provider,
            options: { redirectTo },
          });
        } else {
          await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo },
          });
        }
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({
          user: null,
          supabaseUser: null,
          session: null,
          isLoggedIn: false,
        });
      },

      refreshSession: async () => {
        const supabase = createClient();
        set({ isLoading: true });

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await get().syncProfile(session.user);
          set({ session, supabaseUser: session.user, isLoading: false });
        } else {
          set({
            user: null,
            supabaseUser: null,
            session: null,
            isLoggedIn: false,
            isLoading: false,
          });
        }
      },

      syncProfile: async (supabaseUser: User) => {
        const supabase = createClient();

        // profiles 테이블에서 사용자 정보 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (profile) {
          const authUser: AuthUser = {
            id: profile.id,
            email: profile.email || supabaseUser.email || '',
            username: profile.username || '',
            displayName: profile.display_name || '',
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url || undefined,
            theme: profile.theme || { ...DEFAULT_THEME },
            links: [],
            socialLinks: profile.social_links || {},
            isPublished: true,
            publishedAt: profile.updated_at,
          };

          // links 가져오기
          const { data: links } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', supabaseUser.id)
            .order('sort_order');

          if (links) {
            authUser.links = links.map((l) => ({
              id: l.id,
              userId: l.user_id,
              label: l.title || '',
              url: l.url || '',
              icon: l.icon || '',
              type: (l.type === 'link' || l.type === 'sns' || l.type === 'internal') ? l.type : 'link' as const,
              isVisible: l.active !== false,
              sortOrder: l.sort_order || 0,
            }));
          }

          set({ user: authUser, isLoggedIn: true });
        } else {
          // profile이 없으면 기본값으로 생성
          const metadata = supabaseUser.user_metadata;
          const username = metadata?.username
            || metadata?.preferred_username
            || supabaseUser.email?.split('@')[0]
            || `user_${supabaseUser.id.slice(0, 8)}`;

          const authUser: AuthUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            username,
            displayName: metadata?.display_name || metadata?.full_name || username,
            bio: '',
            avatarUrl: metadata?.avatar_url || metadata?.picture || undefined,
            theme: { ...DEFAULT_THEME },
            links: [],
            socialLinks: {},
            isPublished: false,
          };

          set({ user: authUser, isLoggedIn: true });
        }
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      addLink: (link) => {
        const { user } = get();
        if (!user) return;
        const newLink: UserLink = {
          ...link,
          id: `link-${Date.now()}`,
          userId: user.id,
          sortOrder: user.links.length,
        };
        set({ user: { ...user, links: [...user.links, newLink] } });
      },

      updateLink: (id, updates) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            links: user.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
          },
        });
      },

      deleteLink: (id) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            links: user.links.filter((l) => l.id !== id).map((l, i) => ({ ...l, sortOrder: i })),
          },
        });
      },

      reorderLinks: (links) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, links } });
      },

      publish: () => {
        const { user } = get();
        if (!user) return '';
        set({
          user: { ...user, isPublished: true, publishedAt: new Date().toISOString() },
        });
        return `/u/${user.username}`;
      },
    }),
    {
      name: 'lazy-bible-auth',
      partialize: (state) => ({
        // Supabase 세션은 쿠키로 관리하므로 persist에서 제외
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
