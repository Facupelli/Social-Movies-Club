import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserService } from "@/users/user.service";
import type {
  GetUserRatingMovies,
  UserMoviesSortBy,
  UserMoviesSortOrder,
} from "@/users/user.types";

export type UseUserMoviesMap = Record<
  number,
  { isRated: boolean; score: number }
>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const routeParams = await params;

  const userService = new UserService();
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "0", 10);
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";

  const limit = 20;
  const offset = page * limit;

  const res: GetUserRatingMovies = await userService.getUserRatingMovies(
    routeParams.id,
    {
      limit,
      offset,
      dir: sortOrder as UserMoviesSortOrder,
      field: sortBy as UserMoviesSortBy,
    }
  );

  return Response.json(res);
}
