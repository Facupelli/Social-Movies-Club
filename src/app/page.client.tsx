'use client';

import { StarIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useDebounce from '@/movies/hooks/use-debounce';
import { useSearchMovies } from '@/movies/hooks/use-search-movies';

export function HomeClient() {
  const [query, setQuery] = useState('');
  const debouncedSearchTerm = useDebounce(query, 500);

  return (
    <div>
      <div>
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pulp Fiction"
          type="search"
        />
      </div>
      <MoviesList debouncedSearchTerm={debouncedSearchTerm} />
    </div>
  );
}

function MoviesList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
  const {
    data: movies,
    isLoading,
    error,
  } = useSearchMovies(debouncedSearchTerm);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error {JSON.stringify(error)}</p>;
  }

  return (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
      {movies?.data?.map((movie) => (
        <div key={movie.id}>
          <div>
            {movie.posterPath ? (
              <Image
                alt={movie.title}
                className="h-auto w-[200px]"
                height={350}
                src={`https://image.tmdb.org/t/p/original${movie.posterPath}`}
                unoptimized
                width={200}
              />
            ) : (
              <div className="h-[350px] w-[200px] bg-gray-600" />
            )}
          </div>
          <div className="pt-2">
            <p>{movie.title}</p>
            <p className="text-gray-600 text-sm">{movie.releaseDate}</p>
          </div>
          <div className="flex gap-2">
            <button type="button">Add to watch list</button>
            <RateDialog releaseDate={movie.releaseDate} title={movie.title} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RateDialog({
  title,
  releaseDate,
}: {
  title: string;
  releaseDate: string;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <Dialog>
      <DialogTrigger>Rate</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rating {title}{' '}
            <span className="text-neutral-500 text-sm">{releaseDate}</span>
          </DialogTitle>
          <DialogDescription>
            After rating this movie it will be added to your personal list.
          </DialogDescription>
        </DialogHeader>

        <form className="pt-2">
          <p className="sr-only">
            Use the number keys 1 through 10 to select a rating.
          </p>

          <fieldset className="mb-6">
            <legend className="sr-only">Rating</legend>
            <div
              className="flex items-center justify-center space-x-1 sm:space-x-2"
              onMouseLeave={() => setHoverRating(0)}
              role="radiogroup"
            >
              {[...Array(10)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  // biome-ignore lint: reason
                  <label
                    className="cursor-pointer"
                    key={ratingValue}
                    onMouseEnter={() => setHoverRating(ratingValue)}
                  >
                    <input
                      aria-label={`${ratingValue} out of 10`}
                      className="sr-only"
                      name="rating"
                      onClick={() => setRating(ratingValue)}
                      type="radio"
                      value={ratingValue}
                    />
                    <StarIcon
                      className={`h-7 w-7 transition-colors duration-200 sm:h-8 sm:w-8 ${
                        ratingValue <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }hover:text-yellow-300 rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:hover:text-yellow-500 dark:focus-within:ring-offset-gray-800 `}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter className="gap-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <Button disabled={rating === 0}>Submit Rating</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
