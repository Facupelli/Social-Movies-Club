import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import type { TrustedRatingSummary } from '../trusted-rating-context.types';

export function TrustedRatingSummaryView({
  summary,
}: {
  summary: TrustedRatingSummary;
}) {
  if (summary.ratingCount === 0 || summary.averageScore === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 border-border border-t pt-2">
      <div aria-hidden="true" className="flex shrink-0 -space-x-2">
        {summary.previewRaters.map((rater) => (
          <Avatar className="size-7 border-2 border-card" key={rater.userId}>
            {rater.avatarUrl ? (
              <AvatarImage alt="" src={rater.avatarUrl} />
            ) : null}
            <AvatarFallback className="text-[10px]">
              {rater.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="min-w-0 text-muted-foreground text-xs leading-snug">
        <strong className="text-primary tabular-nums">
          {summary.averageScore.toFixed(1)}
        </strong>{' '}
        de {summary.ratingCount}{' '}
        {summary.ratingCount === 1
          ? 'persona que seguís'
          : 'personas que seguís'}
      </p>
    </div>
  );
}
