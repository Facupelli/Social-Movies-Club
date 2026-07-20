export type FollowingUser = {
  followeeId: string;
  userId: string;
  userName: string;
  userUsername: string | null;
  userImage: string | null;
  isFollowing: boolean;
};
