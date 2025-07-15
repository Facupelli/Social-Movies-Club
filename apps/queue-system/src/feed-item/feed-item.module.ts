import { Module } from '@nestjs/common';
import { FeedItemController } from './feed-item.controller';
import { FeedItemWorker } from './feed-item-worker';
import { BullModule } from '@nestjs/bullmq';
import { FeedItemEventsListener } from './feed-item-listener';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 1000,
        removeOnFail: 3000,
      },
    }),
    BullModule.registerQueue({ name: 'feed-item' }),
  ],
  controllers: [FeedItemController],
  providers: [FeedItemEventsListener, FeedItemWorker],
})
export class FeedItemModule {}
