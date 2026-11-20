import 'server-only';

import { enrichTheatricalAvailability } from '@/modules/theatrical-availability/enrich-theatrical-availability.server';
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
  const page = await getUserRecommendations({ userId, cursor });
  return {
    ...page,
    items: await enrichTheatricalAvailability(userId, page.items),
  };
}
