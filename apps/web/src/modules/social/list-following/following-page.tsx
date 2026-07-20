import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FollowService } from "@/modules/social/follow-user/follow.service";
import type { GetFollowingUsers } from "@/modules/social/follows.type";
import { auth } from "@/platform/auth/auth";
import { execute } from "@/shared/http/safe-execute";
import { FollowUserButton } from "@/modules/social/follow-user/follow-user-button";

const fetchFollowingUsers = async (userId: string) => {
	const followService = new FollowService();

	return await execute<GetFollowingUsers[]>(async () => {
		const followingUsers = await followService.getFollowingUsers(userId);
		return followingUsers;
	});
};

function showFollowButton(
	sessionUserId: string,
	profileUserId: string,
	followeeId: string,
) {
	const isSessionUserProfile = sessionUserId === profileUserId;
	const isSameUser = sessionUserId === followeeId;

	return !(isSessionUserProfile || isSameUser);
}

export default async function FollowingPage(
	props: Readonly<{
		params: Promise<{ id: string }>;
	}>,
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const params = await props.params;
	const profileUserId = params.id;

	const followingUsersResult = await fetchFollowingUsers(profileUserId);

	if (!followingUsersResult.success) {
		return <div>{followingUsersResult.error}</div>;
	}

	const followingUsers = followingUsersResult.data;

	if (followingUsers.length === 0) {
		return (
			<div className="flex-1 pt-10 text-neutral-500">No sigue a nadie</div>
		);
	}

	const isFollowing = false;

	return (
		<section className="flex-1 pt-10 space-y-4">
			{followingUsers.map((user) => (
				<div className="flex justify-between" key={user.followeeId}>
					<Link className="flex gap-4" href={`/profile/${user.followeeId}`}>
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
					</Link>
					{showFollowButton(
						session.user.id,
						profileUserId,
						user.followeeId,
					) && (
						<FollowUserButton
							followedUserId={user.followeeId}
							isFollowing={isFollowing}
						/>
					)}
				</div>
			))}
		</section>
	);
}
