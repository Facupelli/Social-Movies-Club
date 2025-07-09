import type { Genre } from '@/infra/TMDB/types/detail-movie';

export interface MovieViewModel {
  id: number;
  genres: Genre[];
  originalTitle: string;
  posterPath: string;
  releaseDate: string;
  title: string;
  addedAt: Date;
}
