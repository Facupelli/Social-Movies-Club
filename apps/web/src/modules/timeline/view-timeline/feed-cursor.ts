import { z } from 'zod';

const MAX_ENCODED_CURSOR_LENGTH = 512;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

const FeedCursorSchema = z
  .object({
    occurredAt: z.iso.datetime({ offset: true }),
    id: z.uuid(),
  })
  .strict();

export type FeedCursor = z.infer<typeof FeedCursorSchema>;

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(FeedCursorSchema.parse(cursor))).toString(
    'base64url'
  );
}

export function decodeFeedCursor(encodedCursor: string): FeedCursor {
  if (
    encodedCursor.length === 0 ||
    encodedCursor.length > MAX_ENCODED_CURSOR_LENGTH ||
    !BASE64URL_PATTERN.test(encodedCursor)
  ) {
    throw new z.ZodError([]);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedCursor, 'base64url').toString());
  } catch {
    throw new z.ZodError([]);
  }

  return FeedCursorSchema.parse(decoded);
}

export function feedCursorFromSearchParams(
  searchParams: URLSearchParams
): FeedCursor | null {
  const values = searchParams.getAll('cursor');
  if (values.length === 0) {
    return null;
  }
  if (values.length !== 1) {
    throw new z.ZodError([]);
  }
  return decodeFeedCursor(values[0] ?? '');
}
