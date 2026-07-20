import type { MediaType } from "./media.type";

export type MediaIdentityKey = `${MediaType}:${number}`;

export function getMediaIdentityKey(
	tmdbId: number,
	type: MediaType,
): MediaIdentityKey {
	return `${type}:${tmdbId}`;
}
