import 'server-only';

import { after } from 'next/server';
import { refreshMediaAvailability } from './refresh-media-availability';

/**
 * Schedules a media availability refresh after the current Next.js response
 * completes. The caller returns immediately and never waits for TMDB or the
 * projection update.
 *
 * This is opportunistic, not durable: if the post-response work fails or never
 * runs, the persisted projection remains stale or missing and a future product
 * interaction can schedule another attempt.
 *
 * The scheduler only decides WHEN work may run. `refreshMediaAvailability`
 * remains responsible for deciding WHETHER work is necessary (fresh, lease
 * active, or cooldown states all short-circuit without a TMDB request).
 */
export function scheduleMediaAvailabilityRefresh(mediaId: string): void {
  after(async () => {
    try {
      await refreshMediaAvailability(mediaId);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: background failures need an operational signal.
      console.error('Failed to refresh media availability after response', {
        operation: 'scheduleMediaAvailabilityRefresh',
        mediaId,
        error,
      });
    }
  });
}
