export type MediaKind = 'movie' | 'tv_series';

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
  kind: MediaKind;
  runtime?: number;
}

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

export const MediaKindEnum = {
  movie: 'movie',
  tvSeries: 'tv_series',
} as const satisfies Record<string, MediaKind>;

export const MediaKindDict: Record<MediaKind, string> = {
  movie: 'Película',
  tv_series: 'Serie',
};
