/**
 * 칩 그룹 컴포넌트
 * 여러 칩을 flexbox로 배치
 */

import { cn } from '@/lib/utils';
import { Chip } from './Chip';

interface ChipOption {
  id: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (id: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function ChipGroup({
  options,
  selected,
  onToggle,
  size = 'md',
  className,
}: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <Chip
          key={option.id}
          selected={selected.includes(option.id)}
          onClick={() => onToggle(option.id)}
          size={size}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
