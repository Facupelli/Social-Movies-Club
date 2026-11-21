'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

type InstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type AppleNavigator = Navigator & { standalone?: boolean };

const appleMobilePattern = /iPhone|iPad|iPod/;

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );
  const [supportsAppleInstructions, setSupportsAppleInstructions] =
    useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)');
    const appleNavigator: AppleNavigator = navigator;
    const { userAgent, maxTouchPoints } = navigator;

    const updateDisplayMode = () => {
      setIsStandalone(standalone.matches || appleNavigator.standalone === true);
    };

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    standalone.addEventListener('change', updateDisplayMode);
    updateDisplayMode();
    setSupportsAppleInstructions(
      appleMobilePattern.test(userAgent) ||
        (userAgent.includes('Macintosh') && maxTouchPoints > 1)
    );

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      standalone.removeEventListener('change', updateDisplayMode);
    };
  }, []);

  if (isStandalone || installed) {
    return null;
  }

  return (
    <Dialog onOpenChange={setShowInstructions} open={showInstructions}>
      <DialogTrigger asChild>
        <Button
          className="min-h-11"
          onClick={async (event) => {
            if (!installPrompt) {
              return;
            }

            event.preventDefault();
            // A browser install event can only be prompted once, even if dismissed.
            setInstallPrompt(null);
            try {
              await installPrompt.prompt();
            } catch {
              setShowInstructions(true);
            }
          }}
          size="lg"
          type="button"
          variant="outline"
        >
          <Download aria-hidden="true" /> Instalá QueVes
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Instalá QueVes</DialogTitle>
        {supportsAppleInstructions ? (
          <>
            <DialogDescription>
              En tu iPhone o iPad, abrí QueVes en Safari y seguí estos pasos:
            </DialogDescription>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>
                Tocá <strong>Compartir</strong>.
              </li>
              <li>
                Elegí <strong>Agregar a inicio</strong>.
              </li>
              <li>
                Si aparece <strong>Abrir como app web</strong>, activalo.
                Después tocá <strong>Agregar</strong>.
              </li>
            </ol>
          </>
        ) : (
          <DialogDescription>
            Buscá en el menú de tu navegador una opción como{' '}
            <strong>Instalar app</strong> o{' '}
            <strong>Agregar a la pantalla de inicio</strong>. Si no aparece,
            podés seguir usando QueVes desde el navegador.
          </DialogDescription>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button className="min-h-11" type="button" variant="outline">
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
