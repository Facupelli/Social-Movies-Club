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

  if (installPrompt) {
    const promptInstallation = async () => {
      // A browser install event can only be prompted once, even if dismissed.
      setInstallPrompt(null);
      try {
        await installPrompt.prompt();
      } catch {
        // The browser can invalidate the prompt before it is used.
      }
    };

    return (
      <Button
        className="min-h-11"
        onClick={promptInstallation}
        size="lg"
        type="button"
        variant="outline"
      >
        <Download aria-hidden="true" /> Instalá QueVes
      </Button>
    );
  }

  if (!supportsAppleInstructions) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="min-h-11" size="lg" type="button" variant="outline">
          <Download aria-hidden="true" /> Instalá QueVes
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Instalá QueVes</DialogTitle>
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
            Si aparece <strong>Abrir como app web</strong>, activalo. Después
            tocá <strong>Agregar</strong>.
          </li>
        </ol>
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
