const links = [
  { href: '#por-que', label: 'La idea' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#dentro', label: 'La app' },
  { href: '#preguntas', label: 'Preguntas' },
];

export function LandingNavLinks() {
  return (
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
  );
}
