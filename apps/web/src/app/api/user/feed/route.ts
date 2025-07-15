import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserService } from "@/users/user.service";
import { validateGetUserFeedQuery } from "@/users/user-validation.service";
import type { FeedItem } from "@/users/user.types";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const { searchParams } = new URL(request.url);
  const { cursor } = validateGetUserFeedQuery(searchParams);

  const userService = new UserService();

  const res: { items: FeedItem[]; nextCursor: string | null } =
    await userService.getFeed({
      userId: session.user.id,
      cursor,
    });
  return Response.json(res);
}
