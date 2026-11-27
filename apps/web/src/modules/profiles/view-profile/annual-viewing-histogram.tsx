const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const MAX_SEGMENTS = 12;
const formatCount = new Intl.NumberFormat('es-AR');

function describeMovieCount(count: number) {
  return `${formatCount.format(count)} ${count === 1 ? 'película' : 'películas'}`;
}

export function AnnualViewingHistogram({
  monthlyCounts,
  total,
  year,
}: {
  monthlyCounts: readonly number[];
  total: number;
  year: number;
}) {
  const moviesPerSegment = Math.max(
    1,
    Math.ceil(Math.max(...monthlyCounts) / MAX_SEGMENTS)
  );
  const scaleDescription = `${describeMovieCount(moviesPerSegment)} por segmento completo`;
  const totalLabel = `${total === 1 ? 'película' : 'películas'} en ${year}`;

  return (
    <figure className="grid min-w-0 max-w-64 flex-1">
      <figcaption
        className="flex h-5 min-w-0 items-baseline gap-1 text-muted-foreground text-xs leading-none sm:text-sm sm:leading-none"
        title={`${formatCount.format(total)} ${totalLabel}. ${scaleDescription}.`}
      >
        <span className="shrink-0 font-semibold text-foreground text-lg leading-5 tabular-nums">
          {formatCount.format(total)}
        </span>{' '}
        <span className="truncate">{totalLabel}</span>
        <span className="sr-only">. {scaleDescription}.</span>
      </figcaption>
      <div className="grid grid-cols-12 gap-x-1 sm:gap-x-1.5">
        {MONTHS.map((month, index) => {
          const count = monthlyCounts[index] ?? 0;
          const description = `${month}: ${describeMovieCount(count)}`;

          return (
            <div className="min-w-0" key={month} title={description}>
              <span className="sr-only">{description}</span>
              <div aria-hidden="true" className="grid gap-0.5 text-center">
                <div className="flex h-[70px] flex-col-reverse gap-0.5">
                  {Array.from(
                    { length: Math.ceil(count / moviesPerSegment) },
                    (_, segmentIndex) => segmentIndex * moviesPerSegment
                  ).map((moviesBelow) => {
                    const fraction = (count - moviesBelow) / moviesPerSegment;
                    return (
                      <div
                        className="h-1 w-full shrink-0 rounded-full bg-primary"
                        key={moviesBelow}
                        style={
                          fraction < 1
                            ? { width: `max(1px, ${fraction * 100}%)` }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
                <span className="text-subtle-foreground text-[10px] leading-3">
                  {month[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
