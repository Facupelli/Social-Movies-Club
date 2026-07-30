import { describe, expect, it, vi } from 'vitest';

vi.mock('./viewer-rating-for-media.pg', () => ({
  findViewerRatingForMedia: vi.fn(),
}));

import { getViewerRatingForMedia } from './get-viewer-rating-for-media';

describe('getViewerRatingForMedia', () => {
  it('returns the viewer rating without combining it with trusted context', async () => {
    const rating = {
      score: 4,
      watchedDate: '2026-07-18',
      ratedAt: '2026-07-19T10:00:00.000Z',
    };
    const repository = vi.fn().mockResolvedValue(rating);

    await expect(
      getViewerRatingForMedia('viewer', 'media', repository)
    ).resolves.toEqual(rating);
    expect(repository).toHaveBeenCalledWith('viewer', 'media');
  });

  it('returns null when the viewer has not rated the media', async () => {
    await expect(
      getViewerRatingForMedia(
        'viewer',
        'media',
        vi.fn().mockResolvedValue(null)
      )
    ).resolves.toBeNull();
  });
});
