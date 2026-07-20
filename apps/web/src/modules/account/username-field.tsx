import {
  USERNAME_INPUT_PATTERN,
  USERNAME_MAX_LENGTH,
  getUsernameHandle,
} from '@/modules/account/username-policy';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function UsernameField({
  currentUsername,
  error,
}: {
  currentUsername?: string | null;
  error?: string;
}) {
  const descriptionId = 'username-description';
  const errorId = 'username-error';

  return (
    <div className="space-y-1.5">
      <Label htmlFor="username">Nombre de usuario</Label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm"
        >
          @
        </span>
        <Input
          aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
          aria-invalid={Boolean(error)}
          autoCapitalize="none"
          autoComplete="username"
          className="pl-7"
          defaultValue={
            currentUsername ? getUsernameHandle(currentUsername) : undefined
          }
          id="username"
          maxLength={USERNAME_MAX_LENGTH + 1}
          name="username"
          pattern={USERNAME_INPUT_PATTERN}
          required
          spellCheck={false}
          title="Usa entre 3 y 30 letras, números o guiones bajos. El primer carácter debe ser una letra o un número."
          type="text"
        />
      </div>
      <p className="text-muted-foreground text-xs" id={descriptionId}>
        Entre 3 y 30 caracteres. Usa letras, números o guiones bajos.
      </p>
      {error && (
        <p className="text-destructive text-sm" id={errorId} role="alert">
          {error === 'Unauthorized' ? 'Debes iniciar sesión.' : error}
        </p>
      )}
    </div>
  );
}
