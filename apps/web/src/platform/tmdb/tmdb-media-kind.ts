import { type SQL, type SQLWrapper, sql } from 'drizzle-orm';
import type { MediaKind } from '@/modules/media-catalog/media.type';

export type TmdbMediaType = 'movie' | 'tv';
export type TmdbNamespace = `tmdb:${TmdbMediaType}`;

export function toTmdbMediaType(kind: MediaKind): TmdbMediaType {
  return kind === 'movie' ? 'movie' : 'tv';
}

export function fromTmdbMediaType(type: TmdbMediaType): MediaKind {
  return type === 'movie' ? 'movie' : 'tv_series';
}

export function toTmdbNamespace(kind: MediaKind): TmdbNamespace {
  return `tmdb:${toTmdbMediaType(kind)}`;
}

export function tmdbNamespaceForKindSql(kind: SQLWrapper): SQL<TmdbNamespace> {
  return sql`CASE ${kind}
    WHEN 'movie' THEN 'tmdb:movie'
    WHEN 'tv_series' THEN 'tmdb:tv'
  END`;
}
