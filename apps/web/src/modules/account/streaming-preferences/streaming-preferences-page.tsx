import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loadStreamingPreferencesSettings } from './load-streaming-preferences-settings';
import { StreamingCountryForm } from './streaming-country-form';
import { SUPPORTED_STREAMING_COUNTRY } from './streaming-preferences.constants';
import { StreamingProvidersPanel } from './streaming-providers-panel';

export async function StreamingPreferencesPage({ userId }: { userId: string }) {
  const settings = await loadStreamingPreferencesSettings(userId);

  return (
    <div className="min-h-svh p-4 md:px-10 md:py-6">
      <header className="flex items-center gap-2">
        <Link
          aria-label="Volver a tu perfil"
          className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`/profile/${userId}`}
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="font-bold text-xl tracking-tight">Plataformas</h1>
      </header>

      <p className="pt-2 text-muted-foreground text-sm">
        Elegí dónde ves películas y series. Usaremos estas plataformas para
        mejorar tus recomendaciones.
      </p>

      <section aria-label="País" className="pt-6">
        <h2 className="text-subtle-foreground text-xs uppercase">País</h2>
        <p className="pt-1">
          {settings.countryCode ?? SUPPORTED_STREAMING_COUNTRY.name}
        </p>
      </section>

      <CountrySection settings={settings} />
    </div>
  );
}

type Settings = Awaited<ReturnType<typeof loadStreamingPreferencesSettings>>;

function CountrySection({ settings }: { settings: Settings }) {
  if (settings.countryCode === null) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground text-sm">
          Todavía no configuraste tus plataformas.
        </p>
        <StreamingCountryForm
          countryCode={SUPPORTED_STREAMING_COUNTRY.code}
          submitLabel="Configurar plataformas"
        />
      </div>
    );
  }

  if (settings.countryCode !== SUPPORTED_STREAMING_COUNTRY.code) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground text-sm">
          La configuración de plataformas está disponible solo para{' '}
          {SUPPORTED_STREAMING_COUNTRY.name} por ahora.
        </p>
        <StreamingCountryForm
          countryCode={SUPPORTED_STREAMING_COUNTRY.code}
          submitLabel="Usar Argentina"
        />
      </div>
    );
  }

  if (
    settings.availableProviders.length === 0 &&
    settings.selectedProviders.length === 0
  ) {
    return (
      <p className="pt-6 text-muted-foreground text-sm">
        No pudimos cargar las plataformas disponibles. Probá de nuevo más tarde.
      </p>
    );
  }

  return (
    <StreamingProvidersPanel
      availableProviders={settings.availableProviders}
      selectedProviderIds={settings.selectedProviderIds}
      selectedProviders={settings.selectedProviders}
    />
  );
}
