import { ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ProfileNav from '@/components/profile-nav';
import { FollowService } from '@/follows/follow.service';
import { auth } from '@/lib/auth';
import { FollowUserButton } from '@/users/components/follow-user-button';
import { UserService } from '@/users/user.service';

export default async function ProfileLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ id: string }>;
  }>
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const params = await props.params;
  const profileUserId = params.id;

  return (
    <div>
      <div className="bg-card px-2 py-2 md:px-10">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </div>

      <div className="px-4 md:px-10">
        <UserInfo
          profileUserId={profileUserId}
          sessionUserId={session.user.id}
        />

        <ProfileNav userId={profileUserId} />

        {props.children}
      </div>
    </div>
  );
}

async function getUserInfo(profileUserId: string, sessionUserId: string) {
  const userService = new UserService();
  const followService = new FollowService();

  const profileUserPromise = userService.getUser(profileUserId);
  const isFollowingUserPromise = followService.isFollowingUser(
    sessionUserId,
    profileUserId
  );

  const [profileUser, isFollowing] = await Promise.all([
    profileUserPromise,
    isFollowingUserPromise,
  ]);

  return { profileUser, isFollowing };
}

async function UserInfo({
  profileUserId,
  sessionUserId,
}: {
  profileUserId: string;
  sessionUserId: string;
}) {
  const { isFollowing, profileUser } = await getUserInfo(
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
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </FollowUserButton>
          </div>
        )}
      </div>
      <div>
        <p className="font-bold">{profileUser.name}</p>
      </div>
      <div className="flex items-center gap-2 font-bold text-sm">
        <p>
          10 <span className="font-normal text-neutral-500">Siguiendo</span>
        </p>
        <p>
          32 <span className="font-normal text-neutral-500">Seguidores</span>
        </p>
      </div>
    </div>
  );
}
