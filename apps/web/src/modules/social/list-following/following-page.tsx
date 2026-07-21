import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import z from 'zod';
import { FollowUserButton } from '@/modules/social/follow-user/follow-user-button';
import { listFollowingUsers } from '@/modules/social/list-following/list-following';
import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';

const profileIdSchema = z.uuid();

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
    redirect('/');
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

  if (followingUsersResult.data.length === 0) {
    return (
      <div className="flex-1 pt-10 text-neutral-500">
        {viewerUserId === profileUserId.data
          ? 'No sigues a nadie'
          : 'Esta persona no sigue a nadie'}
      </div>
    );
  }

  return (
    <section className="flex-1 space-y-4 pt-10">
      {followingUsersResult.data.map((user) => (
        <div className="flex justify-between" key={user.followeeId}>
          <Link
            aria-label={`Ver el perfil de ${user.userName}`}
            className="flex gap-4"
            href={`/profile/${user.followeeId}`}
          >
            <div className="flex size-[50px] items-center justify-center overflow-hidden rounded-full bg-secondary-foreground">
              {user.userImage ? (
                <Image
                  alt={`Foto de perfil de ${user.userName}`}
                  className="size-full object-cover"
                  height={50}
                  src={user.userImage}
                  unoptimized
                  width={50}
                />
              ) : (
                <span aria-hidden="true" className="font-semibold">
                  {user.userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div>{user.userName}</div>
              {user.userUsername && <div>{user.userUsername}</div>}
            </div>
          </Link>
          {shouldShowFollowButton(viewerUserId, user.followeeId) && (
            <FollowUserButton
              followedUserId={user.followeeId}
              isFollowing={user.isFollowing}
              userName={user.userName}
            />
          )}
        </div>
      ))}
    </section>
  );
}
