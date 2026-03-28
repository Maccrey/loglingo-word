import type { FeedComment, LearningResultPost } from '@wordflow/shared/types';

const FEED_POSTS_KEY = 'social_feed_posts';
const FEED_COMMENTS_KEY = 'social_feed_comments';

function parseStoredValue<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStoredFeedPosts(): LearningResultPost[] {
  return parseStoredValue<LearningResultPost[]>(
    window.localStorage.getItem(FEED_POSTS_KEY),
    []
  ).sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function saveStoredFeedPosts(posts: LearningResultPost[]) {
  window.localStorage.setItem(FEED_POSTS_KEY, JSON.stringify(posts));
}

export function upsertStoredFeedPost(post: LearningResultPost) {
  const current = loadStoredFeedPosts();
  const next = [post, ...current.filter((item) => item.id !== post.id)].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  saveStoredFeedPosts(next);
  return next;
}

export function loadStoredFeedComments(): FeedComment[] {
  return parseStoredValue<FeedComment[]>(
    window.localStorage.getItem(FEED_COMMENTS_KEY),
    []
  );
}

export function loadStoredFeedCommentsByPost(postId: string): FeedComment[] {
  return loadStoredFeedComments()
    .filter((comment) => comment.postId === postId)
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
}

export function saveStoredFeedComments(comments: FeedComment[]) {
  window.localStorage.setItem(FEED_COMMENTS_KEY, JSON.stringify(comments));
}

export function appendStoredFeedComment(comment: FeedComment) {
  const next = [...loadStoredFeedComments(), comment];
  saveStoredFeedComments(next);
  return next;
}
