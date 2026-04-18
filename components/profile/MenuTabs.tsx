/**
 * 3메뉴 탭 바 (Hub_Link frontTab 패턴 참조)
 * 성경읽기 / 링크모음 / 함께읽기
 */

'use client';

import { cn } from '@/lib/utils';
import type { MenuKey } from '@/types';

interface MenuTabsProps {
  activeMenu: MenuKey;
  onMenuChange: (menu: MenuKey) => void;
  visibleMenus?: Record<MenuKey, boolean>;
  accentColor?: string;
}

const MENU_CONFIG: { key: MenuKey; label: string; icon: string }[] = [
  { key: 'bible', label: '성경읽기', icon: '📖' },
  { key: 'links', label: '링크모음', icon: '🔗' },
  { key: 'together', label: '함께읽기', icon: '👥' },
];

export function MenuTabs({
  activeMenu,
  onMenuChange,
  visibleMenus = { bible: true, links: true, together: true },
  accentColor = '#2E75B6',
}: MenuTabsProps) {
  const visibleItems = MENU_CONFIG.filter((item) => visibleMenus[item.key]);

  return (
    <div className="flex rounded-2xl bg-slate-100 p-1">
      {visibleItems.map((item) => {
        const isActive = activeMenu === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onMenuChange(item.key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]',
              isActive
                ? 'text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            )}
            style={isActive ? { backgroundColor: accentColor } : {}}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
