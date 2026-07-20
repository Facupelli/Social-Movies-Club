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
	runtime?: number;
}

export const MediaTypeEnum = {
	movie: "movie",
	tv: "tv",
} as const;

export const MediaTypeDict = {
	[MediaTypeEnum.movie]: "Película",
	[MediaTypeEnum.tv]: "Serie",
};

export type MediaType = (typeof MediaTypeEnum)[keyof typeof MediaTypeEnum];
