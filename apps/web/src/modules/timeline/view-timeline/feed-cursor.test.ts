import { describe, expect, it } from 'vitest';
import { decodeFeedCursor, encodeFeedCursor } from './feed-cursor';

const cursor = {
  occurredAt: '2026-07-29T19:00:00.000Z',
  id: '550e8400-e29b-41d4-a716-446655440000',
};

describe('feed cursor', () => {
  it('round trips activity time and delivery ID', () => {
    expect(decodeFeedCursor(encodeFeedCursor(cursor))).toEqual(cursor);
  });

  it.each([
    '',
    'not-base64!',
    Buffer.from('not json').toString('base64url'),
    Buffer.from(JSON.stringify({ occurredAt: cursor.occurredAt })).toString(
      'base64url'
    ),
    Buffer.from(
      JSON.stringify({ ...cursor, occurredAt: 'July 29, 2026' })
    ).toString('base64url'),
    Buffer.from(JSON.stringify({ ...cursor, id: 'not-a-uuid' })).toString(
      'base64url'
    ),
    Buffer.from(JSON.stringify({ ...cursor, extra: true })).toString(
      'base64url'
    ),
    'a'.repeat(513),
  ])('rejects malformed cursor %s', (encoded) => {
    expect(() => decodeFeedCursor(encoded)).toThrow();
  });
});
