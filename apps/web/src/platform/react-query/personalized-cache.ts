import type { Query, QueryClient } from '@tanstack/react-query';
import { PERSONALIZED_QUERY_PREFIX } from '@/platform/react-query/personalized-query-keys';

function isPersonalizedQuery(query: Query, exceptUserId?: string): boolean {
  const [scope, userId] = query.queryKey;

  return (
    scope === PERSONALIZED_QUERY_PREFIX &&
    (exceptUserId === undefined || userId !== exceptUserId)
  );
}

export async function clearPersonalizedQueries(
  queryClient: QueryClient,
  exceptUserId?: string
) {
  const predicate = (query: Query) => isPersonalizedQuery(query, exceptUserId);

  try {
    await queryClient.cancelQueries({ predicate });
  } finally {
    queryClient.removeQueries({ predicate });
  }
}
