import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDatabase, db } from '@/platform/database/postgres/db';
import { getTrustedRatingDetails } from './get-trusted-rating-details';
import { getSearchTrustedRatingSummaries } from './get-search-trusted-rating-summaries';
import { getTrustedRatingSummaries } from './get-trusted-rating-summaries';

const viewerId = 'viewer';
const aliceId = 'alice';
const bobId = 'bob';
const carolId = 'carol';
const mediaA = '10000000-0000-4000-8000-000000000001';
const mediaB = '10000000-0000-4000-8000-000000000002';

async function insertUser(id: string, name: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES (${id}, ${name}, ${`${id}@example.com`}, true, now(), now())
  `);
}

async function insertRating({
  id,
  userId,
  mediaId = mediaA,
  score,
  createdAt,
}: {
  id: string;
  userId: string;
  mediaId?: string;
  score: number;
  createdAt: string;
}): Promise<void> {
  await db.execute(sql`
    INSERT INTO ratings
      (id, user_id, media_id, score, watched_date, created_at, updated_at)
    VALUES
      (${id}::uuid, ${userId}, ${mediaId}::uuid, ${score}, '2025-01-01',
       ${createdAt}::timestamptz, ${createdAt}::timestamptz)
  `);
}

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users, media CASCADE`);
  await insertUser(viewerId, 'Viewer');
  await insertUser(aliceId, 'Alice Account');
  await insertUser(bobId, 'Bob Account');
  await insertUser(carolId, 'Carol Account');
  await db.execute(sql`
    UPDATE user_profiles
    SET
      display_name = CASE
        WHEN user_id = ${aliceId} THEN 'Alice Profile'
        WHEN user_id = ${bobId} THEN 'Bob Profile'
      END,
      username = CASE
        WHEN user_id = ${aliceId} THEN 'alice'
        WHEN user_id = ${bobId} THEN 'bob'
      END
    WHERE user_id IN (${aliceId}, ${bobId})
  `);
  await db.execute(sql`DELETE FROM user_profiles WHERE user_id = ${carolId}`);
  await db.execute(sql`
    INSERT INTO media (id, kind, title)
    VALUES
      (${mediaA}::uuid, 'movie', 'Shared title'),
      (${mediaB}::uuid, 'tv_series', 'Shared title')
  `);
});

afterAll(closeDatabase);

