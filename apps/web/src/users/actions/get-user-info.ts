import { unstable_cache } from "next/cache";
import { FollowService } from "@/follows/follow.service";
import { UserService } from "../user.service";

export function getIsFollowingUser(
  sessionUserId: string,
  profileUserId: string
) {
  const followService = new FollowService();

  return unstable_cache(
    () => followService.isFollowingUser(sessionUserId, profileUserId),
    ["is-following-user", profileUserId],
    {
      tags: ["is-following-user", `is-following-user:${profileUserId}`],
    }
  )();
}

export function getUserProfile(profileUserId: string) {
  const userService = new UserService();

  return unstable_cache(
    () => userService.getUser(profileUserId),
    ["user-profile", profileUserId],
    {
      tags: ["user-profile", `user-profile:${profileUserId}`],
    }
  )();
}
