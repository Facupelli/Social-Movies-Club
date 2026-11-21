'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const links = [
  { href: '#por-que', label: 'La idea' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#dentro', label: 'La app' },
  { href: '#preguntas', label: 'Preguntas' },
];

export function LandingNavLinks() {
  return (
    <>
      <ul className="hidden items-center gap-5 lg:flex">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              className="flex min-h-11 items-center rounded-sm text-muted-foreground text-sm hover:text-foreground"
              href={href}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="ml-auto lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Menú de navegación"
              className="size-11"
              size="icon"
              variant="ghost"
            >
              <Menu aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {links.map(({ href, label }) => (
              <DropdownMenuItem asChild className="min-h-11" key={href}>
                <a href={href}>{label}</a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
