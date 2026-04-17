import * as recRepo from '@/lib/repositories/recommendationsRepository';
import type { Recommendation } from '@/lib/types';

const VALID_FEEDBACK_TYPES = ['LIKE', 'DISLIKE', 'NOT_INTERESTED'] as const;
type FeedbackType = typeof VALID_FEEDBACK_TYPES[number];

export async function getRecommendations(): Promise<Recommendation[]> {
  return recRepo.getAllRecommendations();
}

export async function linkRuleToAlbum(
  rule_id: number,
  album_id: number
): Promise<{ id: number }> {
  if (!rule_id || !album_id) {
    throw new Error('rule_id and album_id are required');
  }
  return recRepo.createRecommendation(rule_id, album_id);
}

export async function submitFeedback(
  user_id: number,
  album_id: number,
  feedbackType: string,
  rule_id?: number | null
): Promise<void> {
  if (!album_id || !feedbackType) {
    throw new Error('albumId and feedbackType are required');
  }
  if (!VALID_FEEDBACK_TYPES.includes(feedbackType as FeedbackType)) {
    throw new Error(`feedbackType must be one of: ${VALID_FEEDBACK_TYPES.join(', ')}`);
  }
  await recRepo.recordFeedbackEvent(user_id, album_id, feedbackType, rule_id);
}

export async function getAnalytics(): Promise<object[]> {
  return recRepo.getAnalyticsAggregate();
}
