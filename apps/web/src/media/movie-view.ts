import type { MediaType } from '@/media/media.type';

export interface MovieView {
  tmdbId: number;
  title: string;
  year: string;
  posterPath: string;
  backdropPath: string;
  score?: number;
  overview: string;
  type: MediaType;
  runtime?: number;
}
