'use client';

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
    <nav className="flex h-[60px] w-full items-center gap-2 px-10">
      {session ? (
        <>
          <p>Hello {session.user.name}</p>
          <Button onClick={handleLogOut} type="button">
            Sign Out
          </Button>
        </>
      ) : (
        <Button onClick={handleSignIn} type="button">
          Sign In
        </Button>
      )}
    </nav>
  );
}
