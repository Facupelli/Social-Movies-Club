'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/shared/components/submit-button';
import {
  followUserAction,
  unfollowUserAction,
} from './follow-user.actions';

export function FollowUserButton({
  followedUserId,
  isFollowing,
}: {
  isFollowing: boolean;
  followedUserId: string;
}) {
  const [_, followAction, followIsPending] = useActionState(followUserAction, {
    success: false,
    error: '',
  });

  const [__, unfollowAction, unfollowIsPending] = useActionState(unfollowUserAction, {
    success: false,
    error: '',
  });

  return (
    <form>
      <input name="followedUserId" type="hidden" value={followedUserId} />

      {isFollowing ? (
        <SubmitButton
          disabled={unfollowIsPending}
          formAction={(formData) => {
            unfollowAction(formData);
          }}
          loadingText="Cargando"
          variant="secondary"
        >
          Dejar de seguir
        </SubmitButton>
      ) : (
        <SubmitButton
          disabled={followIsPending}
          formAction={(formData) => {
            followAction(formData);
          }}
          loadingText="Siguiendo"
        >
          Seguir
        </SubmitButton>
      )}
    </form>
  );
}
