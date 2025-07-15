export interface SearchMovieQueryParams {
  query: string; // Required
  include_adult?: boolean; // Defaults to false
  language?: string; // Defaults to "en-US"
  primary_release_year?: string;
  page?: number; // Defaults to 1
  region?: string;
  year?: string;
}

export interface SearchMovieApiResponse {
  page: number; // Defaults to 0
  results: SearchMovieResult[];
  total_pages: number; // Defaults to 0
  total_results: number; // Defaults to 0
}

export interface SearchMovieResult {
  adult: boolean; // Defaults to true
  backdrop_path: string;
  genre_ids: number[];
  id: number; // Defaults to 0
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number; // Defaults to 0
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean; // Defaults to true
  vote_average: number; // Defaults to 0
  vote_count: number; // Defaults to 0
}
