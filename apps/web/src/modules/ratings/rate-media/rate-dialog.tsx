'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Film,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import {
  type MediaType,
  MediaTypeDict,
} from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getUserRatingsQueryOptions } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { addRatingToMovie } from '@/modules/ratings/rate-media/add-rating';
import type { RateMediaResult } from '@/modules/ratings/rate-media/rate-media';
import { authClient } from '@/platform/auth/auth-client';
import {
  invalidateAfterRating,
  optimisticallyRateMedia,
  removeRatedMediaFromWatchlistStatus,
} from '@/modules/ratings/rate-media/rating-mutation-cache';
import { SubmitButton } from '@/shared/components/submit-button';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer';
import { cn } from '@/shared/utilities/utils';

const initialState: ApiResponse<RateMediaResult> = {
  success: false,
  error: '',
};

function getLocalTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatWatchedDate(date: string): string {
  if (!date) {
    return 'Elegí una fecha';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(`${date}T00:00:00`))
    .replaceAll('.', '');
}

type UserRating = {
  isRated: boolean;
  score: number;
  watchedDate: string;
};

type RateDialogProps = {
  tmdbId: number;
  title: string;
  type: MediaType;
  year: string;
  posterPath: string;
};

export function RateDialog({
  tmdbId,
  title,
  type,
  year,
  posterPath,
}: RateDialogProps) {
  const isMobile = useIsMobile();
  const { data: session } = authClient.useSession();
  const { data: userRatings } = useQuery(
    getUserRatingsQueryOptions(session?.user.id)
  );
  const [open, setOpen] = useState(false);

  const userRating = userRatings?.[getMediaIdentityKey(tmdbId, type)];

  const trigger = (
    <Button className="w-full bg-transparent" size="sm" variant="outline">
      <Star className={cn(userRating?.isRated && 'fill-yellow-400')} />
      <span className="sr-only">
        {userRating?.isRated ? 'Editar puntuación' : 'Puntuar'} {title}
      </span>
    </Button>
  );

  const content = open ? (
    <RateDialogBody
      isMobile={isMobile}
      onClose={() => setOpen(false)}
      posterPath={posterPath}
      title={title}
      tmdbId={tmdbId}
      type={type}
      userId={session?.user.id}
      userRating={userRating}
      year={year}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>

        <DrawerContent
          aria-describedby={undefined}
          className="max-h-[94dvh] overflow-hidden rounded-t-[28px] border-white/15 bg-[linear-gradient(145deg,rgba(28,33,39,0.99),rgba(19,24,29,0.99))] text-white shadow-[0_-24px_80px_rgba(0,0,0,0.65)] [&>div:first-child]:mt-3 [&>div:first-child]:h-1.5 [&>div:first-child]:w-16 [&>div:first-child]:bg-white/20"
        >
          <DrawerTitle className="sr-only">Puntuar {title}</DrawerTitle>

          <div className="overflow-y-auto px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="max-h-[95dvh] w-[95vw] max-w-[620px] gap-0 overflow-x-hidden overflow-y-auto rounded-[22px] border-white/15 bg-[linear-gradient(145deg,rgba(28,33,39,0.99),rgba(19,24,29,0.99))] p-7 text-white shadow-[0_32px_100px_rgba(0,0,0,0.7)] sm:max-w-[620px]"
        overlayClassName="bg-black/80 backdrop-blur-[3px]"
      >
        <DialogTitle className="sr-only">Puntuar {title}</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}

type RateDialogBodyProps = {
  tmdbId: number;
  title: string;
  type: MediaType;
  year: string;
  posterPath: string;
  isMobile: boolean;
  onClose: () => void;
  userId?: string;
  userRating?: UserRating;
};

function RateDialogBody({
  tmdbId,
  title,
  type,
  year,
  posterPath,
  isMobile,
  onClose,
  userId,
  userRating,
}: RateDialogBodyProps) {
  const queryClient = useQueryClient();
  const hasInteracted = useRef(false);

  const [rating, setRating] = useState(userRating?.score ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [watchedDate, setWatchedDate] = useState(
    userRating?.watchedDate ?? getLocalTodayDate()
  );

  useEffect(() => {
    if (userRating && !hasInteracted.current) {
      setRating(userRating.score);
      setWatchedDate(userRating.watchedDate);
    }
  }, [userRating]);

  const handleAddRatingToMovie = async (
    _state: ApiResponse<RateMediaResult>,
    formData: FormData
  ) => {
    const rollback = userId
      ? await optimisticallyRateMedia(queryClient, {
          userId,
          tmdbId,
          type,
          score: rating,
          watchedDate,
        })
      : undefined;

    try {
      const result = await addRatingToMovie(formData);

      if (!result.success) {
        rollback?.();
        return result;
      }

      if (userId) {
        if (result.data.removedFromWatchlist) {
          removeRatedMediaFromWatchlistStatus(
            queryClient,
            userId,
            result.data.tmdbId,
            result.data.type
          );
        }
        await invalidateAfterRating(queryClient, userId);
      }

      return result;
    } catch (error) {
      rollback?.();
      throw error;
    }
  };

  const [state, action, isPending] = useActionState(
    handleAddRatingToMovie,
    initialState
  );

  if (state.success) {
    return (
      <RatingSuccessView onClose={onClose} rating={rating} userId={userId} />
    );
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[82px_minmax(0,1fr)] gap-4',
          isMobile
            ? 'grid-cols-[96px_minmax(0,1fr)] gap-5 pr-9'
            : 'grid-cols-[112px_minmax(0,1fr)] gap-6'
        )}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xs border border-white/15 bg-white/5">
          {posterPath ? (
            <Image
              alt={`Póster de ${title}`}
              className="object-cover"
              fill
              sizes={isMobile ? '96px' : '112px'}
              src={`https://image.tmdb.org/t/p/w342${posterPath}`}
              unoptimized
            />
          ) : (
            <div className="grid size-full place-items-center text-white/30">
              <Film className="size-8" />
            </div>
          )}
        </div>

        <div className="min-w-0 pt-0.5">
          <div className="space-y-1 text-left">
            <h2 className="line-clamp-2 text-xl leading-tight tracking-[-0.025em] sm:text-2xl">
              {title}
            </h2>

            <p className="text-sm text-white/50">
              {MediaTypeDict[type]} · {year}
            </p>
          </div>

          <div className="mt-7">
            <p className="text-sm text-white/55">Tu puntuación</p>

            <div
              aria-live="polite"
              className="mt-1 flex items-baseline tracking-[-0.04em]"
            >
              <span className="font-semibold text-[38px] leading-none text-violet-500 sm:text-[42px]">
                {rating}
              </span>

              <span className="text-[25px] leading-none text-violet-400">
                /10
              </span>
            </div>
          </div>
        </div>
      </div>

      <form action={action} className={cn(isMobile ? 'mt-7' : 'mt-6')}>
        <input name="movieTMDBId" type="hidden" value={tmdbId} />
        <input name="type" type="hidden" value={type} />

        <fieldset>
          <legend className="sr-only">Puntuación</legend>

          <div
            className={cn('grid grid-cols-10', isMobile ? 'gap-1.5' : 'gap-2')}
            onMouseLeave={() => setHoverRating(0)}
            role="radiogroup"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map(
              (ratingValue) => {
                const activeRating = hoverRating || rating;
                const isSelected = rating === ratingValue;
                const isFilled = ratingValue <= activeRating;

                return (
                  <label
                    className="group relative grid min-w-0 cursor-pointer place-items-center"
                    key={ratingValue}
                    onMouseEnter={() => setHoverRating(ratingValue)}
                  >
                    <input
                      aria-label={`${ratingValue} de 10`}
                      checked={isSelected}
                      className="peer sr-only"
                      name="rating"
                      onChange={() => {
                        hasInteracted.current = true;
                        setRating(ratingValue);
                      }}
                      type="radio"
                      value={ratingValue}
                    />

                    <span
                      className={cn(
                        'grid aspect-square w-full place-items-center border font-medium transition-[background-color,border-color,box-shadow,transform] duration-150 group-hover:scale-105 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#171c21]',
                        isMobile
                          ? 'max-w-10 rounded-xl text-sm'
                          : 'max-w-10 rounded-full text-sm',
                        isFilled
                          ? 'border-violet-500/70 bg-violet-500/20 text-white'
                          : 'border-white/20 bg-white/[0.015] text-white/80',
                        isSelected &&
                          'border-violet-500 bg-violet-500/30 shadow-[0_0_0_2px_rgba(139,92,246,0.3),0_0_18px_rgba(124,58,237,0.22)]'
                      )}
                    >
                      {ratingValue}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        </fieldset>

        <div
          className={cn(
            'border-white/10 border-t',
            isMobile ? 'mt-7 pt-6' : 'mt-6 pt-5'
          )}
        >
          <div
            className={cn(
              'flex gap-2',
              isMobile ? 'flex-col' : 'flex-row items-center gap-5'
            )}
          >
            <label
              className={cn(
                'text-white/65',
                isMobile
                  ? 'text-base'
                  : 'flex shrink-0 items-center gap-3 text-sm'
              )}
              htmlFor={`watched-date-${tmdbId}-${type}`}
            >
              La viste el
            </label>

            <div
              className={cn(
                'relative flex items-center justify-between border border-white/15 bg-white/[0.025] px-4 text-white transition-colors hover:border-white/25 h-10 w-[190px] rounded-full text-sm',
                isMobile && 'w-full'
              )}
            >
              <span className="flex min-w-0 items-center gap-3 truncate">
                {isMobile && (
                  <CalendarDays className="size-5 shrink-0 text-violet-400" />
                )}
                <span className="truncate">
                  {formatWatchedDate(watchedDate)}
                </span>
              </span>

              {isMobile ? (
                <ChevronDown className="ml-3 size-4 shrink-0 text-white/45" />
              ) : (
                <CalendarDays className="ml-3 size-4 shrink-0 text-violet-400" />
              )}

              <input
                aria-label="Fecha en que la viste"
                className={cn(
                  'absolute inset-0 size-full cursor-pointer opacity-0',
                  userRating?.isRated && 'cursor-default'
                )}
                id={`watched-date-${tmdbId}-${type}`}
                max={getLocalTodayDate()}
                name="watchedDate"
                onChange={(event) => {
                  hasInteracted.current = true;
                  setWatchedDate(event.target.value);
                }}
                readOnly={userRating?.isRated}
                required
                type="date"
                value={watchedDate}
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'mt-6 gap-3',
            isMobile
              ? 'grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]'
              : 'flex justify-end'
          )}
        >
          <Button
            className={cn(
              'rounded-full border-white/20 bg-transparent px-5 text-sm text-white hover:bg-white/[0.07] hover:text-white',
              isMobile ? 'h-12 w-full' : 'h-10 w-auto'
            )}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>

          <SubmitButton
            className={cn(
              'rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-sm shadow-[0_8px_24px_rgba(124,58,237,0.28)] hover:from-violet-500 hover:to-violet-400',
              isMobile ? 'h-12 w-full' : 'h-10 w-auto min-w-[180px]'
            )}
            disabled={rating === 0 || isPending}
            loadingText="Guardando"
          >
            Guardar puntuación
          </SubmitButton>
        </div>

        {state.error && (
          <p className="mt-4 text-center text-sm text-red-400 sm:text-right">
            {state.error === 'Unauthorized'
              ? 'Debes iniciar sesión para puntuar'
              : state.error}
          </p>
        )}
      </form>
    </>
  );
}

type RatingSuccessViewProps = {
  rating: number;
  onClose: () => void;
  userId?: string;
};

function RatingSuccessView({
  rating,
  onClose,
  userId,
}: RatingSuccessViewProps) {
  return (
    <div className="grid gap-y-6 py-7 sm:py-9">
      <div className="grid place-items-center gap-y-3">
        <CircleCheck className="size-11 text-violet-400" />

        <div>
          <h2 className="text-center text-xl font-bold">
            ¡Calificación subida!
          </h2>

          <p className="mt-2 text-center text-sm text-white/55">
            ¡Gracias! Tu puntuación{' '}
            <span className="font-semibold text-base text-violet-400">
              {rating}/10
            </span>{' '}
            fue guardada.
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-xs gap-y-3">
        <Button
          className="rounded-full"
          onClick={onClose}
          type="button"
          variant="secondary"
        >
          Listo
        </Button>

        {userId && (
          <Link
            className="text-center text-sm text-white/50 hover:text-white hover:underline"
            href={`/profile/${userId}`}
          >
            Ver tus calificaciones
          </Link>
        )}
      </div>
    </div>
  );
}
