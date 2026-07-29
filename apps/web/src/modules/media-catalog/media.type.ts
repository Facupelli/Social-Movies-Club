export interface TMDbMovieSearch {
  id: number;
  posterPath: string;
  backdropPath: string;
  year: string;
  title: string;
  overview: string;
}

export interface TMDbMediaMultiSearch {
  id: number;
  posterPath: string;
  backdropPath: string;
  year: string;
  title: string;
  originalTitle?: string;
  releaseDate?: string;
  overview: string;
  type: MediaType;
  runtime?: number;
}

export type MediaKind = 'movie' | 'tv_series';
export type TmdbNamespace = 'tmdb:movie' | 'tmdb:tv';

export type PersistMediaInput = {
  tmdbId: number;
  kind: MediaKind;
  title: string;
  originalTitle: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  sourceSyncedAt: Date;
};

export function mediaTypeToKind(type: MediaType): MediaKind {
  return type === 'movie' ? 'movie' : 'tv_series';
}

export function mediaTypeToTmdbNamespace(type: MediaType): TmdbNamespace {
  return type === 'movie' ? 'tmdb:movie' : 'tmdb:tv';
}

export const MediaTypeEnum = {
  movie: 'movie',
  tv: 'tv',
} as const;

export const MediaTypeDict = {
  [MediaTypeEnum.movie]: 'Película',
  [MediaTypeEnum.tv]: 'Serie',
};

export type MediaType = (typeof MediaTypeEnum)[keyof typeof MediaTypeEnum];
