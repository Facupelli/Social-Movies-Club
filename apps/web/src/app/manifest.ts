import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QueVes',
    short_name: 'QueVes',
    description:
      'Descubrí qué ver. Recomendaciones de películas y series de gente en quien confiás.',
    // The previous start URL was also the implicit installed app ID.
    id: '/',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#16171a',
    theme_color: '#16171a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
