import { sql } from 'drizzle-orm';
import {
  type MediaType,
  type PersistMediaInput,
  mediaTypeToTmdbNamespace,
} from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type Media,
  media,
  mediaExternalIds,
} from '@/platform/database/postgres/schema';

export async function upsertMedia(
  mediaData: PersistMediaInput
): Promise<{ id: string }> {
  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      const namespace =
        mediaData.kind === 'movie' ? 'tmdb:movie' : 'tmdb:tv';
      const externalId = String(mediaData.tmdbId);

      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${namespace}:${externalId}`}, 0))`
      );

      const existing = await tx.execute<{ id: string }>(sql`
        SELECT media_id AS id
        FROM ${mediaExternalIds}
        WHERE namespace = ${namespace} AND external_id = ${externalId}
      `);

      const existingId = existing.rows[0]?.id;
      if (existingId) {
        await tx.execute(sql`
          UPDATE ${media}
          SET
            kind = ${mediaData.kind},
            title = ${mediaData.title},
            original_title = ${mediaData.originalTitle},
            release_date = ${mediaData.releaseDate},
            runtime_minutes = ${mediaData.runtimeMinutes},
            overview = ${mediaData.overview},
            poster_path = ${mediaData.posterPath},
            backdrop_path = ${mediaData.backdropPath},
            source_synced_at = ${mediaData.sourceSyncedAt},
            updated_at = now()
          WHERE id = ${existingId}
        `);
        return { id: existingId };
      }

      const inserted = await tx.execute<{ id: string }>(sql`
        INSERT INTO ${media}
          (kind, title, original_title, release_date, runtime_minutes, overview,
           poster_path, backdrop_path, source_synced_at)
        VALUES
          (${mediaData.kind}, ${mediaData.title}, ${mediaData.originalTitle},
           ${mediaData.releaseDate}, ${mediaData.runtimeMinutes}, ${mediaData.overview},
           ${mediaData.posterPath}, ${mediaData.backdropPath}, ${mediaData.sourceSyncedAt})
        RETURNING id
      `);
      const id = inserted.rows[0]?.id;
      if (!id) {
        throw new Error('Unable to persist media');
      }

      await tx.execute(sql`
        INSERT INTO ${mediaExternalIds} (media_id, namespace, external_id)
        VALUES (${id}, ${namespace}, ${externalId})
      `);

      return { id };
    })
  );
}

export async function getMediaByTmdbIdentity(
  tmdbId: number,
  type: MediaType
): Promise<{ id: string } | undefined> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ id: string }>(sql`
      SELECT media_id AS id
      FROM ${mediaExternalIds}
      WHERE namespace = ${mediaTypeToTmdbNamespace(type)}
        AND external_id = ${String(tmdbId)}
    `);

    return rows[0];
  });
}

export async function getMediaById(mediaId: string): Promise<Media[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<Media>(sql`
      SELECT * FROM ${media} WHERE ${media.id} = ${mediaId}
    `);
    return rows;
  });
}
