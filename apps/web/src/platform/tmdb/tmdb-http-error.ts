/**
 * Structured HTTP error for TMDB requests. Preserves the HTTP status so callers
 * can react specifically to 429, 404, and 5xx responses, and exposes a
 * normalized Retry-After value for rate-limited responses.
 */
const DELTA_SECONDS_PATTERN = /^\d+$/;

export class TmdbHttpError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | undefined;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'TmdbHttpError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Parses a `Retry-After` header into a non-negative integer number of seconds.
 * Supports both delta-seconds (`10`) and HTTP-date values. Returns undefined
 * when the value is missing or cannot be parsed.
 */
export function parseRetryAfterSeconds(
  value: string | null | undefined
): number | undefined {
  if (!value) {
    return;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return;
  }

  if (DELTA_SECONDS_PATTERN.test(trimmed)) {
    const seconds = Number(trimmed);
    return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : undefined;
  }

  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) {
    return;
  }

  const seconds = Math.max(0, Math.ceil((date - Date.now()) / 1000));
  return Number.isSafeInteger(seconds) ? seconds : undefined;
}
