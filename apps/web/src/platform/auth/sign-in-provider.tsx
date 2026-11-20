'use client';

import {
  createContext,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';
import { authClient } from './auth-client';

const SignInContext = createContext<{
  isPending: boolean;
  failedButtonId: string | null;
  signIn: (buttonId: string) => Promise<void>;
} | null>(null);

export function SignInProvider({ children }: { children: ReactNode }) {
  const [isPending, setIsPending] = useState(false);
  const [failedButtonId, setFailedButtonId] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    function resetOnRestore(event: PageTransitionEvent) {
      if (event.persisted) {
        inFlight.current = false;
        setIsPending(false);
      }
    }

    window.addEventListener('pageshow', resetOnRestore);
    return () => window.removeEventListener('pageshow', resetOnRestore);
  }, []);

  async function signIn(buttonId: string) {
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;
    setFailedButtonId(null);
    setIsPending(true);

    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL: '/error',
        newUserCallbackURL: '/onboarding/username',
        disableRedirect: true,
      });

      if (!error && data?.url) {
        window.location.assign(data.url);
        return;
      }
    } catch {
      // Network errors can throw rather than return an error response.
    }

    inFlight.current = false;
    setIsPending(false);
    setFailedButtonId(buttonId);
  }

  return (
    <SignInContext value={{ isPending, failedButtonId, signIn }}>
      <output className="sr-only">
        {isPending ? 'Iniciando sesión…' : ''}
      </output>
      {children}
    </SignInContext>
  );
}

export function useSignIn() {
  const context = use(SignInContext);
  if (!context) {
    throw new Error('useSignIn must be used within SignInProvider');
  }
  return context;
}
