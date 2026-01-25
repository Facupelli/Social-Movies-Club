export interface MultiSearchApiResponse {
	page: number;
	results: MediaResult[];
	total_pages: number;
	total_results: number;
}

export type MediaResult = MovieResult | TvResult;

export interface MovieResult {
	adult: boolean;
	backdrop_path: string;
	id: number;
	title: string;
	original_language: string;
	original_title: string;
	overview: string;
	poster_path: string;
	media_type: string;
	genre_ids: number[];
	popularity: number;
	release_date: string;
	runtime: number;
	video: boolean;
	vote_average: number;
	vote_count: number;
}

export interface TvResult {
	adult: boolean;
	backdrop_path: string;
	id: number;
	name: string;
	original_language: string;
	original_name: string;
	overview: string;
	poster_path: string;
	media_type: string;
	genre_ids: number[];
	popularity: number;
	first_air_date: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
}
