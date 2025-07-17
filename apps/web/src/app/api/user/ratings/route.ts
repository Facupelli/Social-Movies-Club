import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserService } from '@/users/user.service';
import type { GetUserRatingMovies } from '@/users/user.types';

export type UseUserMoviesMap = Record<
  number,
  { isRated: boolean; score: number }
>;

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' });
  }

  const userService = new UserService();

  const res: GetUserRatingMovies = await userService.getUserRatingMovies(
    session.user.id
  );

  const statusMap: UseUserMoviesMap = {};

  for (const result of res.data) {
    if (statusMap[result.tmdbId]) {
      continue;
    }

    statusMap[result.tmdbId] = {
      isRated: true,
      score: result.score,
    };
  }

  return Response.json(statusMap);
}
