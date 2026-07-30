import { describe, expect, it, vi } from 'vitest';

vi.mock('./get-trusted-rating-summaries.pg', () => ({
  findTrustedRatingSummaries: vi.fn(),
}));

import { getTrustedRatingSummaries } from './get-trusted-rating-summaries';

const rater = {
  userId: 'alice',
  displayName: 'Alice',
  username: 'alice',
  avatarUrl: null,
  score: 8,
  watchedDate: '2026-01-02',
  ratedAt: new Date('2026-01-03T10:00:00.000Z'),
};

describe('trusted rating summaries', () => {
  it('short-circuits empty input', async () => {
    const repository = vi.fn();

    await expect(
      getTrustedRatingSummaries('viewer', [], repository)
    ).resolves.toEqual({});
    expect(repository).not.toHaveBeenCalled();
  });

  it('deduplicates media IDs and fills empty projections', async () => {
    const repository = vi.fn().mockResolvedValue([
      {
        mediaId: 'media-a',
        ratingCount: 1,
        averageScore: '8.0000000000000000',
        previewRaters: [rater],
      },
    ]);

    const result = await getTrustedRatingSummaries(
      'viewer',
      ['media-a', 'media-b', 'media-a'],
      repository
    );

    expect(repository).toHaveBeenCalledOnce();
    expect(repository).toHaveBeenCalledWith('viewer', ['media-a', 'media-b']);
    expect(result['media-a']).toMatchObject({
      ratingCount: 1,
      averageScore: 8,
    });
    expect(result['media-a']?.previewRaters[0]?.ratedAt).toBe(
      '2026-01-03T10:00:00.000Z'
    );
    expect(result['media-b']).toEqual({
      mediaId: 'media-b',
      ratingCount: 0,
      averageScore: null,
      previewRaters: [],
    });
  });
});
