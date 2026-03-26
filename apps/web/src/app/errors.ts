export type AppErrorCode =
  | 'chat_failed'
  | 'checkout_failed'
  | 'webhook_invalid_signature'
  | 'unknown';

const errorMessages: Record<AppErrorCode, string> = {
  chat_failed: 'AI 채팅 요청 처리에 실패했습니다.',
  checkout_failed: '체크아웃 세션 생성에 실패했습니다.',
  webhook_invalid_signature: '결제 서명이 올바르지 않습니다.',
  unknown: '알 수 없는 오류가 발생했습니다.'
};

export function mapAppError(code: AppErrorCode): string {
  return errorMessages[code];
}

export function resolveAppErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'AI 채팅 응답 생성에 실패했습니다.') {
      return mapAppError('chat_failed');
    }

    if (error.message === 'Invalid webhook signature.') {
      return mapAppError('webhook_invalid_signature');
    }

    if (error.message === 'Unknown payment product.') {
      return mapAppError('checkout_failed');
    }
  }

  return mapAppError('unknown');
}
