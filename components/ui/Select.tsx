/**
 * 셀렉트 컴포넌트
 * 드롭다운 선택 UI
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex min-h-touch w-full items-center rounded-xl border border-border bg-background px-4 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
