export interface MovieDetailApiResponse {
  adult: boolean; // Defaults to true
  backdrop_path: string;
  belongs_to_collection: string;
  budget: number; // Defaults to 0
  genres: Genre[];
  homepage: string;
  id: number; // Defaults to 0
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number; // Defaults to 0
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number; // Defaults to 0
  runtime: number; // Defaults to 0
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean; // Defaults to true
  vote_average: number; // Defaults to 0
  vote_count: number; // Defaults to 0
}

export interface Genre {
  id: number; // Defaults to 0
  name: string;
}

interface ProductionCompany {
  id: number; // Defaults to 0
  logo_path: string;
  name: string;
  origin_country: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}
