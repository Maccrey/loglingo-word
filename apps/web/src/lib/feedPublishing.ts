import type { FeedComment, LearningResultPost } from '@wordflow/shared/types';
import {
  hasFirebaseWebConfig,
  saveFirebaseFeedComment,
  saveFirebaseFeedPost
} from './firebase-client';
import {
  appendStoredFeedComment,
  upsertStoredFeedPost
} from './feedStorage';

export async function publishFeedPost(input: {
  post: LearningResultPost;
  syncRemote?: boolean;
}) {
  upsertStoredFeedPost(input.post);

  if (!input.syncRemote || !hasFirebaseWebConfig()) {
    return;
  }

  await saveFirebaseFeedPost(input.post);
}

export async function publishFeedComment(input: {
  comment: FeedComment;
  syncRemote?: boolean;
}) {
  appendStoredFeedComment(input.comment);

  if (!input.syncRemote || !hasFirebaseWebConfig()) {
    return;
  }

  await saveFirebaseFeedComment(input.comment);
}
