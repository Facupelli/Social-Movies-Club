'use client';

import { useSearchMovies } from '@/movies/hooks/use-search-movies';

export function HomeClient() {
  const { data, isPending, error } = useSearchMovies('Pulp Fiction');

  console.log({ data, error });

  if (isPending) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <div>
        <input placeholder="Pulp Fiction" type="search" />
      </div>
    </div>
  );
}
