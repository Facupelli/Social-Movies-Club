import { describe, expect, it, vi } from 'vitest';

vi.mock('./get-trusted-rating-details.pg', () => ({
  findTrustedRatingDetails: vi.fn(),
}));
vi.mock(
  '../get-trusted-rating-summaries/get-trusted-rating-summaries.pg',
  () => ({
    findTrustedRatingSummaries: vi.fn(),
  })
);

import { getTrustedRatingDetails } from './get-trusted-rating-details';

const rater = {
  userId: 'alice',
  displayName: 'Alice',
  username: 'alice',
  avatarUrl: null,
  score: 8,
  watchedDate: '2026-01-02',
  ratedAt: new Date('2026-01-03T10:00:00.000Z'),
};

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
