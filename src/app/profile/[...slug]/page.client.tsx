'use client';

import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  Calendar,
  Grid2X2,
  Star,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MovieCard, type MovieView } from '@/components/movies/movie-card';
import { MovieGrid } from '@/components/movies/movie-grid';
import { MovieList } from '@/components/movies/movie-list';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SortBy, SortOrder } from './page';

export function ProfileClientPage({
  profileMovies = [],
}: {
  profileMovies: MovieView[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = (searchParams.get('sortBy') as SortBy) || 'score';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    updateSearchParams('sortOrder', newOrder);
  };

  const handleSortByChange = (value: string) => {
    updateSearchParams('sortBy', value);
  };

  const getSortLabel = () => {
    return sortBy === 'score' ? 'Puntaje' : 'Fecha';
  };

  return (
    <Tabs className="flex-1 pt-2 pb-10" defaultValue="grid">
      <div className="flex justify-end gap-4 py-2">
        <div className="flex h-9 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-[calc(100%-1px)] gap-2 bg-transparent"
                variant="outline"
              >
                {sortBy === 'score' ? (
                  <Star className="size-4" />
                ) : (
                  <Calendar className="size-4" />
                )}
                <span className="font-normal text-neutral-500">
                  Ordenar por
                </span>{' '}
                {getSortLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                onValueChange={handleSortByChange}
                value={sortBy}
              >
                <DropdownMenuRadioItem className="gap-2" value="score">
                  <Star className="size-4" />
                  Puntaje
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="gap-2" value="createdAt">
                  <Calendar className="size-4" />
                  Fecha agregada
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="h-[calc(100%-1px)] gap-1 bg-transparent"
            onClick={toggleSortOrder}
            size="icon"
            title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            variant="outline"
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
          </Button>
        </div>

        <TabsList className="gap-1 bg-transparent p-0">
          <TabsTrigger asChild value="grid">
            <Button size="icon" variant="ghost">
              <Grid2X2 />
            </Button>
          </TabsTrigger>

          <TabsTrigger asChild value="list">
            <Button size="icon" variant="ghost">
              <AlignJustify />
            </Button>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="grid">
        <MovieGrid>
          {profileMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie}>
              <MovieCard.Poster />
              <div className="pt-2">
                <MovieCard.Title />
                <MovieCard.ReleaseDate />
                <MovieCard.Rating />
              </div>
            </MovieCard>
          ))}
        </MovieGrid>
      </TabsContent>

      <TabsContent value="list">
        <MovieList>
          {profileMovies.map((movie, idx) => (
            <MovieCard key={movie.id} movie={movie}>
              <div className="flex gap-6">
                <p className="font-bold">{idx + 1}</p>
                <div className="flex flex-1 items-center">
                  <div className="flex flex-1 gap-4">
                    <MovieCard.Poster size="small" />
                    <div className="flex-1">
                      <MovieCard.Title className="font-bold text-lg" />
                      <MovieCard.ReleaseDate />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MovieCard.WatchProviders />
                    <MovieCard.Rating />
                  </div>
                </div>
              </div>
            </MovieCard>
          ))}
        </MovieList>
      </TabsContent>
    </Tabs>
  );
}
