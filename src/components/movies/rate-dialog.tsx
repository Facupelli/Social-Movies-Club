'use client';

import { StarIcon } from 'lucide-react';
import { useState } from 'react';
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
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRateMovie = async () => {
    try {
      await addRatingToMovie(movieId, rating);
    } catch (error) {
      console.error('addRatingToMovie Error:', error);
    }
  };

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

            <Button disabled={rating === 0} formAction={handleRateMovie}>
              Submit Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
