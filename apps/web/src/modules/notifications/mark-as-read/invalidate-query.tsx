'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUserNotificationsCountQueryOptions } from '@/modules/notifications/count-unread/use-user-notifications-count';
import { authClient } from '@/platform/auth/auth-client';
import { markNotiAsRead } from './mark-noti-as-read';

export function InvalidateNotificationsQuery() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (_userId: string) => await markNotiAsRead(),
    onSuccess: (data, mutationUserId) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: getUserNotificationsCountQueryOptions(mutationUserId).queryKey,
        });
      }
    },
  });

  useEffect(() => {
    if (userId) {
      markAsRead(userId);
    }
  }, [userId, markAsRead]);

  return null;
}
