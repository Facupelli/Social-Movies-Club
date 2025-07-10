'use client';

import { useQueryClient } from '@tanstack/react-query';
import { StarIcon } from 'lucide-react';
import { useActionState, useState } from 'react';
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
import { addRatingToMovie } from '@/movies/actions/add-rating';
import { useUser } from '@/users/hooks/use-user';
import { SubmitButton } from '../submit-button';
import { Button } from '../ui/button';

export function RateDialog({
  movieId,
  title,
  releaseDate,
}: {
  movieId: number;
  title: string;
  releaseDate: string;
}) {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const [state, action] = useActionState(addRatingToMovie, {
    success: false,
  });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const isMovieRated = user?.movies.map((movie) => movie.id).includes(movieId);

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">
        {isMovieRated ? <StarIcon className="fill-yellow-400" /> : <StarIcon />}
      </DialogTrigger>
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
          <input name="movieId" type="hidden" value={movieId} />

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
                      checked={rating === ratingValue}
                      className="sr-only"
                      name="rating"
                      onChange={() => setRating(ratingValue)}
                      type="radio"
                      value={ratingValue}
                    />
                    <StarIcon
                      className={`h-7 w-7 transition-colors duration-200 sm:h-8 sm:w-8 ${
                        ratingValue <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      } rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2 focus-within:ring-offset-white hover:text-yellow-300 dark:hover:text-yellow-500 dark:focus-within:ring-offset-gray-800`}
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

            <SubmitButton
              disabled={rating === 0}
              formAction={(formData) => {
                action(formData);
                queryClient.invalidateQueries({ queryKey: ['user'] });
              }}
              loadingText="Adding Rating..."
            >
              Submit Rating
            </SubmitButton>
          </DialogFooter>

          {!state.success && state.error && (
            <div className="flex justify-end pt-2">
              <p className="text-red-500">{state.error}</p>
            </div>
          )}
          {state.success && (
            <div className="flex justify-end pt-2">
              <p className="text-green-500">Rating added successfully!</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
