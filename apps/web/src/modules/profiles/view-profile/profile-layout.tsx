import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileNav from "@/modules/profiles/view-profile/profile-nav";
import { ProfileSkeleton } from "@/modules/profiles/view-profile/profile-skeleton";
import { FollowService } from "@/modules/social/follow-user/follow.service";
import { getServerSession } from "@/platform/auth/get-server-session";
import {
	getIsFollowingUser,
	getUserProfile,
} from "@/modules/profiles/view-profile/get-user-info";
import { FollowUserButton } from "@/modules/social/follow-user/follow-user-button";
import { UpsertUsernameDialog } from "@/modules/account/update-username/upsert-username-dialog";

export default async function ProfileLayout(
	props: Readonly<{
		children: React.ReactNode;
		params: Promise<{ id: string }>;
	}>,
) {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	}

	const params = await props.params;
	const profileUserId = params.id;

	return (
		<div className="min-h-svh">
			<div className="bg-card px-2 py-2 md:px-10">
				<Link href="/">
					<ArrowLeft />
				</Link>
			</div>

			<div className="px-4 md:px-10">
				<Suspense fallback={<ProfileSkeleton />}>
					<UserInfo
						profileUserId={profileUserId}
						sessionUserId={session.user.id}
					/>
				</Suspense>

				<ProfileNav userId={profileUserId} />

				{props.children}
			</div>
		</div>
	);
}

async function getUserInfo(profileUserId: string, sessionUserId: string) {
	const followService = new FollowService();

	const profileUserPromise = getUserProfile(profileUserId);

	const profileFollowsInfoPromise =
		followService.getUserFollowsInfo(profileUserId);
	const isFollowingUserPromise = getIsFollowingUser(
		sessionUserId,
		profileUserId,
	);

	const [profileUser, profileFollowsInfo, isFollowing] = await Promise.all([
		profileUserPromise,
		profileFollowsInfoPromise,
		isFollowingUserPromise,
	]);

	return { profileUser, profileFollowsInfo, isFollowing };
}

async function UserInfo({
	profileUserId,
	sessionUserId,
}: {
	profileUserId: string;
	sessionUserId: string;
}) {
	const { isFollowing, profileFollowsInfo, profileUser } = await getUserInfo(
		profileUserId,
		sessionUserId,
	);

	if (!profileUser) {
		redirect("/");
	}

	return (
		<div className="grid gap-2 py-4">
			<div className="flex items-center justify-between">
				{profileUser.image && (
					<div className="shrink-0 rounded-full bg-secondary-foreground">
						<Image
							alt={profileUser.name}
							className="size-[100px] rounded-full object-cover"
							height={100}
							src={profileUser.image}
							unoptimized
							priority
							width={100}
						/>
					</div>
				)}
				{sessionUserId !== profileUser.id && (
					<div>
						<FollowUserButton
							followedUserId={profileUser.id}
							isFollowing={isFollowing}
						/>
					</div>
				)}
			</div>
			<div>
				<p className="font-bold">{profileUser.name}</p>
				<UpsertUsernameDialog username={profileUser.username} />
			</div>
			<div className="flex items-center gap-2 font-bold text-sm">
				<p>
					{profileFollowsInfo.followingCount}{" "}
					<span className="font-normal text-neutral-500">Siguiendo</span>
				</p>
				<p>
					{profileFollowsInfo.followerCount}{" "}
					<span className="font-normal text-neutral-500">Seguidores</span>
				</p>
			</div>
		</div>
	);
}
