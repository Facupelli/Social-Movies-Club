import { sql } from 'drizzle-orm';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { type Media, media } from '@/platform/database/postgres/schema';

export async function upsertMedia(
  mediaData: Omit<Media, 'id'>
): Promise<{ id: string }> {
  return await withDatabase(async (db) => {
    const query = sql`
      WITH ins AS (
        INSERT INTO ${media} (title, year, overview, poster_path, backdrop_path, tmdb_id, type, runtime)
        VALUES (${mediaData.title}, ${mediaData.year}, ${mediaData.overview}, ${mediaData.posterPath}, ${mediaData.backdropPath}, ${mediaData.tmdbId}, ${mediaData.type}, ${mediaData.runtime})
        ON CONFLICT (tmdb_id, type) DO NOTHING
        RETURNING id
      )
      SELECT id FROM ins
      UNION
      SELECT id
      FROM ${media}
      WHERE tmdb_id = ${mediaData.tmdbId} AND type = ${mediaData.type}
    `;

    const { rows } = await db.execute<{ id: string }>(query);

    return rows[0];
  });
}

export async function getMediaByTmdbIdentity(
  tmdbId: number,
  type: MediaType
): Promise<{ id: string } | undefined> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ id: string }>(sql`
      SELECT id
      FROM ${media}
      WHERE tmdb_id = ${tmdbId} AND type = ${type};
    `);

    return rows[0];
  });
}

export async function getMediaById(mediaId: bigint): Promise<Media[]> {
  return await withDatabase(async (db) => {
    const query = sql`
      SELECT * FROM ${media} WHERE ${media.id} = ${mediaId};
    `;

    const { rows } = await db.execute<Media>(query);
    return rows;
  });
}
