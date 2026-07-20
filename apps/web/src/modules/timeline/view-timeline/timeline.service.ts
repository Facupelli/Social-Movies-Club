import type {
  AggregatedFeedItem,
  FeedItem,
  GetUserFeedParams,
} from './feed.types';
import { TimelinePgRepository } from './timeline.pg.repository';

export class TimelineService {
  constructor(
    private readonly repository: TimelinePgRepository =
      new TimelinePgRepository()
  ) {}

  async getAggregatedFeed(params: GetUserFeedParams): Promise<{
    items: AggregatedFeedItem[];
    nextCursor: string | null;
  }> {
    return await this.repository.getAggregatedFeed(params);
  }

  async getFeed(params: GetUserFeedParams): Promise<{
    items: FeedItem[];
    nextCursor: string | null;
  }> {
    return await this.repository.getFeed(params);
  }
}
