import { describe, expect, it } from 'vitest';

import {
  mapAppError,
  resolveAppErrorMessage
} from '../../apps/web/src/app/errors';

describe('app error mapping', () => {
  it('maps known error codes to user-facing messages', () => {
    expect(mapAppError('chat_failed')).toBe(
      'AI 채팅 요청 처리에 실패했습니다.'
    );
    expect(mapAppError('checkout_failed')).toBe(
      '체크아웃 세션 생성에 실패했습니다.'
    );
  });

  it('falls back to the default message for unknown errors', () => {
    expect(resolveAppErrorMessage(new Error('Something unexpected'))).toBe(
      '알 수 없는 오류가 발생했습니다.'
    );
  });
});
