import { describe, expect, it, vi } from 'vitest';
import {
  createRateLimiter,
  fetchTmdbMetadata,
  isNeonDatabase,
  mapTmdbMetadata,
  parseArguments,
} from './backfill-media-metadata.mjs';

describe('backfill media metadata', () => {
  it('parses operational options', () => {
    expect(
      parseArguments([
        '--dry-run',
        '--limit=10',
        '--requests-per-second=12.5',
        '--concurrency=3',
        '--max-retries=4',
        '--confirm-production',
      ])
    ).toMatchObject({
      confirmProduction: true,
      concurrency: 3,
      dryRun: true,
      limit: 10,
      maxRetries: 4,
      requestsPerSecond: 12.5,
    });
  });

  it('recognizes Neon database hosts without exposing credentials', () => {
    expect(
      isNeonDatabase(
        'postgres://user:secret@ep-example.us-east-2.aws.neon.tech/db'
      )
    ).toBe(true);
    expect(isNeonDatabase('postgres://localhost/db')).toBe(false);
  });

  it('maps movie metadata including runtime', () => {
    expect(
      mapTmdbMetadata('movie', {
        original_title: 'The Original',
        release_date: '2024-02-03',
        runtime: 121,
      })
    ).toEqual({
      originalTitle: 'The Original',
      releaseDate: '2024-02-03',
      runtimeMinutes: 121,
      status: 'found',
    });
  });

  it('never maps runtime for TV series', () => {
    expect(
      mapTmdbMetadata('tv_series', {
        episode_run_time: [50],
        first_air_date: '2020-01-02',
        original_name: 'Original series',
      })
    ).toEqual({
      originalTitle: 'Original series',
      releaseDate: '2020-01-02',
      runtimeMinutes: null,
      status: 'found',
    });
  });

  it('retries 429 responses and honors Retry-After', async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('rate limited', {
          status: 429,
          headers: { 'Retry-After': '2' },
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          original_title: 'Original',
          release_date: '2024-01-01',
          runtime: 100,
        })
      );
    const sleep = vi.fn().mockResolvedValue(undefined);
    const waitForRequestSlot = vi.fn().mockResolvedValue(undefined);

    const result = await fetchTmdbMetadata({
      fetchImplementation,
      kind: 'movie',
      maxRetries: 2,
      sleep,
      tmdbId: '123',
      token: 'token',
      waitForRequestSlot,
    });

    expect(result.status).toBe('found');
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    expect(waitForRequestSlot).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it('serializes request slots through the limiter', async () => {
    const sleeps = [];
    const limiter = createRateLimiter(20, (milliseconds) => {
      sleeps.push(milliseconds);
      return Promise.resolve();
    });

    await Promise.all([limiter(), limiter(), limiter()]);

    expect(sleeps).toHaveLength(2);
    expect(sleeps.every((milliseconds) => milliseconds > 0)).toBe(true);
  });
});
