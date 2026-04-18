/**
 * v6.0 콘텐츠 블록 시스템 스토어
 * 펼치기/접기 + 순서변경 + 공개/나만보기 + 활성/비활성
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentBlock, BlockType, BlockVisibility } from '@/types';

const DEFAULT_BLOCKS: ContentBlock[] = [
  { id: 'block-profile', userId: '', type: 'profile', title: '프로필', config: {}, sortOrder: 0, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-social', userId: '', type: 'social-buttons', title: '소셜 버튼', config: { like: true, cheer: true, follow: true, showCount: true }, sortOrder: 1, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-badges', userId: '', type: 'badges', title: '배지', config: {}, sortOrder: 2, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-namecard', userId: '', type: 'namecard', title: '명함', config: {}, sortOrder: 3, isExpanded: false, visibility: 'private', isActive: true },
  { id: 'block-bible', userId: '', type: 'bible-reading', title: '성경읽기', config: {}, sortOrder: 4, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-assessment', userId: '', type: 'assessment', title: '검사/체크리스트', config: {}, sortOrder: 5, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-together', userId: '', type: 'together', title: '함께읽기', config: {}, sortOrder: 6, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-internal', userId: '', type: 'internal-links', title: '내부 콘텐츠 링크', config: {}, sortOrder: 7, isExpanded: true, visibility: 'public', isActive: true },
  { id: 'block-external', userId: '', type: 'external-links', title: '외부 링크', config: {}, sortOrder: 8, isExpanded: true, visibility: 'public', isActive: true },
];

interface BlockState {
  blocks: ContentBlock[];

  // Block CRUD
  initBlocks: (userId: string) => void;
  addBlock: (block: Omit<ContentBlock, 'id' | 'sortOrder'>) => void;
  removeBlock: (id: string) => void;

  // Block 제어
  toggleExpanded: (id: string) => void;
  setVisibility: (id: string, visibility: BlockVisibility) => void;
  toggleActive: (id: string) => void;
  reorderBlocks: (blocks: ContentBlock[]) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  updateBlockConfig: (id: string, config: Record<string, unknown>) => void;

  // 필터링
  getPublicBlocks: () => ContentBlock[];
  getActiveBlocks: () => ContentBlock[];
}

export const useBlockStore = create<BlockState>()(
  persist(
    (set, get) => ({
      blocks: DEFAULT_BLOCKS,

      initBlocks: (userId) => {
        const { blocks } = get();
        if (blocks.every((b) => b.userId === '')) {
          set({ blocks: blocks.map((b) => ({ ...b, userId })) });
        }
      },

      addBlock: (block) => {
        const { blocks } = get();
        const newBlock: ContentBlock = {
          ...block,
          id: `block-${Date.now()}`,
          sortOrder: blocks.length,
        };
        set({ blocks: [...blocks, newBlock] });
      },

      removeBlock: (id) => {
        const { blocks } = get();
        set({
          blocks: blocks
            .filter((b) => b.id !== id)
            .map((b, i) => ({ ...b, sortOrder: i })),
        });
      },

      toggleExpanded: (id) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, isExpanded: !b.isExpanded } : b
          ),
        });
      },

      setVisibility: (id, visibility) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, visibility } : b
          ),
        });
      },

      toggleActive: (id) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, isActive: !b.isActive } : b
          ),
        });
      },

      reorderBlocks: (newBlocks) => {
        set({ blocks: newBlocks.map((b, i) => ({ ...b, sortOrder: i })) });
      },

      moveBlock: (id, direction) => {
        const { blocks } = get();
        const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
        const idx = sorted.findIndex((b) => b.id === id);
        if (idx < 0) return;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sorted.length) return;
        [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
        set({ blocks: sorted.map((b, i) => ({ ...b, sortOrder: i })) });
      },

      updateBlockConfig: (id, config) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, config: { ...b.config, ...config } } : b
          ),
        });
      },

      getPublicBlocks: () => {
        const { blocks } = get();
        return blocks
          .filter((b) => b.isActive && b.visibility === 'public')
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getActiveBlocks: () => {
        const { blocks } = get();
        return blocks
          .filter((b) => b.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },
    }),
    { name: 'lazy-bible-blocks' }
  )
);
