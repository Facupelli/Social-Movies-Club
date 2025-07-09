import { ArrowLeft } from 'lucide-react';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { tryCatch } from '@/lib/utils';
import { FollowUserButton } from '@/users/components/follow-user-button';
import { UserService } from '@/users/user.service';
import { ProfileClientPage } from './page.client';

const fetchUserById = async (userId: ObjectId) => {
  const userService = new UserService();
  return await userService.getUser(userId);
};

const fetchAuthUserById = async (userId: ObjectId) => {
  const userService = new UserService();
  return await userService.getAuthUser(userId);
};

const isFollowingUser = async (userId: ObjectId, followedUserId: ObjectId) => {
  const userService = new UserService();
  return await userService.isFollowingUser(userId, followedUserId);
};

export default async function UserProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const params = await props.params;

  const currentUserIdResult = await tryCatch<ObjectId>(
    new Promise((resolve) => resolve(new ObjectId(session.user.id)))
  );
  const userIdResult = await tryCatch<ObjectId>(
    new Promise((resolve) => resolve(new ObjectId(params.id)))
  );

  if (userIdResult.error || currentUserIdResult.error) {
    return notFound();
  }

  const userPromise = fetchUserById(userIdResult.data);
  const authUserPromise = fetchAuthUserById(userIdResult.data);
  const isFollowingPromise = isFollowingUser(
    currentUserIdResult.data,
    userIdResult.data
  );

  const [user, authUser, isFollowing] = await Promise.all([
    userPromise,
    authUserPromise,
    isFollowingPromise,
  ]);

  if (!(user && authUser)) {
    return notFound();
  }

  return (
    <div className="flex-1 bg-neutral-300">
      <div className="bg-neutral-500 px-10 py-2">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </div>

      <div className="grid gap-2 px-10 py-4">
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
        <div className="font-bold text-sm">
          <p>
            10 <span className="font-normal text-neutral-500">Following</span>
          </p>
          <p>
            32 <span className="font-normal text-neutral-500">Followers</span>
          </p>
        </div>
      </div>

      <ProfileClientPage appUser={user} />
    </div>
  );
}
