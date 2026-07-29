import type { MediaKind } from '@/modules/media-catalog/media.type';

export interface MovieView {
  tmdbId: number;
  title: string;
  year: string;
  posterPath: string;
  backdropPath: string;
  score?: number;
  overview: string;
  kind: MediaKind;
  runtime?: number;
}
