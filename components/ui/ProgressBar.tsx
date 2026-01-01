/**
 * 프로그레스 바 컴포넌트
 */

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success';
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  size = 'md',
  color = 'primary',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-muted',
          {
            'h-1.5': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          }
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            {
              'bg-primary': color === 'primary',
              'bg-secondary': color === 'secondary',
              'bg-green-500': color === 'success',
            }
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          'font-medium text-muted-foreground',
          {
            'text-xs min-w-[32px]': size === 'sm',
            'text-sm min-w-[36px]': size === 'md',
            'text-base min-w-[40px]': size === 'lg',
          }
        )}>
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
