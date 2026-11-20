import { Ticket } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

export function InTheatersBadge({ title }: { title: string }) {
  const searchUrl = `https://www.agendadecine.com/busqueda?q=${encodeURIComponent(title)}`;

  return (
    <a
      aria-label={`En cines: buscar funciones de ${title} en Agenda de Cine (se abre en una pestaña nueva)`}
      className="group inline-flex min-h-10 items-center align-middle focus-visible:outline-none"
      href={searchUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Badge
        className="border-border bg-card text-foreground transition-colors group-hover:bg-elevated group-active:bg-muted group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none"
        variant="secondary"
      >
        <Ticket aria-hidden="true" />
        En cines
      </Badge>
    </a>
  );
}
