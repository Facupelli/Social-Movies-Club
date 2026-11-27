import { ChevronRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { profileIdSchema } from '@/modules/profiles/profile-id';
import { FollowUserButton } from '@/modules/social/follow-user/follow-user-button';
import { listFollowingUsers } from '@/modules/social/list-following/list-following';
import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';

export function shouldShowFollowButton(
  viewerUserId: string,
  rowUserId: string
): boolean {
  return viewerUserId !== rowUserId;
}

export default async function FollowingPage(
  props: Readonly<{
    params: Promise<{ id: string }>;
  }>
) {
  const [session, params] = await Promise.all([
    getServerSession(),
    props.params,
  ]);

  if (!session) {
    redirect('/app');
  }

  const profileUserId = profileIdSchema.safeParse(params.id);
  if (!profileUserId.success) {
    notFound();
  }

  const viewerUserId = session.user.id;
  const followingUsersResult = await execute(() =>
    listFollowingUsers({
      profileUserId: profileUserId.data,
      viewerUserId,
    })
  );

  if (!followingUsersResult.success) {
    return <section className="py-10">{followingUsersResult.error}</section>;
  }

  const isOwnProfile = viewerUserId === profileUserId.data;

  return (
    <section className="flex-1 space-y-2 pt-4">
      {isOwnProfile && (
        <Link
          className="flex min-h-11 items-center gap-3 rounded-sm bg-card px-3 py-2 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/users"
        >
          <Search aria-hidden="true" className="size-5 text-primary" />
          <span className="flex-1 font-medium text-sm">Buscar personas</span>
          <ChevronRight
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </Link>
      )}

      {followingUsersResult.data.length === 0 ? (
        <p className="text-muted-foreground">
          {isOwnProfile ? 'No sigues a nadie' : 'Esta persona no sigue a nadie'}
        </p>
      ) : (
        <ul>
          {followingUsersResult.data.map((user) => (
            <li
              className="relative flex items-center justify-between gap-2 py-1.5 not-last:after:absolute not-last:after:start-14 not-last:after:end-0 not-last:after:bottom-0 not-last:after:h-px not-last:after:bg-border/60"
              key={user.followeeId}
            >
              <Link
                aria-label={`Ver el perfil de ${user.userName}`}
                className="flex min-w-0 items-center gap-3 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={`/profile/${user.followeeId}`}
              >
                <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground">
                  {user.userImage ? (
                    <Image
                      alt=""
                      className="size-full object-cover"
                      height={44}
                      src={user.userImage}
                      width={44}
                    />
                  ) : (
                    <span aria-hidden="true" className="font-medium">
                      {user.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 wrap-anywhere">
                  <div className="font-medium text-sm">{user.userName}</div>
                  {user.userUsername && (
                    <div className="text-muted-foreground text-xs">
                      {user.userUsername}
                    </div>
                  )}
                </div>
              </Link>
              {shouldShowFollowButton(viewerUserId, user.followeeId) && (
                <div className="max-w-1/2 shrink-0 text-right">
                  <FollowUserButton
                    followedUserId={user.followeeId}
                    isFollowing={user.isFollowing}
                    triggerClassName="text-xs"
                    userName={user.userName}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
