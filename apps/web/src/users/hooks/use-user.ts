'use client';

import { useQuery } from '@tanstack/react-query';
import type { User } from '@/infra/neon/schema';

async function getUser(): Promise<User | null> {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => getUser(),
    refetchOnWindowFocus: false,
  });
};

export { useUser, getUser };
