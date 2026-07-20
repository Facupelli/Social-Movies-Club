export interface GetUserFollowsInfoMap {
  followerCount: number;
  followingCount: number;
}

export type GetFollowingUsers = {
  followeeId: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userImage: string;
};
