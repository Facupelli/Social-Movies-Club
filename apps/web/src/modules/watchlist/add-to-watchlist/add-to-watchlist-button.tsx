'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useActionState } from 'react';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { getWatchlistStatusQueryOptions } from '@/modules/watchlist/get-watchlist-status/use-user-watchlist';
import { removeMovieFromWatchlist } from '@/modules/watchlist/remove-from-watchlist/remove-movie';
import type {
  WatchlistMutationResult,
  WatchlistStatusMap,
} from '@/modules/watchlist/watchlist.types';
import { authClient } from '@/platform/auth/auth-client';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { cn } from '@/shared/utilities/utils';
import { addMovieToWatchlist } from './add-movie';

const initialState: ApiResponse<WatchlistMutationResult> = {
  success: false,
  error: '',
};

export function AddToWatchlistButton({
  tmdbId,
  type,
  className,
  variant,
}: {
  tmdbId: number;
  type: MediaType;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const statusOptions = getWatchlistStatusQueryOptions(session?.user.id);
  const { data: watchlistStatus } = useQuery(statusOptions);

  const applyResult = (result: ApiResponse<WatchlistMutationResult>) => {
    if (!(result.success && session?.user.id)) {
      return;
    }

    const identityKey = getMediaIdentityKey(result.data.tmdbId, result.data.type);
    queryClient.setQueryData<WatchlistStatusMap>(statusOptions.queryKey, (current) => {
      const next = { ...current };
      if (result.data.inWatchlist) {
        next[identityKey] = true;
      } else {
        delete next[identityKey];
      }
      return next;
    });
  };

  const handleAdd = async (
    _state: ApiResponse<WatchlistMutationResult>,
    formData: FormData
  ) => {
    const result = await addMovieToWatchlist(formData);
    applyResult(result);
    return result;
  };

  const handleRemove = async (
    previousState: ApiResponse<WatchlistMutationResult>,
    formData: FormData
  ) => {
    const result = await removeMovieFromWatchlist(previousState, formData);
    applyResult(result);
    return result;
  };

  const [addState, addAction] = useActionState(handleAdd, initialState);
  const [removeState, removeAction] = useActionState(handleRemove, initialState);

  const isInWatchlist = Boolean(
    watchlistStatus?.[getMediaIdentityKey(tmdbId, type)]
  );
  const error = addState.success ? undefined : addState.error ||
    (removeState.success ? undefined : removeState.error);

  return (
    <form>
      <input name="movieTMDBId" type="hidden" value={tmdbId} />
      <input name="type" type="hidden" value={type} />

      {isInWatchlist ? (
        <SubmitButton
          aria-label="Quitar de tu lista"
          className={cn('w-full', className)}
          formAction={removeAction}
          hideLoadingText
          size="sm"
          variant={variant}
        >
          <EyeOff className="size-4 fill-secondary-foreground" />
        </SubmitButton>
      ) : (
        <SubmitButton
          aria-label="Agregar a tu lista"
          className={cn('w-full', className)}
          formAction={addAction}
          hideLoadingText
          size="sm"
          variant={variant}
        >
          <Eye className="size-4" />
        </SubmitButton>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </form>
  );
}
