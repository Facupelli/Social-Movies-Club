import { ArrowLeft, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { UpsertUsernameDialog } from '@/modules/account/update-username/upsert-username-dialog';
import { AnnualViewingHistogram } from '@/modules/profiles/view-profile/annual-viewing-histogram';
import { getPublicProfile } from '@/modules/profiles/view-profile/profile';
import ProfileNav from '@/modules/profiles/view-profile/profile-nav';
import { ProfileSkeleton } from '@/modules/profiles/view-profile/profile-skeleton';
import { getAnnualViewingActivity } from '@/modules/ratings/get-annual-viewing-activity/get-annual-viewing-activity';
import { FollowUserButton } from '@/modules/social/follow-user/follow-user-button';
import { getIsFollowingUser } from '@/modules/social/get-follow-status/get-follow-status';
import { getFollowSummary } from '@/modules/social/get-follow-summary/get-follow-summary';
import { getServerSession } from '@/platform/auth/get-server-session';

const LEADING_AT_SIGN = /^@/;
const profileTopBarLinkClassName =
  'flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default async function ProfileLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ id: string }>;
  }>
) {
  const session = await getServerSession();

  const viewerId = session?.user.id;
  const params = await props.params;
  const profileUserId = params.id;

  return (
    <div className="min-h-svh">
      <div className="flex items-center justify-between px-4 py-2">
        <Link
          aria-label="Volver a Inicio"
          className={profileTopBarLinkClassName}
          href="/app"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {viewerId === profileUserId && <ProfileSettingsLink />}
      </div>

      <div className="px-4">
        <Suspense
          fallback={
            <ProfileSkeleton
              showFollowAction={Boolean(viewerId && viewerId !== profileUserId)}
            />
          }
        >
          <UserInfo profileUserId={profileUserId} sessionUserId={viewerId} />
        </Suspense>

        {viewerId && <ProfileNav userId={profileUserId} />}

        {props.children}
      </div>
    </div>
  );
}

async function getUserInfo(profileUserId: string, sessionUserId?: string) {
  const profileUserPromise = getPublicProfile(profileUserId);
  const profileFollowsInfoPromise = getFollowSummary(profileUserId);
  const annualViewingActivityPromise = getAnnualViewingActivity(profileUserId);
  const isFollowingUserPromise =
    !sessionUserId || sessionUserId === profileUserId
      ? Promise.resolve(false)
      : getIsFollowingUser(sessionUserId, profileUserId);

  const [profileUser, profileFollowsInfo, isFollowing, annualViewingActivity] =
    await Promise.all([
      profileUserPromise,
      profileFollowsInfoPromise,
      isFollowingUserPromise,
      annualViewingActivityPromise,
    ]);

  return {
    profileUser,
    profileFollowsInfo,
    isFollowing,
    annualViewingActivity,
  };
}

async function UserInfo({
  profileUserId,
  sessionUserId,
}: {
  profileUserId: string;
  sessionUserId: string | undefined;
}) {
  const {
    annualViewingActivity,
    isFollowing,
    profileFollowsInfo,
    profileUser,
  } = await getUserInfo(profileUserId, sessionUserId);

  if (!profileUser) {
    redirect('/app');
  }

  const isOwnProfile = sessionUserId === profileUser.id;
  const username = profileUser.username;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pb-4">
      <div className="col-span-full row-start-1 flex items-center gap-5 md:gap-6 lg:col-span-1">
        {profileUser.image ? (
          <Image
            alt=""
            className="size-22 shrink-0 rounded-full object-cover"
            height={88}
            priority
            src={profileUser.image}
            unoptimized
            width={88}
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-22 shrink-0 place-items-center rounded-full bg-muted font-semibold text-2xl text-muted-foreground"
          >
            {username?.replace(LEADING_AT_SIGN, '')[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <AnnualViewingHistogram {...annualViewingActivity} />
      </div>
      {(isOwnProfile || username) && (
        <h1 className="col-start-1 row-start-2 min-w-0 wrap-anywhere font-bold text-lg">
          {isOwnProfile ? (
            <UpsertUsernameDialog username={username} />
          ) : (
            username
          )}
        </h1>
      )}
      {sessionUserId && !isOwnProfile && (
        <div className="col-start-2 row-start-2 justify-self-end lg:row-start-1 lg:max-w-48">
          <FollowUserButton
            followedUserId={profileUser.id}
            isFollowing={isFollowing}
            userName={username ?? undefined}
          />
        </div>
      )}
      <div className="col-span-full row-start-3 flex items-center gap-2 font-bold text-sm">
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

function ProfileSettingsLink() {
  return (
    <Link
      aria-label="Configuración"
      className={profileTopBarLinkClassName}
      href="/settings/streaming"
    >
      <Settings className="size-5" />
    </Link>
  );
}
