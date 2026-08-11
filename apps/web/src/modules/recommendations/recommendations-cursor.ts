import { z } from 'zod';
import type { RecommendationCursor } from './recommendations.types';

const MAX_ENCODED_CURSOR_LENGTH = 512;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

const RecommendationCursorSchema = z
  .object({
    supporterCount: z.int().nonnegative(),
    averageScore: z.string().regex(/^\d+(?:\.\d+)?$/),
    ratingCount: z.int().nonnegative(),
    latestWatchedDate: z.iso.date(),
    mediaId: z.uuid(),
  })
  .strict();

export function encodeRecommendationsCursor(
  cursor: RecommendationCursor
): string {
  return Buffer.from(
    JSON.stringify(RecommendationCursorSchema.parse(cursor))
  ).toString('base64url');
}

export function decodeRecommendationsCursor(
  encodedCursor: string
): RecommendationCursor {
  if (
    encodedCursor.length === 0 ||
    encodedCursor.length > MAX_ENCODED_CURSOR_LENGTH ||
    !BASE64URL_PATTERN.test(encodedCursor)
  ) {
    throw new z.ZodError([]);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(
      Buffer.from(encodedCursor, 'base64url').toString('utf8')
    );
  } catch {
    throw new z.ZodError([]);
  }

  return RecommendationCursorSchema.parse(decoded);
}

export function recommendationsCursorFromSearchParams(
  searchParams: URLSearchParams
): RecommendationCursor | null {
  const values = searchParams.getAll('cursor');
  if (values.length === 0) {
    return null;
  }
  if (values.length !== 1) {
    throw new z.ZodError([]);
  }
  return decodeRecommendationsCursor(values[0] ?? '');
}
