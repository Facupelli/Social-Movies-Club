import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { UpsertUsernameDialog } from '@/modules/account/update-username/upsert-username-dialog';
import { getPublicProfile } from '@/modules/profiles/view-profile/profile';
import ProfileNav from '@/modules/profiles/view-profile/profile-nav';
import { ProfileSkeleton } from '@/modules/profiles/view-profile/profile-skeleton';
import { FollowUserButton } from '@/modules/social/follow-user/follow-user-button';
import { getIsFollowingUser } from '@/modules/social/get-follow-status/get-follow-status';
import { getFollowSummary } from '@/modules/social/get-follow-summary/get-follow-summary';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function ProfileLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ id: string }>;
  }>
) {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
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
  const profileUserPromise = getPublicProfile(profileUserId);
  const profileFollowsInfoPromise = getFollowSummary(profileUserId);
  const isFollowingUserPromise =
    sessionUserId === profileUserId
      ? Promise.resolve(false)
      : getIsFollowingUser(sessionUserId, profileUserId);

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
    sessionUserId
  );

  if (!profileUser) {
    redirect('/');
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
              priority
              src={profileUser.image}
              unoptimized
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
        <UpsertUsernameDialog
          canEdit={sessionUserId === profileUser.id}
          username={profileUser.username}
        />
      </div>
      <div className="flex items-center gap-2 font-bold text-sm">
        <p>
          {profileFollowsInfo.followingCount}{' '}
          <span className="font-normal text-neutral-500">Siguiendo</span>
        </p>
        <p>
          {profileFollowsInfo.followerCount}{' '}
          <span className="font-normal text-neutral-500">Seguidores</span>
        </p>
      </div>
    </div>
  );
}
