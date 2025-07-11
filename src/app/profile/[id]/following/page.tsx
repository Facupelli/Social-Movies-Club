import { FollowService } from '@/follows/follow.service';

const fetchFollowingUsers = async (userId: string) => {
  const followService = new FollowService();
  const followingUsers = await followService.getFollowingUsers(userId);
  return followingUsers;
};

export default async function FollowingPage(
  props: Readonly<{
    params: Promise<{ id: string }>;
  }>
) {
  const params = await props.params;
  const profileUserId = params.id;

  const followingUsers = await fetchFollowingUsers(profileUserId);

  if (followingUsers.length === 0) {
    return (
      <div className="flex-1 pt-10 text-neutral-500">No sigue a nadie</div>
    );
  }

  return (
    <div className="flex-1 pt-10">
      <div>
        {followingUsers.map((followingUser) => (
          <div
            className="truncate text-ellipsis"
            key={followingUser.followeeId}
          >
            {followingUser.followeeId}
          </div>
        ))}
      </div>
    </div>
  );
}
