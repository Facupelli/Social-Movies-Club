import { Module } from '@nestjs/common';
import { FeedItemController } from './feed-item.controller';
import { FeedItemWorker } from './feed-item-worker';
import { BullModule } from '@nestjs/bullmq';
import { FeedItemEventsListener } from './feed-item-listener';
import { ConfigService } from '@nestjs/config';

function redisConnection(redisUrl: string) {
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: redisConnection(
          config.get('REDIS_URL', 'redis://127.0.0.1:6379'),
        ),
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: 1000,
          removeOnFail: 3000,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'feed-item' }),
  ],
  controllers: [FeedItemController],
  providers: [FeedItemEventsListener, FeedItemWorker],
})
export class FeedItemModule {}
