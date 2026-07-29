import { describe, expect, it } from 'vitest';
import {
  fromTmdbMediaType,
  toTmdbMediaType,
  toTmdbNamespace,
} from './tmdb-media-kind';

describe('TMDB media-kind mapping', () => {
  it.each([
    ['movie', 'movie'],
    ['tv_series', 'tv'],
  ] as const)('maps domain kind %s to TMDB type %s', (kind, type) => {
    expect(toTmdbMediaType(kind)).toBe(type);
  });

  it.each([
    ['movie', 'movie'],
    ['tv', 'tv_series'],
  ] as const)('maps TMDB type %s to domain kind %s', (type, kind) => {
    expect(fromTmdbMediaType(type)).toBe(kind);
  });

  it.each([
    ['movie', 'tmdb:movie'],
    ['tv_series', 'tmdb:tv'],
  ] as const)('keeps TMDB namespace vocabulary for %s', (kind, namespace) => {
    expect(toTmdbNamespace(kind)).toBe(namespace);
  });
});
