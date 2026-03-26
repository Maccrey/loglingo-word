export type ChatMessageInput = {
  userId: string;
  message: string;
  createdAt: string;
};

export type AIChatMessageRole = 'user' | 'assistant' | 'correction';

export type AIChatMessage = {
  userId: string;
  role: AIChatMessageRole;
  message: string;
  corrected?: string;
  feedback?: string;
  createdAt: string;
};

export type CorrectionMessageInput = ChatMessageInput & {
  corrected?: string;
  feedback?: string;
};

export type CorrectionPayload = Pick<AIChatMessage, 'corrected' | 'feedback'>;

function validateChatMessage(message: AIChatMessage): AIChatMessage {
  if (!message.userId.trim()) {
    throw new Error('Chat message userId is required.');
  }

  if (!message.message.trim()) {
    throw new Error('Chat message text is required.');
  }

  if (Number.isNaN(Date.parse(message.createdAt))) {
    throw new Error('Chat message createdAt must be a valid ISO timestamp.');
  }

  return message;
}

export function createUserChatMessage(input: ChatMessageInput): AIChatMessage {
  return validateChatMessage({
    userId: input.userId,
    role: 'user',
    message: input.message,
    createdAt: input.createdAt
  });
}

export function createAssistantChatMessage(
  input: ChatMessageInput
): AIChatMessage {
  return validateChatMessage({
    userId: input.userId,
    role: 'assistant',
    message: input.message,
    createdAt: input.createdAt
  });
}

export function mapCorrectionPayload(
  input: CorrectionMessageInput
): CorrectionPayload {
  const payload: CorrectionPayload = {};

  if (input.corrected) {
    payload.corrected = input.corrected;
  }

  if (input.feedback) {
    payload.feedback = input.feedback;
  }

  return payload;
}

export function createCorrectionChatMessage(
  input: CorrectionMessageInput
): AIChatMessage {
  const payload = mapCorrectionPayload(input);

  return validateChatMessage({
    userId: input.userId,
    role: 'correction',
    message: input.message,
    ...payload,
    createdAt: input.createdAt
  });
}
