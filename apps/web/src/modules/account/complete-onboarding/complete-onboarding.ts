'use server';

import { redirect } from 'next/navigation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { persistOnboardingCompleted } from './complete-onboarding.pg';

export async function completeOnboarding() {
  await withAuth(async (session) => {
    await persistOnboardingCompleted(session.user.id);
    redirect('/recommendations');
  });
}
