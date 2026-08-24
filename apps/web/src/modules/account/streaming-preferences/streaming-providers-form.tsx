'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';
import { useActionState } from 'react';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import type {
  SelectedStreamingProvider,
  StreamingPreferencesSettings,
} from './streaming-preferences.types';
import { setStreamingProviders } from './update-streaming-providers';

const INITIAL_STATE: ApiResponse<{ providerIds: string[] }> = {
  success: false,
  error: '',
};

type ProviderOption = {
  id: string;
  name: string;
  logoPath: string | null;
  inCatalogue: boolean;
};

function buildProviderOptions(
  availableProviders: StreamingPreferencesSettings['availableProviders'],
  selectedProviders: SelectedStreamingProvider[]
): ProviderOption[] {
  const options = new Map<string, ProviderOption>();

  for (const provider of availableProviders) {
    options.set(provider.id, {
      id: provider.id,
      name: provider.name,
      logoPath: provider.logoPath,
      inCatalogue: true,
    });
  }

  for (const provider of selectedProviders) {
    if (!options.has(provider.id)) {
      options.set(provider.id, {
        id: provider.id,
        name: provider.name,
        logoPath: provider.logoPath,
        inCatalogue: false,
      });
    }
  }

  return [...options.values()];
}

export function StreamingProviderLogo({
  name,
  logoPath,
}: {
  name: string;
  logoPath: string | null;
}) {
  if (!logoPath) {
    return (
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground text-xs">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      alt=""
      className="size-[30px] shrink-0 rounded-sm object-contain"
      height={30}
      src={`https://image.tmdb.org/t/p/w92${logoPath}`}
      unoptimized
      width={30}
    />
  );
}

export function StreamingProvidersForm({
  availableProviders,
  selectedProviders,
  selectedProviderIds,
  onSaved,
}: {
  availableProviders: StreamingPreferencesSettings['availableProviders'];
  selectedProviders: SelectedStreamingProvider[];
  selectedProviderIds: string[];
  onSaved?: () => void;
}) {
  const [state, action] = useActionState(
    async (
      previousState: ApiResponse<{ providerIds: string[] }>,
      formData: FormData
    ) => {
      const result = await setStreamingProviders(previousState, formData);

      if (result.success) {
        onSaved?.();
      }

      return result;
    },
    INITIAL_STATE
  );
  const options = buildProviderOptions(availableProviders, selectedProviders);

  return (
    <form action={action} className="flex flex-col">
      <ul
        aria-label="Plataformas de streaming"
        className="divide-border divide-y border-border border-y"
      >
        {options.map((provider) => (
          <li key={provider.id}>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 px-2 py-2 transition-colors has-[input:checked]:bg-primary-subtle has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:outline-none">
              <input
                className="peer sr-only"
                defaultChecked={selectedProviderIds.includes(provider.id)}
                name="providerId"
                type="checkbox"
                value={provider.id}
              />
              <StreamingProviderLogo
                logoPath={provider.logoPath}
                name={provider.name}
              />
              <span className="flex-1">
                <span className="block font-medium text-sm peer-checked:text-foreground">
                  {provider.name}
                </span>
                {!provider.inCatalogue && (
                  <span className="block text-muted-foreground text-xs">
                    No aparece actualmente en el catálogo de Argentina
                  </span>
                )}
              </span>
              <Check className="invisible size-4 shrink-0 text-primary peer-checked:visible" />
            </label>
          </li>
        ))}
      </ul>

      {!state.success && state.error && (
        <p aria-live="polite" className="text-destructive pt-2 text-sm">
          {state.error}
        </p>
      )}

      <SubmitButton
        className="mt-4 h-10 w-full text-sm"
        loadingText="Guardando..."
      >
        Guardar
      </SubmitButton>
    </form>
  );
}
