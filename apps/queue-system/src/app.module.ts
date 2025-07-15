import { Module, ValidationPipe } from '@nestjs/common';
import { FeedItemModule } from './feed-item/feed-item.module';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './database/database.module';

@Module({
  imports: [ConfigModule.forRoot(), DrizzleModule, FeedItemModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
