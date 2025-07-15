import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { MovieView } from "@/components/movies/movie-card";
import { auth } from "@/lib/auth";
import { dbMovieToView } from "@/movies/movie.adapters";
import { UserService } from "@/users/user.service";
import { ProfileMoviesClientPage } from "./page.client";

export type SortBy = "score" | "createdAt";
export type SortOrder = "asc" | "desc";

const getProfileMovies = async (
  profileUserId: string,
  searchParams: { sortBy?: SortBy; sortOrder?: SortOrder }
) => {
  const userService = new UserService();

  const profileRatings = await userService.getUserRatingMovies(
    profileUserId,
    searchParams.sortBy,
    searchParams.sortOrder
  );

  const profileMovies: MovieView[] = profileRatings.map(dbMovieToView);
  return profileMovies;
};

export default async function UserProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sortBy?: SortBy; sortOrder?: SortOrder }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const params = await props.params;
  const searchParams = await props.searchParams;

  const profileMovies = await getProfileMovies(params.id, searchParams);

  return (
    <ProfileMoviesClientPage
      profileMovies={profileMovies}
      searchParams={searchParams}
    />
  );
}
