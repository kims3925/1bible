/**
 * 클래스명 병합 유틸리티
 * Tailwind CSS 클래스 충돌 해결
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
