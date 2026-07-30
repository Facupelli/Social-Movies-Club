import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDatabase, db } from '@/platform/database/postgres/db';
import { findViewerRatingForMedia } from './viewer-rating-for-media.pg';

const mediaId = '50000000-0000-4000-8000-000000000001';

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users, media CASCADE`);
  await db.execute(sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES
      ('viewer', 'Viewer', 'viewer@example.com', true, now(), now()),
      ('other', 'Other', 'other@example.com', true, now(), now())
  `);
  await db.execute(sql`
    INSERT INTO media (id, kind, title)
    VALUES (${mediaId}::uuid, 'movie', 'A movie')
  `);
});

afterAll(closeDatabase);

describe('findViewerRatingForMedia', () => {
  it('returns only the viewer current rating for the requested media', async () => {
    await db.execute(sql`
      INSERT INTO ratings
        (user_id, media_id, score, watched_date, created_at, updated_at)
      VALUES
        ('viewer', ${mediaId}::uuid, 4, '2026-07-18',
         '2026-07-19T10:00:00Z', now()),
        ('other', ${mediaId}::uuid, 10, '2026-07-20',
         '2026-07-20T10:00:00Z', now())
    `);

    await expect(findViewerRatingForMedia('viewer', mediaId)).resolves.toEqual({
      score: 4,
      watchedDate: '2026-07-18',
      ratedAt: '2026-07-19T10:00:00.000Z',
    });
  });

  it('returns null when the viewer has no rating for the media', async () => {
    await expect(
      findViewerRatingForMedia('viewer', mediaId)
    ).resolves.toBeNull();
  });
});
