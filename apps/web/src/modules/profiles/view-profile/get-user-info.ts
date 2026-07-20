import { unstable_cache } from 'next/cache';
import { FollowService } from '@/modules/social/follow-user/follow.service';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';
import { ProfileService } from '../profile.service';

export function getIsFollowingUser(
  sessionUserId: string,
  profileUserId: string
) {
  const followService = new FollowService();

  return unstable_cache(
    () => followService.isFollowingUser(sessionUserId, profileUserId),
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
  const profileService = new ProfileService();

  return unstable_cache(
    () => profileService.getUser(profileUserId),
    ['user-profile', profileUserId],
    {
      tags: ['user-profile', NEXT_CACHE_TAGS.getUserProfile(profileUserId)],
    }
  )();
}
