import type { PersistedRating } from './rating.pg';

export async function dispatchRatingToQueue(
  rating: Pick<PersistedRating, 'id' | 'user_id'>
): Promise<void> {
  const queueServiceUrl = process.env.QUEUE_SERVICE_URL;
  const response = await fetch(`${queueServiceUrl}/feed-item/process`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      userId: rating.user_id,
      ratingId: rating.id,
    }),
  });

  // biome-ignore lint/suspicious/noConsole: preserve queue dispatch diagnostics
  console.log(`Rating-Job posted to queue service: ${response.ok}`);
}
