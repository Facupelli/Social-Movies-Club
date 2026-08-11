import 'server-only';

import { getUserRecommendations } from './get-user-recommendations.pg';
import type {
  RecommendationCursor,
  UserRecommendationsPage,
} from './recommendations.types';

/** Application service shared by Server Components and the Route Handler. */
export async function loadUserRecommendationsPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: RecommendationCursor | null;
}): Promise<UserRecommendationsPage> {
  return await getUserRecommendations({ userId, cursor });
}
