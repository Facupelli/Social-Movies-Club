import 'server-only';

import { getFollowSummary as getFollowSummaryRepository } from './follow-summary.pg';
import type { FollowSummary } from './follow-summary.types';

export async function getFollowSummary(
  profileUserId: string
): Promise<FollowSummary> {
  return await getFollowSummaryRepository(profileUserId);
}
