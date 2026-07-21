'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/platform/auth/auth-client';
import type { User } from '@/platform/database/postgres/schema';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const currentViewerQueryKeys = {
  account: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'account'),
} as const;

async function getUser(signal?: AbortSignal): Promise<User | null> {
  const response = await fetch('/api/user', { cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useUser = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: currentViewerQueryKeys.account(userId),
    queryFn: ({ signal }) => getUser(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });
};

export { useUser, getUser };
