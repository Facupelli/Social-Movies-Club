'use client';

import { Loader2 } from 'lucide-react';
import { useId } from 'react';
import { useSignIn } from '@/platform/auth/sign-in-provider';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utilities/utils';

type SignInButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  'variant' | 'size' | 'className'
> & {
  label?: string;
};

export default function SignInButton({
  label = 'Ingresar',
  size,
  variant,
  className,
}: SignInButtonProps) {
  const { isPending, failedButtonId, signIn } = useSignIn();
  const buttonId = useId();

  return (
    <div>
      <Button
        className={cn('grid place-items-center px-4', className)}
        disabled={isPending}
        onClick={() => signIn(buttonId)}
        size={size}
        type="button"
        variant={variant}
      >
        <span
          className={cn(
            'col-start-1 row-start-1 flex items-center gap-2',
            !isPending && 'invisible'
          )}
        >
          {isPending ? (
            <Loader2
              aria-hidden="true"
              className="size-4 motion-safe:animate-spin"
            />
          ) : (
            <span className="size-4" />
          )}
          {label}
        </span>
        {!isPending && <span className="col-start-1 row-start-1">{label}</span>}
      </Button>
      <div role="alert">
        {failedButtonId === buttonId && (
          <p className="mt-2 text-muted-foreground text-sm">
            No pudimos iniciar sesión. Volvé a intentar.
          </p>
        )}
      </div>
    </div>
  );
}
