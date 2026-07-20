'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useActionState } from 'react';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getUserWatchlistQueryOptions } from '@/modules/watchlist/get-watchlist-status/use-user-watchlist';
import { removeMovieFromWatchlist } from '@/modules/watchlist/remove-from-watchlist/remove-movie';
import { authClient } from '@/platform/auth/auth-client';
import { SubmitButton } from '@/shared/components/submit-button';
import { useIsOwner } from '@/shared/hooks/use-is-owner';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { QUERY_KEYS } from '@/shared/utilities/app.constants';
import { cn } from '@/shared/utilities/utils';
import { addMovieToWatchlist } from './add-movie';

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
  const { data: userWatchlist } = useQuery(
    getUserWatchlistQueryOptions(session?.user.id)
  );

  const { isProfilePage } = useIsOwner();

  const handleAddMovieToWatchlist = async (
    _state: ApiResponse<void>,
    formData: FormData
  ) => {
    const result = await addMovieToWatchlist(formData);
    if (result.success && session?.user.id) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.getUserWatchlist(session.user.id),
      });
    }

    return result;
  };

  const handleRemoveMovieFromWatchlist = async (
    _state: ApiResponse<void>,
    formData: FormData
  ) => {
    const result = await removeMovieFromWatchlist(_state, formData);
    if (result.success && session?.user.id) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.getUserWatchlist(session.user.id),
      });
    }

    return result;
  };

  const [_, addAction] = useActionState(handleAddMovieToWatchlist, {
    success: false,
    error: '',
  });

  const [__, removeAction] = useActionState(handleRemoveMovieFromWatchlist, {
    success: false,
    error: '',
  });

  const userMovie = userWatchlist?.[getMediaIdentityKey(tmdbId, type)];
  const isMovieInWatchlist = !!userMovie;

  return (
    <form>
      <input name="movieTMDBId" type="hidden" value={tmdbId} />
      <input name="userId" type="hidden" value={session?.user.id} />
      <input name="type" type="hidden" value={type} />

      {isMovieInWatchlist ? (
        !isProfilePage && (
          <SubmitButton
            className={cn('w-full', className)}
            formAction={removeAction}
            hideLoadingText
            size="sm"
            variant={variant}
          >
            <EyeOff className="size-4 fill-secondary-foreground" />
          </SubmitButton>
        )
      ) : (
        <SubmitButton
          className={cn('w-full', className)}
          formAction={addAction}
          hideLoadingText
          size="sm"
          variant={variant}
        >
          <Eye className="size-4" />
        </SubmitButton>
      )}
    </form>
  );
}
