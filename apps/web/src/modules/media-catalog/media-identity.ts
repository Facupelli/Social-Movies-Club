import type { MediaKind } from './media.type';

export type MediaIdentityKey = `${MediaKind}:${number}`;

export function getMediaIdentityKey(
  tmdbId: number,
  kind: MediaKind
): MediaIdentityKey {
  return `${kind}:${tmdbId}`;
}
