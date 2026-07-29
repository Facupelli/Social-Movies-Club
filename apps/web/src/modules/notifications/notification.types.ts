export interface NotificationCursor {
  createdAt: Date;
  id: string;
}

export interface NotificationData {
  actorImage?: string | null;
  actorUsername?: string;
  actionUrl?: string | null;
  legacyMessage?: string | null;
  legacyMetadata?: unknown;
  legacyTitle?: string;
  legacyUpdatedAt?: string;
}

export interface NotificationListItem {
  id: string;
  actorImage: string | null;
  actorUsername: string | null;
  actionUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
  title: string;
}

export interface NotificationListFilters {
  recipientId: string;
  includeRead?: boolean;
  typeCode?: string;
  limit?: number;
  cursor?: NotificationCursor;
}

export interface PaginatedNotifications {
  data: NotificationListItem[];
  hasMore: boolean;
  nextCursor?: NotificationCursor;
}

export type UnreadNotificationCount = number;
