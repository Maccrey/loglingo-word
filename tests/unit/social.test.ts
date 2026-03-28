import { describe, expect, it } from 'vitest';

import {
  buildLearningResultPostBody,
  createCatGrowthPost,
  createAutoLearningResultPost,
  createFeedComment,
  createLearningResultPost,
  createStudyComebackPost,
  createStudyMilestonePost
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

  it('creates milestone, comeback, and cat growth event posts', () => {
    const milestone = createStudyMilestonePost({
      id: 'milestone-1',
      userId: 'user-1',
      createdAt: '2026-03-26T00:00:00.000Z',
      completedCount: 12,
      earnedPoints: 120,
      streak: 6
    });
    const comeback = createStudyComebackPost({
      id: 'comeback-1',
      userId: 'user-1',
      createdAt: '2026-03-26T00:00:00.000Z',
      daysAway: 5,
      streak: 1
    });
    const growth = createCatGrowthPost({
      id: 'cat-growth-1',
      userId: 'user-1',
      catName: '로그링고',
      stage: 'adult',
      activeDays: 92,
      createdAt: '2026-03-26T00:00:00.000Z'
    });

    expect(milestone.type).toBe('study_milestone');
    expect(comeback.type).toBe('study_comeback');
    expect(growth.type).toBe('cat_growth');
    expect(growth.body).toContain('성묘');
  });

  it('creates validated feed comments', () => {
    const comment = createFeedComment({
      id: 'comment-1',
      postId: 'post-1',
      userId: 'user-1',
      userDisplayName: '학습자',
      body: '좋아요. 계속 해봐요.',
      createdAt: '2026-03-26T00:00:00.000Z'
    });

    expect(comment.postId).toBe('post-1');
    expect(comment.userDisplayName).toBe('학습자');
  });
});
