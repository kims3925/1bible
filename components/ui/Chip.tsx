/**
 * 칩/태그 컴포넌트
 * 선택 가능한 태그 UI
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: 'sm' | 'md';
}

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected, size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-full border font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Selected state
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background hover:bg-muted',
          // Sizes
          {
            'min-h-[36px] px-3 text-sm': size === 'sm',
            'min-h-touch px-4 text-base': size === 'md',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip };
