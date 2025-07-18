import type { MediaType } from "@/media/media.type";

export interface UserCompact {
	id: string;
	name: string;
	image: string;
	username: string;
}

export interface MediaCompact {
	id: string;
	type: MediaType;
	year: string;
	title: string;
	tmdbId: number;
	overview: string;
	posterPath: string;
}

export interface RatingInFeed {
	ratingId: string;
	score: number;
	createdAt: string; // ISO-8601
	user: UserCompact;
}

export type AggregatedFeedItem = {
	bucketId: string;
	mediaId: string;
	ratingCount: number;
	lastRatingAt: string; // ISO-8601
	seenAt: string | null;
	media: MediaCompact;
	ratings: RatingInFeed[];
};

export interface AggregatedFeedResponse {
	aggregatedFeed: AggregatedFeedItem[];
}
