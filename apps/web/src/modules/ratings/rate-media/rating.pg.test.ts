import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { PersistMediaInput } from '@/modules/media-catalog/media.type';
import { closeDatabase, db } from '@/platform/database/postgres/db';
import { persistRatingMutation } from './rating.pg';

const mediaId = '60000000-0000-4000-8000-000000000001';
const mediaData: PersistMediaInput = {
  tmdbId: 101,
  kind: 'movie',
  title: 'Dune',
  originalTitle: 'Dune',
  releaseDate: '2024-03-01',
  runtimeMinutes: 166,
  overview: 'A movie',
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  sourceSyncedAt: new Date('2024-03-02T00:00:00Z'),
};

async function addToWatchlist(): Promise<void> {
  await db.execute(sql`
    INSERT INTO watchlist (user_id, media_id)
    VALUES ('author', ${mediaId}::uuid)
  `);
}

async function getSocialCounts(): Promise<{
  activities: number;
  ratingActivities: number;
  feedDeliveries: number;
}> {
  const { rows } = await db.execute<{
    activities: number;
    ratingActivities: number;
    feedDeliveries: number;
  }>(sql`
    SELECT
      (SELECT count(*)::int FROM activities) AS activities,
      (SELECT count(*)::int FROM rating_activities) AS "ratingActivities",
      (SELECT count(*)::int FROM feed_deliveries) AS "feedDeliveries"
  `);
  const counts = rows[0];
  if (!counts) {
    throw new Error('Unable to read social row counts');
  }
  return counts;
}

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users, media CASCADE`);
  await db.execute(sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES
      ('author', 'Author', 'author@example.com', true, now(), now()),
      ('follower-1', 'Follower 1', 'follower-1@example.com', true, now(), now()),
      ('follower-2', 'Follower 2', 'follower-2@example.com', true, now(), now()),
      ('other', 'Other', 'other@example.com', true, now(), now())
  `);
  await db.execute(sql`
    INSERT INTO follows (follower_id, followee_id)
    VALUES
      ('follower-1', 'author'),
      ('follower-2', 'author')
  `);
  await db.execute(sql`
    INSERT INTO media (id, kind, title)
    VALUES (${mediaId}::uuid, 'movie', 'Old title')
  `);
  await db.execute(sql`
    INSERT INTO media_external_ids (media_id, namespace, external_id)
    VALUES (${mediaId}::uuid, 'tmdb:movie', '101')
  `);
  await addToWatchlist();
});

afterAll(closeDatabase);

describe('persistRatingMutation', () => {
  it('publishes a new rating and delivers it to current followers', async () => {
    const result = await persistRatingMutation(
      'author',
      mediaData,
      8,
      '2024-03-03',
      'publish'
    );

    expect(result).toMatchObject({
      rating: { user_id: 'author', media_id: mediaId, score: 8 },
      removedFromWatchlist: true,
    });
    await expect(getSocialCounts()).resolves.toEqual({
      activities: 1,
      ratingActivities: 1,
      feedDeliveries: 2,
    });

    const { rows: deliveries } = await db.execute<{ feedOwnerId: string }>(sql`
      SELECT feed_owner_id AS "feedOwnerId"
      FROM feed_deliveries
      ORDER BY feed_owner_id
    `);
    expect(deliveries).toEqual([
      { feedOwnerId: 'follower-1' },
      { feedOwnerId: 'follower-2' },
    ]);
    const { rows: watchlistRows } = await db.execute(
      sql`SELECT media_id FROM watchlist WHERE user_id = 'author'`
    );
    expect(watchlistRows).toHaveLength(0);
  });

  it('updates a published rating without creating more social rows', async () => {
    const created = await persistRatingMutation(
      'author',
      mediaData,
      8,
      '2024-03-03',
      'publish'
    );
    await addToWatchlist();

    const updated = await persistRatingMutation(
      'author',
      mediaData,
      10,
      '2024-03-04',
      'publish'
    );

    expect(updated).toMatchObject({
      rating: {
        id: created.rating.id,
        score: 10,
        watched_date: '2024-03-04',
        created_at: created.rating.created_at,
      },
      removedFromWatchlist: true,
    });
    await expect(getSocialCounts()).resolves.toEqual({
      activities: 1,
      ratingActivities: 1,
      feedDeliveries: 2,
    });
  });

  it('persists a new silent rating without social rows', async () => {
    const result = await persistRatingMutation(
      'author',
      mediaData,
      7,
      '2024-03-03',
      'silent'
    );

    expect(result).toMatchObject({
      rating: { user_id: 'author', media_id: mediaId, score: 7 },
      removedFromWatchlist: true,
    });
    await expect(getSocialCounts()).resolves.toEqual({
      activities: 0,
      ratingActivities: 0,
      feedDeliveries: 0,
    });
    const { rows: watchlistRows } = await db.execute(
      sql`SELECT media_id FROM watchlist WHERE user_id = 'author'`
    );
    expect(watchlistRows).toHaveLength(0);
  });

  it('updates a silent rating without adding social rows', async () => {
    const created = await persistRatingMutation(
      'author',
      mediaData,
      7,
      '2024-03-03',
      'silent'
    );
    await addToWatchlist();

    const updated = await persistRatingMutation(
      'author',
      mediaData,
      9,
      '2024-03-05',
      'silent'
    );

    expect(updated).toMatchObject({
      rating: {
        id: created.rating.id,
        score: 9,
        watched_date: '2024-03-05',
        created_at: created.rating.created_at,
      },
      removedFromWatchlist: true,
    });
    await expect(getSocialCounts()).resolves.toEqual({
      activities: 0,
      ratingActivities: 0,
      feedDeliveries: 0,
    });
  });

  it('does not publish a silently created rating during a publishing update', async () => {
    await persistRatingMutation('author', mediaData, 7, '2024-03-03', 'silent');

    const updated = await persistRatingMutation(
      'author',
      mediaData,
      9,
      '2024-03-05',
      'publish'
    );

    expect(updated.rating).toMatchObject({
      score: 9,
      watched_date: '2024-03-05',
    });
    await expect(getSocialCounts()).resolves.toEqual({
      activities: 0,
      ratingActivities: 0,
      feedDeliveries: 0,
    });
  });
});
