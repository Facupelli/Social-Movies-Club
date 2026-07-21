import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/platform/react-query/provider';
import { Nav } from '@/shared/components/nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Social Movies Club',
  description:
    'No sabes qué película ver? Tenés amigos con buen gusto para las pelis? Entrá, encontrá pelis y recomendá!',
};

export const viewport: Viewport = {
  themeColor: 'black',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <div className="dark bg-background">
            <div className="relative mx-auto flex max-w-5xl flex-col text-card-foreground md:flex-row">
              <Nav />
              <div className="flex-1 border-border bg-surface pb-[60px] md:border-r md:border-l md:pb-0">
                {children}
              </div>
            </div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
