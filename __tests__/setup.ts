/**
 * Vitest 테스트 설정
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup();
});
