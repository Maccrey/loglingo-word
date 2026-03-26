import { z } from 'zod';

import {
  createAssistantChatMessage,
  createCorrectionChatMessage,
  createUserChatMessage,
  type AIChatMessage
} from './chat';
import { parseCorrectionResponse } from './correction';
import { buildConversationPrompt, type ConversationUserLevel } from './prompt';

const aiChatMessageSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['user', 'assistant', 'correction']),
  message: z.string().min(1),
  corrected: z.string().min(1).optional(),
  feedback: z.string().min(1).optional(),
  createdAt: z.string().datetime()
});

export const aiChatRequestSchema = z.object({
  userId: z.string().min(1),
  nativeLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  message: z.string().min(1),
  createdAt: z.string().datetime(),
  recentMessages: z.array(aiChatMessageSchema).default([])
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;

export type AIChatCompletionResult = {
  assistantMessage: string;
  correctionRaw: string;
};

export type AIChatCompletionInput = {
  prompt: string;
  userMessage: string;
  nativeLanguage: string;
  targetLanguage: string;
  userLevel: ConversationUserLevel;
  recentMessages: AIChatMessage[];
};

export type AIChatCompletionClient = {
  complete(input: AIChatCompletionInput): Promise<AIChatCompletionResult>;
};

export type AIChatRepository = {
  saveMany(messages: AIChatMessage[]): Promise<AIChatMessage[]>;
  listByUserId(userId: string): Promise<AIChatMessage[]>;
};

export type AIChatMessageDocumentStore = {
  addMany(messages: AIChatMessage[]): Promise<void>;
  listByUserId(userId: string): Promise<AIChatMessage[]>;
};

export type AIChatSuccessResponse = {
  messages: AIChatMessage[];
  prompt: string;
};

function normalizeAIChatMessage(
  message: z.infer<typeof aiChatMessageSchema>
): AIChatMessage {
  return {
    userId: message.userId,
    role: message.role,
    message: message.message,
    createdAt: message.createdAt,
    ...(message.corrected ? { corrected: message.corrected } : {}),
    ...(message.feedback ? { feedback: message.feedback } : {})
  };
}

export async function handleAIChat(
  input: unknown,
  dependencies: {
    repository: AIChatRepository;
    client: AIChatCompletionClient;
  }
): Promise<AIChatSuccessResponse> {
  const request = aiChatRequestSchema.parse(input);
  const userMessage = createUserChatMessage({
    userId: request.userId,
    message: request.message,
    createdAt: request.createdAt
  });
  const normalizedRecentMessages = request.recentMessages.map(
    normalizeAIChatMessage
  );
  const conversation: AIChatMessage[] = [
    ...normalizedRecentMessages,
    userMessage
  ];
  const prompt = buildConversationPrompt({
    nativeLanguage: request.nativeLanguage,
    targetLanguage: request.targetLanguage,
    userLevel: request.userLevel,
    recentMessages: conversation
  });

  await dependencies.repository.saveMany([userMessage]);

  try {
    const completion = await dependencies.client.complete({
      prompt,
      userMessage: request.message,
      nativeLanguage: request.nativeLanguage,
      targetLanguage: request.targetLanguage,
      userLevel: request.userLevel,
      recentMessages: conversation
    });
    const correction = parseCorrectionResponse(completion.correctionRaw);
    const assistantMessage = createAssistantChatMessage({
      userId: request.userId,
      message: completion.assistantMessage,
      createdAt: request.createdAt
    });
    const correctionMessage = createCorrectionChatMessage({
      userId: request.userId,
      message: correction.corrected,
      corrected: correction.corrected,
      feedback: correction.feedback,
      createdAt: request.createdAt
    });

    const generatedMessages: AIChatMessage[] = [
      assistantMessage,
      correctionMessage
    ];

    await dependencies.repository.saveMany(generatedMessages);

    return {
      messages: [userMessage, ...generatedMessages],
      prompt
    };
  } catch {
    throw new Error('AI 채팅 응답 생성에 실패했습니다.');
  }
}

export class InMemoryAIChatRepository implements AIChatRepository {
  private readonly store = new Map<string, AIChatMessage[]>();

  async saveMany(messages: AIChatMessage[]): Promise<AIChatMessage[]> {
    for (const message of messages) {
      const current = this.store.get(message.userId) ?? [];
      this.store.set(message.userId, [...current, message]);
    }

    return messages;
  }

  async listByUserId(userId: string): Promise<AIChatMessage[]> {
    return this.store.get(userId) ?? [];
  }
}

export class FirestoreAIChatRepository implements AIChatRepository {
  constructor(private readonly store: AIChatMessageDocumentStore) {}

  async saveMany(messages: AIChatMessage[]): Promise<AIChatMessage[]> {
    await this.store.addMany(messages);
    return messages;
  }

  async listByUserId(userId: string): Promise<AIChatMessage[]> {
    return this.store.listByUserId(userId);
  }
}
