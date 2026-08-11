'use client';

import { useActionState } from 'react';
import {
  followUserAction,
  unfollowUserAction,
} from '@/modules/social/follow-user/follow-user.actions';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';

const initialActionState: ApiResponse<void> = { success: false, error: '' };

type OnboardingFollowButtonProps = {
  followedUserId: string;
  isFollowing: boolean;
  userName?: string;
  onToggle: (isNowFollowing: boolean) => void;
};

export function OnboardingFollowButton({
  followedUserId,
  isFollowing,
  userName,
  onToggle,
}: OnboardingFollowButtonProps) {
  async function followWithToggle(
    previousState: ApiResponse<void>,
    formData: FormData
  ) {
    const result = await followUserAction(previousState, formData);
    if (result.success) {
      onToggle(true);
    }
    return result;
  }

  async function unfollowWithToggle(
    previousState: ApiResponse<void>,
    formData: FormData
  ) {
    const result = await unfollowUserAction(previousState, formData);
    if (result.success) {
      onToggle(false);
    }
    return result;
  }

  const [followState, followAction, followIsPending] = useActionState(
    followWithToggle,
    initialActionState
  );
  const [unfollowState, unfollowAction, unfollowIsPending] = useActionState(
    unfollowWithToggle,
    initialActionState
  );

  const accessibleTarget = userName ? ` a ${userName}` : '';

  if (isFollowing) {
    return (
      <form>
        <input name="followedUserId" type="hidden" value={followedUserId} />
        <Button
          aria-label={`Dejar de seguir${accessibleTarget}`}
          className="h-9 text-xs"
          disabled={unfollowIsPending}
          formAction={unfollowAction}
          size="sm"
          type="submit"
          variant="secondary"
        >
          {unfollowIsPending ? 'Cargando' : 'Siguiendo'}
        </Button>
        {!unfollowState.success && unfollowState.error && (
          <p aria-live="polite" className="text-destructive text-xs">
            {unfollowState.error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form>
      <input name="followedUserId" type="hidden" value={followedUserId} />
      <SubmitButton
        aria-label={`Seguir${accessibleTarget}`}
        className="h-9 text-xs"
        disabled={followIsPending}
        formAction={followAction}
        loadingText="Siguiendo"
        size="sm"
      >
        Seguir
      </SubmitButton>
      {!followState.success && followState.error && (
        <p aria-live="polite" className="text-destructive text-xs">
          {followState.error}
        </p>
      )}
    </form>
  );
}
