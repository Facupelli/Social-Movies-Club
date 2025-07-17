"use server";

import { FollowService } from "@/follows/follow.service";
import { withAuth } from "@/lib/auth-server-action.middleware";
import { validateFollowUser } from "../user-validation.service";
import { revalidateTag } from "next/cache";

export async function followUser(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  return await withAuth(async (session) => {
    const { followedUserId } = validateFollowUser(formData);

    const followService = new FollowService();
    await followService.followUser(session.user.id, followedUserId);

    revalidateTag(`is-following-user:${followedUserId}`);

    return { success: true, error: "" };
  });
}
