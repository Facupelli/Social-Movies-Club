'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import type { TrustedRatingDetails } from '../trusted-rating-context.types';

const INITIAL_RATER_COUNT = 3;

export function TrustedRatingDetailsSection({
  details,
}: {
  details: TrustedRatingDetails;
}) {
  const [expanded, setExpanded] = useState(false);
  const { summary, raters } = details;

  if (summary.ratingCount === 0) {
    return (
      <section aria-labelledby="trusted-ratings-heading" className="space-y-3">
        <h2 className="text-xl font-semibold" id="trusted-ratings-heading">
          De personas que seguís
        </h2>
        <p className="text-sm text-muted-foreground">
          Nadie que seguís calificó este título todavía.
        </p>
      </section>
    );
  }

  const visibleRaters = expanded
    ? raters
    : raters.slice(0, INITIAL_RATER_COUNT);
  const hiddenCount = raters.length - INITIAL_RATER_COUNT;

  return (
    <section aria-labelledby="trusted-ratings-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4 border-border border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold" id="trusted-ratings-heading">
            De personas que seguís
          </h2>
          <p className="text-sm text-muted-foreground">
            Promedio de {summary.ratingCount}{' '}
            {summary.ratingCount === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <strong className="text-3xl text-primary tabular-nums">
            {summary.averageScore?.toFixed(1)}
          </strong>
          <span className="text-sm text-muted-foreground"> / 10</span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {visibleRaters.map((rater) => (
          <Link
            className="flex min-h-16 items-center gap-3 rounded-sm px-1 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/profile/${rater.userId}`}
            key={rater.userId}
          >
            <Avatar className="size-10">
              {rater.avatarUrl ? (
                <AvatarImage alt="" src={rater.avatarUrl} />
              ) : null}
              <AvatarFallback>
                {rater.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{rater.displayName}</p>
              <p className="text-sm text-muted-foreground">
                Vio el {formatDate(rater.watchedDate)}
              </p>
            </div>
            <strong className="text-lg tabular-nums">{rater.score}/10</strong>
          </Link>
        ))}
      </div>

      {hiddenCount > 0 ? (
        <Button
          aria-expanded={expanded}
          className="min-h-11 w-full"
          onClick={() => setExpanded((current) => !current)}
          type="button"
          variant="ghost"
        >
          {expanded
            ? 'Ver menos'
            : `Ver ${hiddenCount} ${hiddenCount === 1 ? 'calificación más' : 'calificaciones más'}`}
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </Button>
      ) : null}
    </section>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(`${date}T00:00:00Z`))
    .replaceAll('.', '');
}
