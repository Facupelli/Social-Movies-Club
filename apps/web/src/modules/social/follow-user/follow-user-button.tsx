'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useActionState, useCallback } from 'react';
import { invalidateTrustedRatingContext } from '@/modules/trusted-rating-context/invalidate-trusted-rating-context/invalidate-trusted-rating-context';
import { authClient } from '@/platform/auth/auth-client';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { followUserAction, unfollowUserAction } from './follow-user.actions';

const initialActionState: ApiResponse<void> = { success: false, error: '' };

export function FollowUserButton({
  followedUserId,
  isFollowing,
  userName,
}: {
  isFollowing: boolean;
  followedUserId: string;
  userName?: string;
}) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const invalidateTrustedRatings = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    await invalidateTrustedRatingContext(queryClient, session.user.id);
  }, [queryClient, session?.user.id]);
  const followWithInvalidation = useCallback(
    async (previousState: ApiResponse<void>, formData: FormData) => {
      const result = await followUserAction(previousState, formData);
      if (result.success) {
        await invalidateTrustedRatings();
      }
      return result;
    },
    [invalidateTrustedRatings]
  );
  const unfollowWithInvalidation = useCallback(
    async (previousState: ApiResponse<void>, formData: FormData) => {
      const result = await unfollowUserAction(previousState, formData);
      if (result.success) {
        await invalidateTrustedRatings();
      }
      return result;
    },
    [invalidateTrustedRatings]
  );
  const [followState, followAction, followIsPending] = useActionState(
    followWithInvalidation,
    initialActionState
  );
  const [unfollowState, unfollowAction, unfollowIsPending] = useActionState(
    unfollowWithInvalidation,
    initialActionState
  );
  const actionState = isFollowing ? unfollowState : followState;
  const accessibleTarget = userName ? ` a ${userName}` : '';

  return (
    <form>
      <input name="followedUserId" type="hidden" value={followedUserId} />

      {isFollowing ? (
        <SubmitButton
          aria-label={`Dejar de seguir${accessibleTarget}`}
          disabled={unfollowIsPending}
          formAction={unfollowAction}
          loadingText="Cargando"
          variant="secondary"
        >
          Dejar de seguir
        </SubmitButton>
      ) : (
        <SubmitButton
          aria-label={`Seguir${accessibleTarget}`}
          disabled={followIsPending}
          formAction={followAction}
          loadingText="Siguiendo"
        >
          Seguir
        </SubmitButton>
      )}
      {!actionState.success && actionState.error && (
        <p aria-live="polite" className="text-destructive text-sm">
          {actionState.error}
        </p>
      )}
    </form>
  );
}
