'use client';

import { MovieCard } from '@/components/movies/movie-card';
import type { UserViewModel } from '@/users/user.types';

export function ProfileClientPage({
  appUser,
}: {
  appUser: UserViewModel | null;
}) {
  return (
    <div className="flex-1 bg-neutral-300 py-10">
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {appUser?.movies?.map((movie) => (
          <MovieCard key={movie.id} movie={movie}>
            <MovieCard.Poster />
            <div className="pt-2">
              <MovieCard.Title />
              <MovieCard.ReleaseDate />
              <MovieCard.Rating />
            </div>
          </MovieCard>
        ))}
      </div>
    </div>
  );
}
