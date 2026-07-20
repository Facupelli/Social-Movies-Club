import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';
import { auth } from './auth';

export const getServerSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  })
);
