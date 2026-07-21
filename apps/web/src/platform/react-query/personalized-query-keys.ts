export const PERSONALIZED_QUERY_PREFIX = 'viewer' as const;

export const personalizedQueryKeys = {
  all: [PERSONALIZED_QUERY_PREFIX] as const,
  viewer: (viewerUserId: string | undefined) =>
    [PERSONALIZED_QUERY_PREFIX, viewerUserId] as const,
  resource: <const TSegments extends readonly unknown[]>(
    viewerUserId: string | undefined,
    ...resourceSegments: TSegments
  ) => [...personalizedQueryKeys.viewer(viewerUserId), ...resourceSegments] as const,
} as const;