describe('trusted rating context PostgreSQL queries', () => {
  it('derives batches from current follows, excludes self, and keeps media separate', async () => {
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES (${viewerId}, ${aliceId}), (${viewerId}, ${bobId})
    `);
    await insertRating({
      id: '20000000-0000-4000-8000-000000000001',
      userId: aliceId,
      score: 8,
      createdAt: '2025-01-01T00:00:00Z',
    });
    await insertRating({
      id: '20000000-0000-4000-8000-000000000002',
      userId: bobId,
      score: 10,
      createdAt: '2025-01-02T00:00:00Z',
    });
    await insertRating({
      id: '20000000-0000-4000-8000-000000000003',
      userId: viewerId,
      score: 4,
      createdAt: '2025-01-03T00:00:00Z',
    });
    await insertRating({
      id: '20000000-0000-4000-8000-000000000004',
      userId: aliceId,
      mediaId: mediaB,
      score: 6,
      createdAt: '2025-01-04T00:00:00Z',
    });

    const result = await getTrustedRatingSummaries(viewerId, [mediaA, mediaB]);

    expect(result[mediaA]).toMatchObject({ ratingCount: 2, averageScore: 9 });
    expect(result[mediaA]?.previewRaters.map(({ userId }) => userId)).toEqual([
      bobId,
      aliceId,
    ]);
    expect(result[mediaB]).toMatchObject({ ratingCount: 1, averageScore: 6 });
  });

  it('reflects follow changes and current scores without changing creation recency', async () => {
    await insertRating({
      id: '30000000-0000-4000-8000-000000000001',
      userId: aliceId,
      score: 8,
      createdAt: '2024-01-01T00:00:00Z',
    });
    await insertRating({
      id: '30000000-0000-4000-8000-000000000002',
      userId: bobId,
      score: 10,
      createdAt: '2025-01-01T00:00:00Z',
    });
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES (${viewerId}, ${aliceId}), (${viewerId}, ${bobId})
    `);
    await db.execute(sql`
      UPDATE ratings
      SET score = 9, watched_date = '2025-06-01', updated_at = now()
      WHERE user_id = ${aliceId} AND media_id = ${mediaA}::uuid
    `);

    let details = await getTrustedRatingDetails(viewerId, mediaA);
    expect(details.summary).toMatchObject({
      ratingCount: 2,
      averageScore: 9.5,
    });
    expect(details.raters.map(({ userId, score }) => [userId, score])).toEqual([
      [bobId, 10],
      [aliceId, 9],
    ]);

    await db.execute(sql`
      DELETE FROM follows
      WHERE follower_id = ${viewerId} AND followee_id = ${bobId}
    `);
    details = await getTrustedRatingDetails(viewerId, mediaA);
    expect(details.summary).toMatchObject({ ratingCount: 1, averageScore: 9 });

    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id) VALUES (${viewerId}, ${bobId})
    `);
    details = await getTrustedRatingDetails(viewerId, mediaA);
    expect(details.summary.ratingCount).toBe(2);
  });

  it('batch matches external identities without persisting unknown search results', async () => {
    await db.execute(sql`
      INSERT INTO media_external_ids (media_id, namespace, external_id)
      VALUES
        (${mediaA}::uuid, 'tmdb:movie', '101'),
        (${mediaB}::uuid, 'tmdb:tv', '101')
    `);
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES (${viewerId}, ${aliceId}), (${viewerId}, ${bobId})
    `);
    await insertRating({
      id: '35000000-0000-4000-8000-000000000001',
      userId: aliceId,
      mediaId: mediaA,
      score: 8,
      createdAt: '2025-01-01T00:00:00Z',
    });
    await insertRating({
      id: '35000000-0000-4000-8000-000000000002',
      userId: bobId,
      mediaId: mediaB,
      score: 10,
      createdAt: '2025-01-02T00:00:00Z',
    });

    const before = await db.execute<{ count: string }>(
      sql`SELECT COUNT(*)::text AS count FROM media`
    );
    const result = await getSearchTrustedRatingSummaries(viewerId, [
      { kind: 'movie', tmdbId: 101 },
      { kind: 'tv_series', tmdbId: 101 },
      { kind: 'movie', tmdbId: 999 },
      { kind: 'movie', tmdbId: 101 },
    ]);
    const after = await db.execute<{ count: string }>(
      sql`SELECT COUNT(*)::text AS count FROM media`
    );

    expect(result['movie:101']).toMatchObject({
      mediaId: mediaA,
      ratingCount: 1,
      averageScore: 8,
    });
    expect(result['tv_series:101']).toMatchObject({
      mediaId: mediaB,
      ratingCount: 1,
      averageScore: 10,
    });
    expect(result['movie:999']).toBeUndefined();
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it('limits previews deterministically while all ratings contribute and falls back to users.name', async () => {
    const daveId = 'dave';
    await insertUser(daveId, 'Dave Account');
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES
        (${viewerId}, ${aliceId}), (${viewerId}, ${bobId}),
        (${viewerId}, ${carolId}), (${viewerId}, ${daveId})
    `);
    const userIds = [aliceId, bobId, carolId, daveId];
    await Promise.all(
      userIds.map((userId, index) =>
        insertRating({
          id: `40000000-0000-4000-8000-00000000000${index + 1}`,
          userId,
          score: 7 + index,
          createdAt: '2025-01-01T00:00:00Z',
        })
      )
    );

    const summary = (await getTrustedRatingSummaries(viewerId, [mediaA]))[
      mediaA
    ];

    expect(summary).toMatchObject({ ratingCount: 4, averageScore: 8.5 });
    expect(summary?.previewRaters.map(({ userId }) => userId)).toEqual([
      daveId,
      carolId,
      bobId,
    ]);
    expect(
      summary?.previewRaters.find(({ userId }) => userId === carolId)
    ).toMatchObject({
      displayName: 'Carol Account',
      avatarUrl: null,
    });
  });
});
