import { describe, expect, it } from 'vitest';

import {
  FirestoreUserProfileRepository,
  InMemoryUserProfileRepository,
  saveOnboardingProfile,
  toUserDocument,
  toUserRecord,
  type UserProfileDocumentStore,
  type UserProfileRecord,
  type UserProfileRepository
} from '../../services/core/src/profile';

const validInput = {
  id: 'user-1',
  nativeLanguage: 'ko',
  targetLanguage: 'en',
  goal: 'conversation' as const,
  startedAt: '2026-03-25T00:00:00.000Z'
};

describe('user profile storage', () => {
  it('maps a new onboarding payload to the users collection', () => {
    const record = toUserRecord(validInput);
    const document = toUserDocument(record);

    expect(document.collection).toBe('users');
    expect(document.id).toBe('user-1');
    expect(document.data.targetLanguage).toBe('en');
  });

  it('updates an existing user profile', async () => {
    const repository = new InMemoryUserProfileRepository();

    await saveOnboardingProfile(validInput, repository);

    const result = await saveOnboardingProfile(
      {
        ...validInput,
        targetLanguage: 'ja',
        startedAt: '2026-03-26T00:00:00.000Z'
      },
      repository
    );

    expect(result.operation).toBe('updated');
    expect(result.profile.targetLanguage).toBe('ja');
    expect(result.profile.createdAt).toBe('2026-03-25T00:00:00.000Z');
    expect(result.profile.updatedAt).toBe('2026-03-26T00:00:00.000Z');
  });

  it('surfaces repository failures', async () => {
    const failingRepository: UserProfileRepository = {
      async findById() {
        return null;
      },
      async save() {
        throw new Error('Firestore unavailable');
      }
    };

    await expect(
      saveOnboardingProfile(validInput, failingRepository)
    ).rejects.toThrow('Firestore unavailable');
  });

  it('persists profiles through the firestore-backed repository adapter', async () => {
    const documents = new Map<string, UserProfileRecord>();
    const store: UserProfileDocumentStore = {
      async get(collection, id) {
        return documents.get(`${collection}:${id}`) ?? null;
      },
      async set(collection, id, data) {
        documents.set(`${collection}:${id}`, data);
      }
    };
    const repository = new FirestoreUserProfileRepository(store);

    const result = await saveOnboardingProfile(validInput, repository);

    expect(result.operation).toBe('created');
    expect(documents.get('users:user-1')).toMatchObject({
      id: 'user-1',
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      goal: 'conversation'
    });
  });
});
