import { NextResponse } from 'next/server';

import {
  FirestoreUserProfileRepository,
  InMemoryUserProfileRepository,
  onboardingProfileInputSchema,
  saveOnboardingProfile
} from '@wordflow/core/profile';

import {
  createFirestoreUserProfileStore,
  hasFirebaseAdminConfig
} from '../../../lib/firebase-admin';

const userProfileRepository = hasFirebaseAdminConfig()
  ? new FirestoreUserProfileRepository(createFirestoreUserProfileStore())
  : new InMemoryUserProfileRepository();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = onboardingProfileInputSchema.parse(json);
    const result = await saveOnboardingProfile(input, userProfileRepository);

    return NextResponse.json(result, {
      status: result.operation === 'created' ? 201 : 200
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : '사용자 프로필 저장에 실패했습니다.'
      },
      {
        status: 400
      }
    );
  }
}
