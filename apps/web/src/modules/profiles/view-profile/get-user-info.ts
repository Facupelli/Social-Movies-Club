import { unstable_cache } from 'next/cache';
import { getFollowStatus } from '@/modules/social/get-follow-status/follow-status.pg';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';
import { getProfileById } from '../profile.pg';

export function getIsFollowingUser(
  sessionUserId: string,
  profileUserId: string
) {
  return unstable_cache(
    () => getFollowStatus(sessionUserId, profileUserId),
    ['is-following-user', sessionUserId, profileUserId],
    {
      tags: [
        'is-following-user',
        NEXT_CACHE_TAGS.getIsFollowingUser(sessionUserId, profileUserId),
        NEXT_CACHE_TAGS.getIsFollowingUserByProfile(profileUserId),
        NEXT_CACHE_TAGS.getIsFollowingUserBySession(sessionUserId),
      ],
    }
  )();
}

export function getUserProfile(profileUserId: string) {
  return unstable_cache(
    () => getProfileById(profileUserId),
    ['user-profile', profileUserId],
    {
      tags: ['user-profile', NEXT_CACHE_TAGS.getUserProfile(profileUserId)],
    }
  )();
}
