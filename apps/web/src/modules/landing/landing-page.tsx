import {
  ArrowRight,
  CircleCheck,
  ListFilter,
  Settings,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInProvider } from '@/platform/auth/sign-in-provider';
import SignInButton from '@/shared/components/sign-in-button';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utilities/utils';
import { InstallAppButton } from './install-app-button';
import { LandingNavLinks } from './landing-nav-links';
import { LandingPreview } from './landing-preview';
import { MovieDetailPreview } from './movie-detail-preview';

const container = 'mx-auto w-full max-w-6xl px-4 sm:px-8';
const heading =
  'text-balance font-bold text-3xl leading-tight tracking-tight sm:text-4xl';
const section = 'scroll-mt-24 border-border border-t py-14 sm:py-20';
const lead = 'mt-4 max-w-lg text-pretty text-muted-foreground leading-relaxed';

const trustPoints = [
  {
    icon: CircleCheck,
    title: 'Sabés quién opinó.',
    description:
      'Una nota te dice más cuando conocés el gusto de quien calificó la película o la serie.',
  },
  {
    icon: UserPlus,
    title: 'Vos elegís a quién seguir.',
    description:
      'Seguí a tus amigos o a cualquier persona cuyo gusto te interese.',
  },
];

const steps = [
  {
    title: 'Calificá lo que viste.',
    description:
      'Poné una nota del 1 al 10. No hace falta escribir una reseña.',
  },
  {
    title: 'Tu opinión llega a quienes te siguen.',
    description:
      'Tus nuevas calificaciones aparecen en Recientes de las personas que te siguen.',
  },
  {
    title: 'Descubrí qué ver.',
    description:
      'Para vos destaca películas y series que recibieron buenas calificaciones de las personas que seguís.',
  },
];

const faqs = [
  [
    '¿De dónde salen las recomendaciones?',
    'De las notas de las personas que seguís. Para vos destaca títulos que recibieron buenas calificaciones, y podés ver quién calificó cada uno.',
  ],
  [
    '¿Qué pasa cuando califico algo?',
    'Compartís qué te pareció con quienes te siguen. Una nota alta puede ayudarlos a encontrar algo que les guste. Una baja también les cuenta tu experiencia.',
  ],
  [
    '¿Qué diferencia hay entre Para vos y Recientes?',
    'Para vos reúne recomendaciones a partir de las calificaciones de las personas que seguís. Recientes muestra sus nuevas calificaciones en orden cronológico, sean buenas o malas.',
  ],
  [
    '¿Y si todavía no sigo a nadie?',
    'Podés empezar calificando películas y series que ya viste. A medida que sigas personas, vas a empezar a descubrir sus recomendaciones.',
  ],
  [
    '¿Puedo seguir a alguien que no sea mi amigo?',
    'Sí. Podés seguir a cualquier usuario cuyo gusto te interese. No hace falta que se conozcan personalmente.',
  ],
  [
    '¿Puedo ver las películas desde QueVes?',
    'No. QueVes te ayuda a descubrir qué ver y, cuando hay información disponible, a encontrar dónde podés verlo.',
  ],
];

