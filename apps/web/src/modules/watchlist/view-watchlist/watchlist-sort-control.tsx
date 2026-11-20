'use client';

import { ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { WatchlistSort } from '@/modules/watchlist/watchlist.types';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const options: { label: string; shortLabel: string; value: WatchlistSort }[] = [
  {
    label: 'Agregadas recientemente',
    shortLabel: 'Más recientes',
    value: 'recently-added',
  },
  {
    label: 'Calificación de personas que seguís',
    shortLabel: 'Mejor puntuadas',
    value: 'trusted-rating',
  },
  {
    label: 'Más calificadas por personas que seguís',
    shortLabel: 'Más puntuadas',
    value: 'most-rated',
  },
];

export function WatchlistSortControl({
  socialSortingAvailable,
  value,
}: {
  socialSortingAvailable: boolean;
  value: WatchlistSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  const updateSort = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue === 'recently-added') {
      params.delete('sort');
    } else {
      params.set('sort', nextValue);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Ordenar: ${selected.label}`}
          className="h-10 min-w-0 shrink bg-transparent transition-colors"
          type="button"
          variant="outline"
        >
          <ArrowUpDown aria-hidden="true" className="size-4" />
          <span className="truncate sm:hidden">{selected.shortLabel}</span>
          <span className="hidden truncate sm:inline">{selected.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-[calc(100vw-2rem)]">
        <DropdownMenuRadioGroup onValueChange={updateSort} value={value}>
          {options.map((option) => {
            const disabled =
              !socialSortingAvailable && option.value !== 'recently-added';
            return (
              <DropdownMenuRadioItem
                disabled={disabled}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
