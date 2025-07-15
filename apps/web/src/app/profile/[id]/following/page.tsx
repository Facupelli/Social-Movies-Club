import Image from "next/image";
import { FollowService } from "@/follows/follow.service";
import { FollowUserButton } from "@/users/components/follow-user-button";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const fetchFollowingUsers = async (userId: string) => {
  const followService = new FollowService();
  const followingUsers = await followService.getFollowingUsers(userId);
  return followingUsers;
};

function showFollowButton(
  sessionUserId: string,
  profileUserId: string,
  followeeId: string
) {
  const isSessionUserProfile = sessionUserId === profileUserId;
  const isSameUser = sessionUserId === followeeId;

  return !isSessionUserProfile && !isSameUser;
}

export default async function FollowingPage(
  props: Readonly<{
    params: Promise<{ id: string }>;
  }>
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const params = await props.params;
  const profileUserId = params.id;

  const followingUsers = await fetchFollowingUsers(profileUserId);

  if (followingUsers.length === 0) {
    return (
      <div className="flex-1 pt-10 text-neutral-500">No sigue a nadie</div>
    );
  }

  const isFollowing = false;

  return (
    <div className="flex-1 pt-10 space-y-4">
      {followingUsers.map((user) => (
        <a
          href={`/profile/${user.followeeId}`}
          className="flex justify-between"
          key={user.followeeId}
        >
          <div className="flex gap-4">
            <div className="size-[50px] rounded-full bg-secondary-foreground">
              <Image
                unoptimized
                src={user.userImage}
                width={50}
                height={50}
                className="h-auto object-cover rounded-full"
                alt={user.userName}
              />
            </div>
            <div>
              <div>{user.userName}</div>
              <div>{user.userUsername}</div>
            </div>
          </div>
          {showFollowButton(
            session.user.id,
            profileUserId,
            user.followeeId
          ) && (
            <FollowUserButton
              followedUserId={user.followeeId}
              isFollowing={isFollowing}
            >
              {isFollowing ? "Siguiendo" : "Seguir"}
            </FollowUserButton>
          )}
        </a>
      ))}
    </div>
  );
}
