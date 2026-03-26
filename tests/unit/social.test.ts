import { describe, expect, it } from 'vitest';

import {
  buildLearningResultPostBody,
  createAutoLearningResultPost,
  createLearningResultPost
} from '../../services/core/src/social';

describe('learning result post model', () => {
  it('creates a post with the default feed state', () => {
    const post = createLearningResultPost({
      id: 'post-1',
      userId: 'user-1',
      body: '오늘은 공항에서 길 묻기 문장을 완성했어요.',
      earnedPoints: 18,
      streak: 4,
      createdAt: '2026-03-26T00:00:00.000Z'
    });

    expect(post).toMatchObject({
      id: 'post-1',
      userId: 'user-1',
      type: 'learning_result',
      likeCount: 0,
      shareCount: 0,
      likedByUser: false
    });
  });

  it('builds a rich post body from the study result', () => {
    expect(
      buildLearningResultPostBody({
        earnedPoints: 24,
        streak: 5,
        achievedSentence: 'I went to the airport early this morning.'
      })
    ).toContain('24포인트');
  });

  it('falls back to a shorter post body when data is limited', () => {
    const post = createAutoLearningResultPost({
      id: 'post-2',
      userId: 'user-1',
      createdAt: '2026-03-26T00:00:00.000Z'
    });

    expect(post.body).toBe('오늘도 학습을 이어가며 한 걸음 더 나아갔어요.');
    expect(post.earnedPoints).toBe(0);
    expect(post.streak).toBe(0);
  });
});
