'use client';

import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';

export function Nav() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    // refetch, //refetch the session
  } = authClient.useSession();

  console.log({ session, isPending, error });

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
      errorCallbackURL: '/error',
      newUserCallbackURL: '/welcome',
      // disableRedirect: true,
    });
  };

  const handleLogOut = async () => {
    await authClient.signOut();
  };

  return (
    <nav className="sticky top-0 left-0 flex h-screen w-[250px] flex-col p-8">
      <ul className="grid gap-4">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href={`/profile/${session?.user.id}`}>Profile</a>
        </li>
      </ul>

      <div className="mt-auto ">
        {session ? (
          <div>
            <div className="flex items-center gap-2 pb-4">
              {session.user.image && (
                <div className="shrink-0">
                  <Image
                    alt={session.user.name}
                    className="size-[30px] rounded-full object-cover"
                    height={30}
                    src={session.user.image}
                    unoptimized
                    width={30}
                  />
                </div>
              )}
              <div className="text-sm">
                <p>{session.user.name}</p>
              </div>
            </div>
            <Button onClick={handleLogOut} type="button">
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={handleSignIn} type="button">
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}
