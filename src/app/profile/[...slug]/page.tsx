import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { MovieView } from '@/components/movies/movie-card';
import { FollowService } from '@/follows/follow.service';
import { auth } from '@/lib/auth';
import { dbMovieToView } from '@/movies/movie.adapters';
import { FollowUserButton } from '@/users/components/follow-user-button';
import { UserService } from '@/users/user.service';
import { ProfileClientPage } from './page.client';

export type SortBy = 'score' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

const fetchPageData = async (
  sessionUserId: string,
  profileUserId: string,
  searchParams: { sortBy?: SortBy; sortOrder?: SortOrder }
) => {
  const followService = new FollowService();
  const userService = new UserService();

  const profileUserPromise = await userService.getUser(profileUserId);
  const profileRatingsPromise = await userService.getUserRatingMovies(
    profileUserId,
    searchParams.sortBy,
    searchParams.sortOrder
  );
  const isFollowingUserPromise = followService.isFollowingUser(
    sessionUserId,
    profileUserId
  );

  const [profileUser, profileRatings, isFollowing] = await Promise.all([
    profileUserPromise,
    profileRatingsPromise,
    isFollowingUserPromise,
  ]);

  const profileMovies: MovieView[] = profileRatings.map(dbMovieToView);

  return {
    profileUser,
    profileMovies,
    isFollowing,
  };
};

export default async function UserProfilePage(props: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ sortBy?: SortBy; sortOrder?: SortOrder }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const params = await props.params;
  const searchParams = await props.searchParams;

  const profileUserId = params.slug[0];
  const tab = params.slug[1];

  const { profileUser, profileMovies, isFollowing } = await fetchPageData(
    session.user.id,
    profileUserId,
    searchParams
  );

  if (!profileUser) {
    redirect('/');
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
            {profileUser.image && (
              <div className="shrink-0">
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
            {session.user.id !== profileUser.id && (
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
              32{' '}
              <span className="font-normal text-neutral-500">Seguidores</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-neutral-500 border-b pt-2">
          <Link
            className={clsx(
              !tab && 'border-blue-400 border-b-3 font-bold',
              'pb-2'
            )}
            href={`/profile/${profileUser.id}/`}
          >
            Películas
          </Link>
          <Link
            className={clsx(
              tab === 'following' && 'border-blue-400 border-b-3 font-bold',
              'pb-2'
            )}
            href={`/profile/${profileUser.id}/following`}
          >
            Siguiendo
          </Link>
        </div>

        <RenderActiveTab
          profileMovies={profileMovies}
          sessionUserId={session.user.id}
          tab={tab}
        />
      </div>
    </div>
  );
}

function RenderActiveTab({
  tab,
  sessionUserId,
  profileMovies,
}: {
  tab: string | undefined;
  sessionUserId: string;
  profileMovies: MovieView[];
}) {
  if (!tab) {
    return <ProfileClientPage profileMovies={profileMovies} />;
  }

  if (tab === 'following') {
    return (
      <Suspense fallback={<div className="pt-10">Loading...</div>}>
        <FollowingUsersList userId={sessionUserId} />
      </Suspense>
    );
  }
}

const fetchFollowingUsers = async (userId: string) => {
  const followService = new FollowService();
  const followingUsers = await followService.getFollowingUsers(userId);
  return followingUsers;
};

async function FollowingUsersList({ userId }: { userId: string }) {
  const followingUsers = await fetchFollowingUsers(userId);

  return (
    <div className="flex-1 pt-10">
      <div>
        {followingUsers.map((followingUser) => (
          <div
            className="truncate text-ellipsis"
            key={followingUser.followeeId}
          >
            {followingUser.followeeId}
          </div>
        ))}
      </div>
    </div>
  );
}
