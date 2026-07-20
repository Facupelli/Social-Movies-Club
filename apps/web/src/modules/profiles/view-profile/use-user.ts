'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/platform/auth/auth-client';
import type { User } from '@/platform/database/postgres/schema';
import { QUERY_KEYS } from '@/shared/utilities/app.constants';

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
    queryKey: QUERY_KEYS.getUser(userId),
    queryFn: ({ signal }) => getUser(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });
};

export { useUser, getUser };
