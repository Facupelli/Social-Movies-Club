import type { MediaKind } from './media.type';

export const KIND_FILTER_DICT: Record<'all' | MediaKind, string> = {
  all: 'Filtrar',
  movie: 'Películas',
  tv_series: 'Series',
};

export const KIND_DICT: Record<MediaKind, string> = {
  movie: 'Película',
  tv_series: 'Serie',
};
