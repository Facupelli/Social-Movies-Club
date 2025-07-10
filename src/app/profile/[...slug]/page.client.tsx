'use client';

import { AlignJustify, Grid2X2 } from 'lucide-react';
import { MovieCard } from '@/components/movies/movie-card';
import { MovieGrid } from '@/components/movies/movie-grid';
import { MovieList } from '@/components/movies/movie-list';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserViewModel } from '@/users/user.types';

export function ProfileClientPage({
  appUser,
}: {
  appUser: UserViewModel | null;
}) {
  return (
    <Tabs className="flex-1 pt-2 pb-10" defaultValue="grid">
      <TabsList className="ml-auto gap-1 bg-transparent">
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

      <TabsContent value="grid">
        <MovieGrid>
          {appUser?.movies?.map((movie) => (
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
          {appUser?.movies?.map((movie, idx) => (
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
                  <MovieCard.Rating />
                </div>
              </div>
            </MovieCard>
          ))}
        </MovieList>
      </TabsContent>
    </Tabs>
  );
}
