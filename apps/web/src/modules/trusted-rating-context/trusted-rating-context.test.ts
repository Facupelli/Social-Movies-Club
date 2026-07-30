import { describe, expect, it, vi } from 'vitest';

vi.mock('./trusted-rating-context.pg', () => ({
  findTrustedRatingDetails: vi.fn(),
  findTrustedRatingSummaries: vi.fn(),
}));

import { getTrustedRatingDetails } from './get-trusted-rating-details';
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

describe('trusted rating details', () => {
  it('returns null average when nobody currently followed rated the media', async () => {
    const repository = vi.fn().mockResolvedValue([]);

    await expect(
      getTrustedRatingDetails('viewer', 'media-a', repository)
    ).resolves.toEqual({
      summary: {
        mediaId: 'media-a',
        ratingCount: 0,
        averageScore: null,
        previewRaters: [],
      },
      raters: [],
    });
  });

  it('uses the first three ordered rows as the detail preview', async () => {
    const rows = [8, 9, 7, 10].map((score, index) => ({
      ...rater,
      userId: `user-${index}`,
      score,
      ratingCount: 4,
      averageScore: '8.5',
    }));

    const result = await getTrustedRatingDetails(
      'viewer',
      'media-a',
      vi.fn().mockResolvedValue(rows)
    );

    expect(result.summary).toMatchObject({ ratingCount: 4, averageScore: 8.5 });
    expect(result.summary.previewRaters.map(({ userId }) => userId)).toEqual([
      'user-0',
      'user-1',
      'user-2',
    ]);
    expect(result.raters).toHaveLength(4);
  });
});
