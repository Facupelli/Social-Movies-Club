import type { Genre } from '@/infra/TMDB/types/detail-movie';

export interface MovieData {
  id: number;
  genres: Genre[];
  originalTitle: string;
  posterPath: string;
  releaseDate: string;
  title: string;
  addedAt: Date;
}

export interface MovieViewModel extends MovieData {
  rating: number;
}
