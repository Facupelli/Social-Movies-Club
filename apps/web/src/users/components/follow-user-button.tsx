'use client';

import { Button } from '@/components/ui/button';
import { followUser } from '../actions/follow-user';

export function FollowUserButton({
  children,
  followedUserId,
  isFollowing,
}: {
  isFollowing: boolean;
  children: React.ReactNode;
  followedUserId: string;
}) {
  const handleFollowUser = async () => {
    try {
      await followUser(followedUserId);
    } catch (error) {
      console.error('followUser Error:', error);
    }
  };

  return (
    <Button disabled={isFollowing} onClick={handleFollowUser} type="button">
      {children}
    </Button>
  );
}
