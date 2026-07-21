'use client';

import { useActionState } from 'react';
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
  const [followState, followAction, followIsPending] = useActionState(
    followUserAction,
    initialActionState
  );
  const [unfollowState, unfollowAction, unfollowIsPending] = useActionState(
    unfollowUserAction,
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
