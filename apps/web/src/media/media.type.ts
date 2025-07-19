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
	overview: string;
	type: MediaType;
}

export const MediaTypeEnum = {
	movie: "movie",
	tv: "tv",
} as const;

export type MediaType = (typeof MediaTypeEnum)[keyof typeof MediaTypeEnum];
