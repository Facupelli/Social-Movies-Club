import { HttpCode, HttpStatus, Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AddRatingDto } from './dto/add-rating.dto';

@Controller('feed-item')
export class FeedItemController {
  constructor(
    @InjectQueue('feed-item') private readonly feedItemQueue: Queue,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  async processFeedItem(
    @Body() addRatingDto: AddRatingDto,
  ): Promise<{ message: string }> {
    await this.feedItemQueue.add('process', addRatingDto);

    return {
      message: 'feed-item job added to queue!',
    };
  }
}
