import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';
import { AddRatingDto } from './dto/add-rating.dto';
import { sql } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

@Processor('feed-item')
export class FeedItemWorker extends WorkerHost {
  private readonly logger = new Logger(FeedItemWorker.name);
  protected readonly db: NeonDatabase;
  private readonly MAX_FOLLOWERS_TO_FANOUT = 1000;

  constructor(protected readonly databaseService: DatabaseService) {
    super();
    this.db = databaseService.getDatabase();
  }

  async process(job: Job<AddRatingDto>) {
    const { userId, ratingId } = job.data;

    try {
      await this.db.transaction(async (tx) => {
        const { rows: followers } = await tx.execute<{
          follower_id: string;
        }>(sql`
            SELECT follower_id
            FROM follows
            WHERE followee_id = ${userId}
            LIMIT ${this.MAX_FOLLOWERS_TO_FANOUT + 1}
          `);

        const followersSkipped = Math.max(
          0,
          followers.length - this.MAX_FOLLOWERS_TO_FANOUT,
        );
        const followersToProcess = followers.slice(
          0,
          this.MAX_FOLLOWERS_TO_FANOUT,
        );

        if (followersSkipped > 0) {
          this.logger.warn(
            `⚠️  Skipping ${followersSkipped} followers for rating ${ratingId} (over limit)`,
          );
        }

        let feedItemsCreated = 0;
        if (followersToProcess.length > 0) {
          await tx.execute(sql`
          INSERT INTO feed_items (user_id, actor_id, rating_id)
          VALUES ${sql.join(
            followersToProcess.map(
              (follower) =>
                sql`(${follower.follower_id}, ${userId}, ${ratingId})`,
            ),
            sql`, `,
          )}
      `);

          feedItemsCreated = followersToProcess.length;
        }

        this.logger.log(
          `📢 Created ${feedItemsCreated} feed items for rating ${ratingId}`,
        );
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onAdded(job: Job) {
    this.logger.log(`New job: ${job.id}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.log(`Job failed: ${job.id}`);
  }
}
