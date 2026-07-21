export interface NotificationCursor {
  createdAt: Date;
  id: string;
}

export interface NotificationListItem {
  id: string;
  actorImage: string | null;
  actorUsername: string;
  actionUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
  title: string;
}

export interface NotificationListFilters {
  recipientId: string;
  includeRead?: boolean;
  typeId?: string;
  limit?: number;
  cursor?: NotificationCursor;
}

export interface PaginatedNotifications {
  data: NotificationListItem[];
  hasMore: boolean;
  nextCursor?: NotificationCursor;
}

export type UnreadNotificationCount = number;
