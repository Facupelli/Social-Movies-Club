'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getWatchlistStatusQueryOptions } from '@/modules/watchlist/get-watchlist-status/use-user-watchlist';
import { removeMovieFromWatchlist } from '@/modules/watchlist/remove-from-watchlist/remove-movie';
import type {
  WatchlistMutationResult,
  WatchlistStatusMap,
} from '@/modules/watchlist/watchlist.types';
import { authClient } from '@/platform/auth/auth-client';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/utilities/utils';
import { addMovieToWatchlist } from './add-movie';

const initialState: ApiResponse<WatchlistMutationResult> = {
  success: false,
  error: '',
};

export function AddToWatchlistButton({
  tmdbId,
  kind,
  className,
  variant,
  presentation = 'button',
}: {
  tmdbId: number;
  kind: MediaKind;
  className?: string;
  presentation?: 'button' | 'menu-item';
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

    const identityKey = getMediaIdentityKey(
      result.data.tmdbId,
      result.data.kind
    );
    queryClient.setQueryData<WatchlistStatusMap>(
      statusOptions.queryKey,
      (current) => {
        const next = { ...current };
        if (result.data.inWatchlist) {
          next[identityKey] = true;
        } else {
          delete next[identityKey];
        }
        return next;
      }
    );
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

  const [addState, addAction, isAdding] = useActionState(
    handleAdd,
    initialState
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    handleRemove,
    initialState
  );

  const isInWatchlist = Boolean(
    watchlistStatus?.[getMediaIdentityKey(tmdbId, kind)]
  );
  const error = addState.success
    ? undefined
    : addState.error || (removeState.success ? undefined : removeState.error);

  const isPending = isAdding || isRemoving;
  const label = isInWatchlist ? 'Quitar de tu lista' : 'Agregar a tu lista';
  const WatchlistIcon = isInWatchlist ? EyeOff : Eye;
  const actionButton = (
    <Button
      aria-busy={isPending}
      aria-label={label}
      className={cn('w-full', className)}
      disabled={isPending}
      formAction={isInWatchlist ? removeAction : addAction}
      size="sm"
      type="submit"
      variant={presentation === 'menu-item' ? 'ghost' : variant}
    >
      {isPending ? (
        <Loader2
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      ) : (
        <WatchlistIcon aria-hidden="true" className="size-4" />
      )}
      {presentation === 'menu-item' ? label : null}
    </Button>
  );

  return (
    <form>
      <input name="movieTMDBId" type="hidden" value={tmdbId} />
      <input name="kind" type="hidden" value={kind} />

      {presentation === 'menu-item' ? (
        <DropdownMenuItem asChild onSelect={(event) => event.preventDefault()}>
          {actionButton}
        </DropdownMenuItem>
      ) : (
        actionButton
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </form>
  );
}
