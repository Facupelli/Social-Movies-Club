'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import { useDeferredValue, useState } from 'react';
import { completeOnboarding } from '@/modules/account/complete-onboarding/complete-onboarding';
import useDebounce from '@/modules/media-catalog/search-media/use-debounce';
import {
  MIN_PROFILE_SEARCH_QUERY_LENGTH,
  normalizeProfileSearchQuery,
} from '@/modules/profiles/search-profiles/profile-search-query';
import { OnboardingFollowButton } from '@/modules/social/follow-user/onboarding-follow-button';
import { useSearchUsers } from '@/modules/social/search-users/use-search-users';
import { authClient } from '@/platform/auth/auth-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

export default function OnboardingPeoplePage() {
  const { data: session } = authClient.useSession();
  const viewerUserId = session?.user.id ?? '';

  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const followCount = followedIds.size;
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const debouncedQuery = useDebounce(deferredQuery, 400);

  const normalizedQuery = normalizeProfileSearchQuery(query);
  const normalizedDebounced = normalizeProfileSearchQuery(debouncedQuery);
  const { data: users, isLoading } = useSearchUsers(
    viewerUserId,
    normalizedDebounced
  );

  const showResults =
    normalizedQuery.length >= MIN_PROFILE_SEARCH_QUERY_LENGTH &&
    normalizedQuery === normalizedDebounced;

  const handleToggle = (userId: string, isNowFollowing: boolean) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isNowFollowing) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 py-6 md:px-8">
      <div className="shrink-0">
        <h1 className="font-bold text-xl tracking-tight">
          Encontrá gente que conozcas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seguí amigos para recibir recomendaciones basadas en lo que ellos ven.
        </p>
      </div>

      {followCount > 0 && (
        <p className="mt-4 shrink-0 font-medium text-primary text-sm">
          {followCount}{' '}
          {followCount === 1 ? 'persona seguida' : 'personas seguidas'}
        </p>
      )}

      <div className="relative mt-5 shrink-0">
        <Search
          aria-hidden="true"
          className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-muted-foreground"
        />
        <Input
          aria-label="Buscar usuario por su @"
          className="h-12 pl-11 text-base"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuario por su @"
          type="search"
          value={query}
        />
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-3">
        {!showResults &&
          query.length > 0 &&
          query.length < MIN_PROFILE_SEARCH_QUERY_LENGTH && (
            <p className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              Escribí al menos {MIN_PROFILE_SEARCH_QUERY_LENGTH} caracteres para
              buscar.
            </p>
          )}

        {!showResults && query.length === 0 && (
          <p className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            Buscá por @nombre de usuario.
          </p>
        )}

        {showResults && isLoading && <PeopleSearchSkeleton />}

        {showResults && !isLoading && users && users.length === 0 && (
          <p className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            No se encontraron resultados para &ldquo;{normalizedDebounced}
            &rdquo;.
          </p>
        )}

        {showResults && !isLoading && users && users.length > 0 && (
          <ul className="space-y-2 pr-1">
            {users.map((user) => (
              <li
                className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                key={user.id}
              >
                <div className="shrink-0 rounded-full bg-secondary-foreground">
                  {user.image ? (
                    <Image
                      alt={user.name}
                      className="size-10 rounded-full object-cover"
                      height={40}
                      src={user.image}
                      unoptimized
                      width={40}
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <span className="font-medium text-muted-foreground text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{user.name}</p>
                  {user.username && (
                    <p className="truncate text-muted-foreground text-xs">
                      @
                      {user.username.startsWith('@')
                        ? user.username.slice(1)
                        : user.username}
                    </p>
                  )}
                </div>

                <OnboardingFollowButton
                  followedUserId={user.id}
                  isFollowing={followedIds.has(user.id)}
                  onToggle={(isNowFollowing) =>
                    handleToggle(user.id, isNowFollowing)
                  }
                  userName={user.username ?? user.name}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 space-y-3 pt-4">
        <Button className="h-12 w-full text-base" onClick={handleComplete}>
          Continuar
        </Button>
        <button
          className="w-full text-center text-muted-foreground text-sm hover:text-foreground"
          onClick={handleComplete}
          type="button"
        >
          Omitir
        </button>
      </div>
    </section>
  );
}

function PeopleSearchSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
