import type { ObjectId } from 'mongodb';
import { withDatabase } from '@/infra/mongo/db-utils';

export class UserRelationshipRepository {
  private readonly followsCollection = 'user-relationships';

  async isFollowingUser(
    userId: ObjectId,
    followedUserId: ObjectId
  ): Promise<boolean> {
    return await withDatabase(async (db) => {
      const isFollowing = await db.collection(this.followsCollection).findOne({
        followerId: userId,
        followedId: followedUserId,
      });

      return !!isFollowing;
    });
  }

  async followUser(userId: ObjectId, followedUserId: ObjectId): Promise<void> {
    await withDatabase(async (db) => {
      await db.collection(this.followsCollection).insertOne({
        followerId: userId,
        followedId: followedUserId,
        createdAt: new Date(),
      });
    });
  }
}
