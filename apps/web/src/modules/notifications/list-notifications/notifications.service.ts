import {
  type NotificationFilters,
  NotificationsPgRepository,
  type PaginatedNotifications,
} from './notifications.pg.repository';

export interface ListNotificationsServiceConfig {
  defaultPageSize?: number;
}

export class ListNotificationsService {
  private readonly defaultPageSize: number;

  constructor(
    private readonly repository = new NotificationsPgRepository(),
    config: ListNotificationsServiceConfig = {}
  ) {
    this.defaultPageSize = config.defaultPageSize ?? 20;
  }

  async getUserNotifications(
    userId: string,
    options: {
      includeRead?: boolean;
      typeId?: string;
      limit?: number;
      cursor?: { createdAt: Date; id: string };
    } = {}
  ): Promise<PaginatedNotifications> {
    const filters: NotificationFilters = {
      recipientId: userId,
      includeRead: options.includeRead ?? false,
      typeId: options.typeId,
      limit: options.limit ?? this.defaultPageSize,
      cursor: options.cursor,
    };

    return await this.repository.getNotifications(filters);
  }
}
