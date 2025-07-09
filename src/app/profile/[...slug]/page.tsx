import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { tryCatch } from '@/lib/utils';
import { FollowUserButton } from '@/users/components/follow-user-button';
import { UserService } from '@/users/user.service';
import type { UserViewModel } from '@/users/user.types';
import { ProfileClientPage } from './page.client';

const fetchFollowingUsers = async (userId: ObjectId) => {
  const userService = new UserService();
  const followingUsers = await userService.getFollowingUsers(userId);
  return followingUsers;
};

const fetchPageData = async (userId: ObjectId, followedUserId: ObjectId) => {
  const userService = new UserService();
  const isFollowingUserPromise = userService.isFollowingUser(
    userId,
    followedUserId
  );
  const authUserPromise = userService.getAuthUser(userId);
  const userPromise = userService.getUser(userId);

  const [isFollowing, authUser, user] = await Promise.all([
    isFollowingUserPromise,
    authUserPromise,
    userPromise,
  ]);

  return {
    isFollowing,
    authUser,
    user,
  };
};

export default async function UserProfilePage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const params = await props.params;

  const paramId = params.slug[0];
  const tab = params.slug[1];

  const currentUserIdResult = await tryCatch<ObjectId>(
    new Promise((resolve) => resolve(new ObjectId(session.user.id)))
  );
  const userIdResult = await tryCatch<ObjectId>(
    new Promise((resolve) => resolve(new ObjectId(paramId)))
  );

  if (userIdResult.error || currentUserIdResult.error) {
    return notFound();
  }

  const { isFollowing, user, authUser } = await fetchPageData(
    currentUserIdResult.data,
    userIdResult.data
  );

  if (!(user && authUser)) {
    return notFound();
  }

  return (
    <div className="flex-1 bg-neutral-300 ">
      <div className="bg-neutral-500 px-10 py-2">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </div>

      <div className="px-10">
        <div className="grid gap-2 py-4">
          <div className="flex items-center justify-between">
            {authUser.image && (
              <div className="shrink-0">
                <Image
                  alt={authUser.name}
                  className="size-[100px] rounded-full object-cover"
                  height={100}
                  src={authUser.image}
                  unoptimized
                  width={100}
                />
              </div>
            )}
            {session.user.id !== user.id && (
              <div>
                <FollowUserButton
                  followedUserId={user.id}
                  isFollowing={isFollowing}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </FollowUserButton>
              </div>
            )}
          </div>
          <div>
            <p className="font-bold">{authUser.name}</p>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm">
            <p>
              10 <span className="font-normal text-neutral-500">Following</span>
            </p>
            <p>
              32 <span className="font-normal text-neutral-500">Followers</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-neutral-500 border-b pt-2">
          <Link
            className={clsx(
              !tab && 'border-blue-400 border-b-3 font-bold',
              'pb-2'
            )}
            href={`/profile/${user.id}/`}
          >
            Movies
          </Link>
          <Link
            className={clsx(
              tab === 'following' && 'border-blue-400 border-b-3 font-bold',
              'pb-2'
            )}
            href={`/profile/${user.id}/following`}
          >
            Following
          </Link>
        </div>

        <RenderActiveTab tab={tab} user={user} userId={userIdResult.data} />
      </div>
    </div>
  );
}

function RenderActiveTab({
  tab,
  userId,
  user,
}: {
  tab: string | undefined;
  userId: ObjectId;
  user: UserViewModel | null;
}) {
  if (!tab) {
    return <ProfileClientPage appUser={user} />;
  }

  if (tab === 'following') {
    return (
      <Suspense fallback={<div className="pt-10">Loading...</div>}>
        <FollowingUsersList userId={userId} />
      </Suspense>
    );
  }
}

async function FollowingUsersList({ userId }: { userId: ObjectId }) {
  const followingUsers = await fetchFollowingUsers(userId);
  return (
    <div className="flex-1 pt-10">
      <div>
        {followingUsers.map((followingUser) => (
          <div
            className="truncate text-ellipsis"
            key={followingUser._id.toHexString()}
          >
            {followingUser._id.toHexString()}
          </div>
        ))}
      </div>
    </div>
  );
}
