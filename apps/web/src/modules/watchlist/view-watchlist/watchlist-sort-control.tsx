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

const options: { label: string; value: WatchlistSort }[] = [
  { label: 'Agregadas recientemente', value: 'recently-added' },
  { label: 'Calificación de personas que seguís', value: 'trusted-rating' },
  { label: 'Más calificadas por personas que seguís', value: 'most-rated' },
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
        <Button className="min-h-11 max-w-full gap-2" variant="outline">
          <ArrowUpDown className="size-4 shrink-0" />
          <span className="truncate">{selected.label}</span>
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
