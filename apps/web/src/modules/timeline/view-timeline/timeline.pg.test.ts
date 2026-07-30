import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDatabase, db } from '@/platform/database/postgres/db';
vi.mock('server-only', () => ({}));

import { loadUserFeedPage } from './timeline-query-loader.server';

const mediaId = '10000000-0000-4000-8000-000000000001';
const ratingId = '20000000-0000-4000-8000-000000000001';
const activityId = '30000000-0000-4000-8000-000000000001';

async function insertUser(id: string, name: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES (${id}, ${name}, ${`${id}@example.com`}, true, now(), now())
  `);
}

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users, media CASCADE`);
  await insertUser('viewer', 'Viewer');
  await insertUser('alice', 'Alice');
  await insertUser('bob', 'Bob');
  await db.execute(sql`
    INSERT INTO media (id, kind, title, release_date)
    VALUES (${mediaId}::uuid, 'movie', 'Dune', '2024-01-01')
  `);
  await db.execute(sql`
    INSERT INTO media_external_ids (media_id, namespace, external_id)
    VALUES (${mediaId}::uuid, 'tmdb:movie', '101')
  `);
  await db.execute(sql`
    INSERT INTO ratings
      (id, user_id, media_id, score, watched_date, created_at, updated_at)
    VALUES
      (${ratingId}::uuid, 'alice', ${mediaId}::uuid, 8, '2024-01-01',
       '2024-02-01T00:00:00Z', '2024-02-01T00:00:00Z'),
      ('20000000-0000-4000-8000-000000000002'::uuid, 'bob', ${mediaId}::uuid,
       10, '2024-01-01', '2024-03-01T00:00:00Z', '2024-03-01T00:00:00Z')
  `);
  await db.execute(sql`
    INSERT INTO activities
      (id, type_code, actor_id, occurred_at, deduplication_key)
    VALUES
      (${activityId}::uuid, 'rating.created', 'alice',
       '2024-02-01T00:00:00Z', 'rating:alice:dune')
  `);
  await db.execute(sql`
    INSERT INTO rating_activities (activity_id, rating_id)
    VALUES (${activityId}::uuid, ${ratingId}::uuid)
  `);
  await db.execute(sql`
    INSERT INTO feed_deliveries
      (id, feed_owner_id, activity_id, occurred_at)
    VALUES
      ('40000000-0000-4000-8000-000000000001'::uuid, 'viewer',
       ${activityId}::uuid, '2024-02-01T00:00:00Z')
  `);
  await db.execute(sql`
    INSERT INTO follows (follower_id, followee_id)
    VALUES ('viewer', 'alice'), ('viewer', 'bob')
  `);
});

afterAll(closeDatabase);

describe('timeline PostgreSQL integration', () => {
  it('keeps a delivered actor visible while deriving enrichment from current follows', async () => {
    let page = await loadUserFeedPage({ userId: 'viewer' });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ actorId: 'alice', score: 8 });
    expect(page.items[0]?.trustedRatingContext).toMatchObject({
      actorIsCurrentlyTrusted: true,
      otherRaterCount: 1,
      summary: { ratingCount: 2, averageScore: 9 },
    });
    expect(
      page.items[0]?.trustedRatingContext?.otherPreviewRaters.map(
        ({ userId }) => userId
      )
    ).toEqual(['bob']);

    await db.execute(sql`
      DELETE FROM follows
      WHERE follower_id = 'viewer' AND followee_id = 'alice'
    `);

    page = await loadUserFeedPage({ userId: 'viewer' });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.actorId).toBe('alice');
    expect(page.items[0]?.trustedRatingContext).toMatchObject({
      actorIsCurrentlyTrusted: false,
      otherRaterCount: 1,
      summary: { ratingCount: 1, averageScore: 10 },
    });
  });

  it('uses current scores without moving the historical activity', async () => {
    await db.execute(sql`
      UPDATE ratings SET score = 9, updated_at = now()
      WHERE id = ${ratingId}::uuid
    `);

    const page = await loadUserFeedPage({ userId: 'viewer' });
    expect(page.items[0]).toMatchObject({
      score: 9,
      occurredAt: '2024-02-01T00:00:00.000Z',
      ratedAt: '2024-02-01T00:00:00.000Z',
    });
    expect(page.items[0]?.trustedRatingContext?.summary).toMatchObject({
      ratingCount: 2,
      averageScore: 9.5,
    });
  });
});