export function LandingPage({ signedIn }: { signedIn: boolean }) {
  const primaryAction = signedIn ? (
    <Button asChild className="min-h-11" size="lg">
      <Link href="/app">
        Ir a la app <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  ) : (
    <SignInButton className="min-h-11" label="Crear mi cuenta" size="lg" />
  );

  return (
    <SignInProvider>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
        href="#contenido"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-20 border-border border-b bg-background">
        <nav
          aria-label="Navegación principal"
          className={cn(
            container,
            'flex min-h-16 items-center justify-between gap-2 py-2 sm:gap-4'
          )}
        >
          <Brand />
          <LandingNavLinks />
          <div className="flex items-center gap-2">
            {signedIn ? (
              primaryAction
            ) : (
              <>
                <SignInButton
                  className="min-h-11 px-2 sm:px-4"
                  label="Iniciar sesión"
                  variant="ghost"
                />
                <div className="hidden lg:block">{primaryAction}</div>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="scroll-mt-24" id="contenido" tabIndex={-1}>
        <section
          aria-labelledby="landing-title"
          className="scroll-mt-20"
          id="inicio"
        >
          <div
            className={cn(
              container,
              'grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.25fr_1fr] md:gap-12 lg:py-20'
            )}
          >
            <div>
              <h1
                className="max-w-2xl text-balance font-bold text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
                id="landing-title"
              >
                ¿No sabés qué ver?{' '}
                <span className="mt-2 block text-primary-hover">
                  Mirá qué recomienda la gente que seguís.
                </span>
              </h1>
              <p className={cn(lead, 'sm:text-lg')}>
                Descubrí películas y series a partir de las notas de personas
                que seguís.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {primaryAction}
                <InstallAppButton />
              </div>
            </div>
            <MovieDetailPreview />
          </div>
        </section>

        <section
          aria-labelledby="trust-title"
          className={cn(section, 'bg-surface')}
          id="por-que"
        >
          <div className={cn(container, 'grid gap-8 md:grid-cols-2 md:gap-12')}>
            <div>
              <h2 className={heading} id="trust-title">
                No es solo la nota.{' '}
                <span className="block text-primary-hover">
                  También importa de quién viene.
                </span>
              </h2>
              <p className={lead}>
                Un promedio te dice cuánto gustó una película en general. QueVes
                te muestra qué opinan las personas que elegiste seguir.
              </p>
            </div>
            <ul className="divide-y divide-border">
              {trustPoints.map(({ icon: Icon, title, description }) => (
                <li
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  key={title}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary-hover">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="steps-title"
          className={section}
          id="como-funciona"
        >
          <div className={container}>
            <h2 className={cn(heading, 'max-w-2xl')} id="steps-title">
              Tu opinión también{' '}
              <span className="text-primary-hover">
                ayuda a otros a elegir.
              </span>
            </h2>
            <p className={cn(lead, 'max-w-2xl')}>
              Cuando calificás una película o serie, compartís qué te pareció
              con quienes te siguen. Así, tus notas también pueden ayudarlos a
              decidir qué ver.
            </p>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map(({ title, description }, index) => (
                <li className="border-border border-t pt-4" key={title}>
                  <span
                    aria-hidden="true"
                    className="font-semibold text-primary-hover text-sm tabular-nums"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="mt-2 font-semibold text-lg">{title}</h3>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="product-title"
          className={cn(section, 'bg-surface')}
          id="dentro"
        >
          <div className={container}>
            <LandingPreview>
              <h2 className={heading} id="product-title">
                Una red.{' '}
                <span className="text-primary-hover">
                  Dos formas de descubrir qué ver.
                </span>
              </h2>
            </LandingPreview>
          </div>
        </section>

        <section
          aria-labelledby="streaming-title"
          className={section}
          id="plataformas"
        >
          <div className={cn(container, 'grid gap-8 md:grid-cols-2 md:gap-12')}>
            <h2 className={heading} id="streaming-title">
              Encontrá qué ver{' '}
              <span className="block text-primary-hover">
                en las plataformas que usás.
              </span>
            </h2>
            <ol className="divide-y divide-border">
              <li className="flex items-start gap-4 pb-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary-hover">
                  <Settings aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Guardá tus plataformas.</h3>
                  <p className="mt-1 text-pretty text-muted-foreground leading-relaxed">
                    Elegí en Configuración los servicios de streaming que usás.
                    Podés cambiarlos cuando quieras.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary-hover">
                  <ListFilter aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Filtrá por tus plataformas.</h3>
                  <p className="mt-1 text-pretty text-muted-foreground leading-relaxed">
                    Activá{' '}
                    <strong className="font-semibold text-foreground">
                      En mis plataformas
                    </strong>{' '}
                    en tu lista,{' '}
                    <strong className="font-semibold text-foreground">
                      Para vos
                    </strong>{' '}
                    o{' '}
                    <strong className="font-semibold text-foreground">
                      Recientes
                    </strong>{' '}
                    para ver solo las películas y series disponibles en ellas.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="faq-title"
          className={cn(section, 'bg-surface')}
          id="preguntas"
        >
          <div
            className={cn(
              container,
              'grid gap-6 md:grid-cols-[1fr_1.5fr] md:gap-12'
            )}
          >
            <h2 className={heading} id="faq-title">
              Algunas preguntas antes de empezar.
            </h2>
            <div className="divide-y divide-border border-border border-y">
              {faqs.map(([question, answer]) => (
                <details className="group" key={question}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold hover:text-primary-hover [&::-webkit-details-marker]:hidden">
                    {question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-normal text-primary-hover text-xl group-open:hidden"
                    >
                      +
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden shrink-0 font-normal text-primary-hover text-xl group-open:inline"
                    >
                      −
                    </span>
                  </summary>
                  <p className="pb-4 text-muted-foreground leading-relaxed">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cta-title" className="py-14 sm:py-20">
          <div className={container}>
            <div className="rounded-lg border border-border bg-card px-4 py-10 text-center sm:px-8 sm:py-14">
              <h2 className={cn(heading, 'mx-auto max-w-2xl')} id="cta-title">
                Tu próxima película favorita puede venir de alguien que seguís.
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                Seguí a personas cuyo gusto te interesa, compartí tus notas y
                descubrí qué ver.
              </p>
              <div className="mt-6 flex justify-center">{primaryAction}</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-border border-t bg-surface">
        <div
          className={cn(
            container,
            'flex flex-wrap items-center gap-x-6 gap-y-2 py-6'
          )}
        >
          <Brand />
          <p className="text-muted-foreground text-sm">
            Qué ver, según la gente que seguís.
          </p>
        </div>
      </footer>
    </SignInProvider>
  );
}

function Brand() {
  return (
    <a
      aria-label="QueVes, ir al inicio"
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm font-bold text-lg tracking-tight"
      href="#inicio"
    >
      <Image
        alt=""
        className="size-8"
        height={32}
        src="/icons/icon-192.png"
        width={32}
      />
      <span>
        queves<span className="text-primary-hover">.</span>
      </span>
    </a>
  );
}
