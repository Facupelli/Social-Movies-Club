import 'server-only';

import { findAnnualMovieCounts } from './annual-viewing-activity.pg';

export async function getAnnualViewingActivity(profileUserId: string) {
  const { months, year } = await findAnnualMovieCounts(profileUserId);
  const monthlyCounts = Array.from({ length: 12 }, () => 0);
  let total = 0;

  for (const { month, count } of months) {
    monthlyCounts[month - 1] = count;
    total += count;
  }

  return { monthlyCounts, total, year };
}
