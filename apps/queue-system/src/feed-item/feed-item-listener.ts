import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener('feed-item')
export class FeedItemEventsListener extends QueueEventsHost {
  private readonly logger = new Logger(FeedItemEventsListener.name);

  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    this.logger.log(`Processing job ${job.jobId}...`);
  }
}
