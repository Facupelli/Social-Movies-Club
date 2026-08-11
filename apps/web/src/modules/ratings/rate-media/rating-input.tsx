'use client';

import { useState } from 'react';
import { cn } from '@/shared/utilities/utils';

type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  onHoverChange?: (value: number) => void;
  size?: 'sm' | 'default';
};

export function RatingInput({
  value,
  onChange,
  onHoverChange,
  size = 'default',
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const isSm = size === 'sm';

  const handleHover = (v: number) => {
    setHoverValue(v);
    onHoverChange?.(v);
  };

  return (
    <div
      className={cn('grid grid-cols-10', isSm ? 'gap-1' : 'gap-2')}
      onMouseLeave={() => handleHover(0)}
      role="radiogroup"
    >
      {Array.from({ length: 10 }, (_, index) => index + 1).map(
        (ratingValue) => {
          const active = hoverValue || value;
          const isSelected = value === ratingValue;
          const isFilled = ratingValue <= active;

          return (
            <label
              className="group relative grid min-w-0 cursor-pointer place-items-center"
              key={ratingValue}
              onMouseEnter={() => handleHover(ratingValue)}
            >
              <input
                aria-label={`${ratingValue} de 10`}
                checked={isSelected}
                className="peer sr-only"
                name="rating"
                onChange={() => onChange(ratingValue)}
                type="radio"
                value={ratingValue}
              />

              <span
                className={cn(
                  'grid aspect-square w-full place-items-center border font-medium transition-[background-color,border-color,box-shadow,transform] duration-150 group-hover:scale-105 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                  isSm
                    ? 'max-w-9 rounded-lg text-xs'
                    : 'max-w-10 rounded-full text-sm',
                  isFilled
                    ? 'border-violet-500/70 bg-violet-500/20 text-white'
                    : 'border-border bg-card text-muted-foreground',
                  isSelected &&
                    'border-violet-500 bg-violet-500/30 shadow-[0_0_0_2px_rgba(139,92,246,0.3),0_0_18px_rgba(124,58,237,0.22)]'
                )}
              >
                {ratingValue}
              </span>
            </label>
          );
        }
      )}
    </div>
  );
}
