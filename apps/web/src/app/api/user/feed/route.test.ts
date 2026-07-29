import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadUserFeedPage, getServerSession } = vi.hoisted(() => ({
  loadUserFeedPage: vi.fn(),
  getServerSession: vi.fn(),
}));

vi.mock('@/modules/timeline/view-timeline/timeline-query-loader.server', () => ({
  loadUserFeedPage,
}));
vi.mock('@/platform/auth/get-server-session', () => ({ getServerSession }));

import { encodeFeedCursor } from '@/modules/timeline/view-timeline/feed-cursor';
import { GET } from './route';

const session = { user: { id: 'viewer-id' } };

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue(session);
  loadUserFeedPage.mockResolvedValue({ items: [], nextCursor: null });
});

describe('GET /api/user/feed', () => {
  it('decodes a valid tuple cursor at the HTTP boundary', async () => {
    const cursor = {
      occurredAt: '2026-07-29T19:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    };
    const encoded = encodeURIComponent(encodeFeedCursor(cursor));

    const response = await GET(
      new Request(`http://localhost/api/user/feed?cursor=${encoded}`)
    );

    expect(response.status).toBe(200);
    expect(loadUserFeedPage).toHaveBeenCalledWith({
      userId: session.user.id,
      cursor,
    });
  });

  it.each([
    'cursor=not-a-cursor',
    'cursor=',
    'cursor=abc&cursor=def',
  ])('returns 400 for malformed query %s', async (query) => {
    const response = await GET(
      new Request(`http://localhost/api/user/feed?${query}`)
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      error: 'Invalid feed cursor',
    });
    expect(loadUserFeedPage).not.toHaveBeenCalled();
  });
});
