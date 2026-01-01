/**
 * 카드 컴포넌트
 * 콘텐츠 그룹핑용
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
  selected?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, clickable, selected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border bg-card p-4 shadow-sm transition-all',
          clickable && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
          selected && 'border-primary ring-2 ring-primary/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
