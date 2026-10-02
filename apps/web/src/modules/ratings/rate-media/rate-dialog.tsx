'use client';

import { useQuery } from '@tanstack/react-query';
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
  type MediaKind,
  MediaKindDict,
} from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getUserRatingsQueryOptions } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { RatingInput } from '@/modules/ratings/rate-media/rating-input';
import { useRateMediaMutation } from '@/modules/ratings/rate-media/use-rate-media-mutation';
import type {
  RateMediaResult,
  RatingPublicationMode,
} from '@/modules/ratings/rating-mutation.types';
import { authClient } from '@/platform/auth/auth-client';
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
    return 'Sin fecha';
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
  watchedDate: string | null;
};

export type InitialRating = {
  score: number;
  watchedDate: string | null;
} | null;

type RateDialogProps = {
  tmdbId: number;
  title: string;
  kind: MediaKind;
  year: string;
  posterPath: string;
  publicationMode: RatingPublicationMode;
  recommendationCache: 'invalidate' | 'preserve';
  initialRating?: InitialRating;
  onRatingSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerClassName?: string;
};

export function RateDialog({
  tmdbId,
  title,
  kind,
  year,
  posterPath,
  publicationMode,
  recommendationCache,
  initialRating,
  onRatingSaved,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
  triggerClassName,
}: RateDialogProps) {
  const isMobile = useIsMobile();
  const { data: session } = authClient.useSession();
  const { data: userRatings } = useQuery(
    getUserRatingsQueryOptions(session?.user.id)
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const cachedRating = userRatings?.[getMediaIdentityKey(tmdbId, kind)];
  const userRating =
    cachedRating ??
    (initialRating
      ? {
          isRated: true,
          score: initialRating.score,
          watchedDate: initialRating.watchedDate,
        }
      : undefined);

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const trigger = (
    <Button
      className={cn('w-full bg-transparent', triggerClassName)}
      size="sm"
      variant="outline"
    >
      <Star className={cn(userRating?.isRated && 'fill-yellow-400')} />
      <span className="sr-only">
        {userRating?.isRated ? 'Editar puntuación' : 'Puntuar'} {title}
      </span>
    </Button>
  );

  const content = open ? (
    <RateDialogBody
      isMobile={isMobile}
      kind={kind}
      onClose={() => handleOpenChange(false)}
      onRatingSaved={onRatingSaved}
      posterPath={posterPath}
      publicationMode={publicationMode}
      recommendationCache={recommendationCache}
      title={title}
      tmdbId={tmdbId}
      userId={session?.user.id}
      userRating={userRating}
      year={year}
    />
  ) : null;

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        {showTrigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}

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
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {showTrigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

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
  kind: MediaKind;
  year: string;
  posterPath: string;
  publicationMode: RatingPublicationMode;
  recommendationCache: 'invalidate' | 'preserve';
  isMobile: boolean;
  onClose: () => void;
  onRatingSaved?: () => void;
  userId?: string;
  userRating?: UserRating;
};

function RateDialogBody({
  tmdbId,
  title,
  kind,
  year,
  posterPath,
  publicationMode,
  recommendationCache,
  isMobile,
  onClose,
  onRatingSaved,
  userId,
  userRating,
}: RateDialogBodyProps) {
  const hasChangedRating = useRef(false);
  const hasChangedWatchedDate = useRef(false);
  const mutateRateMedia = useRateMediaMutation(userId, {
    publicationMode,
    recommendationCache,
  });

  const [rating, setRating] = useState(userRating?.score ?? 0);
  const [watchedDate, setWatchedDate] = useState(() => {
    if (userRating) {
      return userRating.watchedDate ?? '';
    }
    return publicationMode === 'silent' ? '' : getLocalTodayDate();
  });

  useEffect(() => {
    if (userRating) {
      if (!hasChangedRating.current) {
        setRating(userRating.score);
      }
      if (!hasChangedWatchedDate.current) {
        setWatchedDate(userRating.watchedDate ?? '');
      }
    }
  }, [userRating]);

  const handleAddRatingToMovie = async (
    _state: ApiResponse<RateMediaResult>,
    formData: FormData
  ) => {
    const result = await mutateRateMedia(formData, {
      tmdbId,
      kind,
      score: rating,
      watchedDate: watchedDate || null,
    });

    if (result.success) {
      onRatingSaved?.();
    }

    return result;
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
              {MediaKindDict[kind]} · {year}
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
        <input name="kind" type="hidden" value={kind} />

        <fieldset>
          <legend className="sr-only">Puntuación</legend>

          <RatingInput
            onChange={(v) => {
              hasChangedRating.current = true;
              setRating(v);
            }}
            size={isMobile ? 'sm' : 'default'}
            value={rating}
          />
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
              htmlFor={`watched-date-${tmdbId}-${kind}`}
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
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                id={`watched-date-${tmdbId}-${kind}`}
                max={getLocalTodayDate()}
                name="watchedDate"
                onChange={(event) => {
                  hasChangedWatchedDate.current = true;
                  setWatchedDate(event.target.value);
                }}
                required={publicationMode === 'publish' && !userRating?.isRated}
                type="date"
                value={watchedDate}
              />
            </div>
            {watchedDate &&
              (userRating?.isRated || publicationMode === 'silent') && (
                <Button
                  className="h-10 shrink-0 px-3 text-white/65 hover:text-white"
                  onClick={() => {
                    hasChangedWatchedDate.current = true;
                    setWatchedDate('');
                  }}
                  type="button"
                  variant="ghost"
                >
                  Quitar fecha
                </Button>
              )}
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
          Aceptar
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
