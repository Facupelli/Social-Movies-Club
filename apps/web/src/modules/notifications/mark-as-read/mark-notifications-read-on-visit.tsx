'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { notificationQueryKeys } from '@/modules/notifications/count-unread/use-user-notifications-count';
import { markAllNotificationsRead } from './mark-all-notifications-read';

export function MarkNotificationsReadOnVisit({
  viewerUserId,
}: {
  viewerUserId: string;
}) {
  const queryClient = useQueryClient();
  const startedForViewer = useRef<string | null>(null);

  useEffect(() => {
    if (startedForViewer.current === viewerUserId) {
      return;
    }
    startedForViewer.current = viewerUserId;

    markAllNotificationsRead()
      .then((result) => {
        if (result.success) {
          queryClient.setQueryData(
            notificationQueryKeys.unreadCount(viewerUserId),
            result.unreadCount
          );
        }
      })
      .catch(() => {
        // Preserve the previous count if transport-level action execution fails.
      });
  }, [queryClient, viewerUserId]);

  return null;
}
