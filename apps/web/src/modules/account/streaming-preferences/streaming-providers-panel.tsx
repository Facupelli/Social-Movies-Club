'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import type {
  SelectedStreamingProvider,
  StreamingPreferencesSettings,
} from './streaming-preferences.types';
import {
  StreamingProviderLogo,
  StreamingProvidersForm,
} from './streaming-providers-form';

function SavedStreamingProviders({
  selectedProviders,
}: {
  selectedProviders: SelectedStreamingProvider[];
}) {
  return (
    <ul
      aria-label="Tus plataformas"
      className="divide-border divide-y border-border border-y"
    >
      {selectedProviders.map((provider) => (
        <li className="flex min-h-14 items-center gap-3 py-2" key={provider.id}>
          <StreamingProviderLogo
            logoPath={provider.logoPath}
            name={provider.name}
          />
          <span className="flex-1 font-medium text-sm">{provider.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function StreamingProvidersPanel({
  availableProviders,
  selectedProviders,
  selectedProviderIds,
}: {
  availableProviders: StreamingPreferencesSettings['availableProviders'];
  selectedProviders: SelectedStreamingProvider[];
  selectedProviderIds: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const showSummary = !isEditing && selectedProviders.length > 0;

  if (showSummary) {
    return (
      <div className="pt-6">
        <h2 className="text-subtle-foreground text-xs uppercase">
          Tus plataformas
        </h2>
        <div className="pt-3">
          <SavedStreamingProviders selectedProviders={selectedProviders} />
        </div>
        <Button
          className="mt-4 h-10 w-full text-sm"
          onClick={() => setIsEditing(true)}
          variant="outline"
        >
          Editar plataformas
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-6">
      <h2 className="text-subtle-foreground text-xs uppercase">
        Plataformas disponibles
      </h2>
      <StreamingProvidersForm
        availableProviders={availableProviders}
        onSaved={() => setIsEditing(false)}
        selectedProviderIds={selectedProviderIds}
        selectedProviders={selectedProviders}
      />
      {selectedProviders.length > 0 && (
        <Button
          className="mt-2 h-10 w-full text-muted-foreground text-sm"
          onClick={() => setIsEditing(false)}
          variant="ghost"
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}
