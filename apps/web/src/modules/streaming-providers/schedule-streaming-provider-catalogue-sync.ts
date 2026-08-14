import 'server-only';

import { after } from 'next/server';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { syncStreamingProviderCatalogue } from './sync-streaming-provider-catalogue';

/**
 * Schedules a streaming-provider catalogue synchronization attempt after the
 * current Next.js response completes. The caller returns immediately and never
 * waits for TMDB or the catalogue replacement.
 *
 * This is opportunistic, not durable: if the post-response work fails or never
 * runs, the persisted catalogue remains stale and a future settings request can
 * schedule another attempt.
 *
 * The scheduler only decides WHEN work may run. `syncStreamingProviderCatalogue`
 * remains responsible for deciding WHETHER work is necessary (fresh, lease
 * active, or cooldown states all short-circuit without a TMDB request).
 */
export function scheduleStreamingProviderCatalogueSync(
  countryCode: string,
  kind: MediaKind
): void {
  after(async () => {
    try {
      await syncStreamingProviderCatalogue(countryCode, kind);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: background failures need an operational signal.
      console.error(
        'Failed to synchronize streaming provider catalogue after response',
        {
          operation: 'scheduleStreamingProviderCatalogueSync',
          countryCode,
          kind,
          error,
        }
      );
    }
  });
}
