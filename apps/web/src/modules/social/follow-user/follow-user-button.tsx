'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useActionState, useCallback, useRef } from 'react';
import { invalidateTrustedRatingContext } from '@/modules/trusted-rating-context/invalidate-trusted-rating-context/invalidate-trusted-rating-context';
import { authClient } from '@/platform/auth/auth-client';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/utilities/utils';
import { followUserAction, unfollowUserAction } from './follow-user.actions';

const initialActionState: ApiResponse<void> = { success: false, error: '' };

export function FollowUserButton({
  followedUserId,
  isFollowing,
  triggerClassName,
  userName,
}: {
  isFollowing: boolean;
  followedUserId: string;
  triggerClassName?: string;
  userName?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
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
    <form action={isFollowing ? unfollowAction : undefined} ref={formRef}>
      <input name="followedUserId" type="hidden" value={followedUserId} />

      {isFollowing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-busy={unfollowIsPending}
              aria-label={`Siguiendo${accessibleTarget}`}
              className={cn(
                'h-10 gap-1 px-3 text-muted-foreground',
                triggerClassName
              )}
              type="button"
              variant="ghost"
            >
              Siguiendo
              {unfollowIsPending ? (
                <Loader2
                  aria-hidden="true"
                  className="size-3.5 motion-safe:animate-spin"
                />
              ) : (
                <ChevronDown aria-hidden="true" className="size-3.5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="min-h-10"
              disabled={unfollowIsPending}
              onSelect={() => formRef.current?.requestSubmit()}
              variant="destructive"
            >
              Dejar de seguir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SubmitButton
          aria-label={`Seguir${accessibleTarget}`}
          className={cn('h-10', triggerClassName)}
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
