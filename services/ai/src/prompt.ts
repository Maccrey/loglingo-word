import type { AIChatMessage } from './chat';

export type ConversationUserLevel = 'beginner' | 'intermediate' | 'advanced';

export type ConversationPromptInput = {
  nativeLanguage: string;
  targetLanguage: string;
  userLevel: ConversationUserLevel;
  recentMessages: AIChatMessage[];
};

function formatRecentMessages(messages: AIChatMessage[]): string {
  if (messages.length === 0) {
    return 'No recent conversation history.';
  }

  return messages
    .map((message) => `[${message.role}] ${message.message}`)
    .join('\n');
}

export function buildConversationPrompt(
  input: ConversationPromptInput
): string {
  return [
    'You are a language tutoring assistant.',
    `Native language: ${input.nativeLanguage}`,
    `Target language: ${input.targetLanguage}`,
    `Learner level: ${input.userLevel}`,
    `Reply primarily in ${input.targetLanguage} and keep explanations accessible for a ${input.userLevel} learner.`,
    `Use ${input.nativeLanguage} only when a short clarification helps the learner understand a correction.`,
    'When needed, provide correction data in JSON fields named "corrected" and "feedback".',
    'Recent conversation:',
    formatRecentMessages(input.recentMessages)
  ].join('\n');
}
