import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { dbWatchlistMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import { getTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-trusted-rating-summaries';
import { closeDatabase, db } from '@/platform/database/postgres/db';
import { getProfileWatchlist } from './watchlist.pg';
import { sortWatchlistItems } from './watchlist-sort';

const viewerId = 'watchlist-viewer';
const ownerId = 'watchlist-owner';
const aliceId = 'watchlist-alice';
const mediaA = '50000000-0000-4000-8000-000000000001';
const mediaB = '50000000-0000-4000-8000-000000000002';

async function insertUser(id: string, name: string): Promise<void> {
  await db.execute(sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES (${id}, ${name}, ${`${id}@example.com`}, true, now(), now())
  `);
}

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users, media CASCADE`);
  await insertUser(viewerId, 'Viewer');
  await insertUser(ownerId, 'Owner');
  await insertUser(aliceId, 'Alice');
  await db.execute(sql`
    INSERT INTO media (id, kind, title)
    VALUES
      (${mediaA}::uuid, 'movie', 'Older movie'),
      (${mediaB}::uuid, 'tv_series', 'Newer series')
  `);
  await db.execute(sql`
    INSERT INTO media_external_ids (media_id, namespace, external_id)
    VALUES
      (${mediaA}::uuid, 'tmdb:movie', '101'),
      (${mediaB}::uuid, 'tmdb:tv', '202')
  `);
  await db.execute(sql`
    INSERT INTO watchlist (user_id, media_id, created_at)
    VALUES
      (${ownerId}, ${mediaA}::uuid, '2025-01-01T00:00:00Z'),
      (${ownerId}, ${mediaB}::uuid, '2025-02-01T00:00:00Z')
  `);
});

afterAll(closeDatabase);

async function loadWatchlist(userId: string) {
  const rows = await getProfileWatchlist(userId);
  return rows.map((row) => ({
    mediaId: row.movieId,
    addedAt:
      row.addedAt instanceof Date
        ? row.addedAt.toISOString()
        : new Date(row.addedAt).toISOString(),
    movie: dbWatchlistMovieToView(row),
  }));
}

describe('watchlist PostgreSQL integration', () => {
  it('enriches another profile watchlist from the viewer network and sorts trusted ratings', async () => {
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES (${viewerId}, ${aliceId})
    `);
    await db.execute(sql`
      INSERT INTO ratings
        (id, user_id, media_id, score, watched_date, created_at, updated_at)
      VALUES
        ('60000000-0000-4000-8000-000000000001', ${aliceId}, ${mediaA}::uuid,
         9, '2025-01-01', '2025-01-01T00:00:00Z', now()),
        ('60000000-0000-4000-8000-000000000002', ${viewerId}, ${mediaB}::uuid,
         10, '2025-01-01', '2025-02-01T00:00:00Z', now())
    `);

    const watchlist = await loadWatchlist(ownerId);
    expect(watchlist.map(({ mediaId }) => mediaId)).toEqual([mediaB, mediaA]);
    expect(watchlist[0]).toMatchObject({
      addedAt: '2025-02-01T00:00:00.000Z',
      movie: { kind: 'tv_series', tmdbId: 202 },
    });

    const summaries = await getTrustedRatingSummaries(
      viewerId,
      watchlist.map(({ mediaId }) => mediaId)
    );
    const sorted = sortWatchlistItems(
      watchlist.map((item) => ({
        ...item,
        trustedRating: summaries[item.mediaId],
      })),
      'trusted-rating'
    );

    expect(sorted.map(({ mediaId }) => mediaId)).toEqual([mediaA, mediaB]);
    expect(sorted[0]?.trustedRating).toMatchObject({
      ratingCount: 1,
      averageScore: 9,
    });
    expect(sorted[1]?.trustedRating).toMatchObject({
      ratingCount: 0,
      averageScore: null,
    });
  });

  it('reorders immediately after follow and score changes', async () => {
    await db.execute(sql`
      INSERT INTO ratings
        (id, user_id, media_id, score, watched_date, created_at, updated_at)
      VALUES
        ('70000000-0000-4000-8000-000000000001', ${aliceId}, ${mediaA}::uuid,
         7, '2025-01-01', '2024-01-01T00:00:00Z', now())
    `);
    await db.execute(sql`
      INSERT INTO follows (follower_id, followee_id)
      VALUES (${viewerId}, ${aliceId})
    `);

    const watchlist = await loadWatchlist(ownerId);
    let summaries = await getTrustedRatingSummaries(
      viewerId,
      watchlist.map(({ mediaId }) => mediaId)
    );
    expect(summaries[mediaA]).toMatchObject({
      ratingCount: 1,
      averageScore: 7,
    });

    await db.execute(sql`
      UPDATE ratings SET score = 10, updated_at = now()
      WHERE user_id = ${aliceId} AND media_id = ${mediaA}::uuid
    `);
    summaries = await getTrustedRatingSummaries(viewerId, [mediaA]);
    expect(summaries[mediaA]).toMatchObject({
      ratingCount: 1,
      averageScore: 10,
    });

    await db.execute(sql`
      DELETE FROM follows
      WHERE follower_id = ${viewerId} AND followee_id = ${aliceId}
    `);
    summaries = await getTrustedRatingSummaries(viewerId, [mediaA]);
    expect(summaries[mediaA]).toMatchObject({
      ratingCount: 0,
      averageScore: null,
    });
  });
});
