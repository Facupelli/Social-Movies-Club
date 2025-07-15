import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function CreditsPage() {
  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-background/80 to-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl text-slate-900 dark:text-slate-100">
            Credits & Attribution
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Acknowledgments for the services that power this application
          </p>
        </div>

        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="w-full rounded-xl bg-slate-50 p-6 dark:bg-slate-700/50">
                <Image
                  alt="The Movies Database logo"
                  className="mx-auto mb-4 h-auto object-contain"
                  height={40}
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
                  unoptimized
                  width={240}
                />
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed dark:text-slate-300">
                    This product uses the TMDb API but is not endorsed or
                    certified by TMDb.
                  </p>
                  <div className="flex flex-col items-center justify-center md:flex-row md:gap-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Learn more about TMDb at
                    </span>
                    <a
                      className="inline-flex items-center gap-1 font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      href="https://www.themoviedb.org"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      themoviedb.org
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm dark:text-slate-400">
            Thank you to all the services and contributors that make this app
            possible
          </p>
        </div>
      </div>
    </div>
  );
}
