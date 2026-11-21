'use client';

import * as Tabs from '@radix-ui/react-tabs';
import {
  Bell,
  Bookmark,
  Home,
  MoreHorizontal,
  Search,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import {
  type HomeFeedView,
  homeFeedHeaderLayout,
  homeFeedTabClassName,
  homeFeedTabsLayout,
  homeFeedViews,
} from '@/shared/components/home-feed-header.styles';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utilities/utils';

const descriptions = {
  recommendations:
    'Descubrí películas y series que recibieron buenas calificaciones de las personas que seguís.',
  recent: 'Enterate de qué calificaron últimamente, les haya gustado o no.',
};

type Media = {
  title: string;
  metadata: string;
  runtime?: string;
  poster: string;
};

type Person = { name: string; avatar?: string };
type Rating = { person: Person; score: number };

const elPadrino: Media = {
  title: 'El padrino',
  metadata: '1972 · Película',
  runtime: '2 h 55 min',
  poster: 'el-padrino',
};
const juegoDeTronos: Media = {
  title: 'Juego de tronos',
  metadata: '2011 · Serie',
  poster: 'juego-de-tronos',
};
const capitanPhillips: Media = {
  title: 'Capitán Phillips',
  metadata: '2013 · Película',
  runtime: '2 h 14 min',
  poster: 'capitan-phillips',
};

const waldo = { name: 'Waldo Segovia', avatar: 'avatar-waldo' };
const lucas = { name: 'Lucas Leiva', avatar: 'avatar-lucas' };
const ana = { name: 'Ana' };
const sofia = { name: 'Sofía' };

const recommendations = [
  {
    media: elPadrino,
    ratings: [
      { person: waldo, score: 10 },
      { person: ana, score: 10 },
      { person: lucas, score: 9 },
    ],
  },
  {
    media: juegoDeTronos,
    ratings: [
      { person: lucas, score: 10 },
      { person: sofia, score: 9 },
      { person: waldo, score: 9 },
    ],
  },
  {
    media: capitanPhillips,
    ratings: [
      { person: sofia, score: 9 },
      { person: ana, score: 9 },
      { person: lucas, score: 8 },
    ],
  },
];

const activity = [
  {
    media: {
      title: 'Wildwood: El Bosque Salvaje',
      metadata: '2026 · Película',
      runtime: '2 h 12 min',
      poster: 'wildwood',
    },
    person: waldo,
    handle: '@Cabezoni',
    time: '2 h',
    score: 7,
  },
  {
    media: capitanPhillips,
    person: lucas,
    handle: '@Lucas',
    time: '1 d',
    score: 8,
  },
  {
    media: juegoDeTronos,
    person: ana,
    handle: '@Ana',
    time: '3 d',
    score: 5,
  },
];

const panelClassName =
  'min-h-0 flex-1 divide-y divide-border overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

export function LandingPreview({ children }: { children: ReactNode }) {
  const [view, setView] = useState<HomeFeedView>('recommendations');

  return (
    <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
      <div>
        {children}
        <fieldset className="mt-6 grid min-w-0 max-w-lg gap-2">
          <legend className="sr-only">Elegir vista del producto</legend>
          {homeFeedViews.map(({ value, label }) => (
            <Button
              aria-pressed={value === view}
              className={cn(
                'h-auto min-h-11 flex-col items-start gap-1 whitespace-normal p-3 text-left',
                value === view &&
                  'border-primary bg-primary-subtle dark:border-primary dark:bg-primary-subtle dark:hover:bg-primary-subtle'
              )}
              key={value}
              onClick={() => setView(value)}
              type="button"
              variant="outline"
            >
              <span className="font-semibold text-primary-hover">{label}</span>
              <span className="font-normal text-muted-foreground">
                {descriptions[value]}
              </span>
            </Button>
          ))}
        </fieldset>
      </div>
      <div className="mx-auto w-full max-w-sm rounded-lg border border-border bg-card p-2">
        <Tabs.Root
          className="@container flex h-128 flex-col overflow-hidden rounded-md border border-border bg-background sm:h-144"
          onValueChange={(value) => {
            const selectedView = homeFeedViews.find(
              (tab) => tab.value === value
            );
            if (selectedView) {
              setView(selectedView.value);
            }
          }}
          value={view}
        >
          <div className={homeFeedHeaderLayout}>
            <div aria-hidden="true" />
            <Tabs.List
              aria-label="Secciones de la app"
              className={homeFeedTabsLayout}
            >
              {homeFeedViews.map(({ value, label }) => (
                <Tabs.Trigger
                  className={homeFeedTabClassName(value === view)}
                  key={value}
                  value={value}
                >
                  {label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <div aria-hidden="true" className="grid size-10 place-items-center">
              <Bell className="size-4" />
            </div>
          </div>
          <Tabs.Content className={panelClassName} value="recommendations">
            {recommendations.map(({ media, ratings }) => (
              <Recommendation
                key={media.poster}
                media={media}
                ratings={ratings}
              />
            ))}
          </Tabs.Content>
          <Tabs.Content className={panelClassName} value="recent">
            {activity.map((post) => (
              <RecentPost key={post.media.poster} {...post} />
            ))}
          </Tabs.Content>
          <div
            aria-hidden="true"
            className="flex shrink-0 justify-center gap-6 bg-sidebar px-4 py-2 text-sidebar-foreground"
          >
            {[Home, Search, Bookmark, UserRound].map((Icon, index) => (
              <span className="px-2 py-2" key={Icon.displayName}>
                <Icon
                  className={cn(
                    'size-5',
                    index === 0 && 'text-sidebar-primary'
                  )}
                />
              </span>
            ))}
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

function Recommendation({
  media,
  ratings,
}: {
  media: Media;
  ratings: Rating[];
}) {
  const average =
    ratings.reduce((sum, { score }) => sum + score, 0) / ratings.length;

  return (
    <article className="flex gap-3 px-4 py-5 first:pt-4">
      <Poster className="w-24 @xs:w-30" media={media} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MediaInfo media={media} trailing={<PostMenuIcon />} />
        <div className="mt-auto pt-2">
          <ul
            aria-label="Calificaciones de personas que seguís"
            className="flex gap-2"
          >
            {ratings.map(({ person, score }) => (
              <li className="relative" key={person.name}>
                <span className="sr-only">
                  {person.name}: {score}/10
                </span>
                <PersonAvatar
                  className="size-8 border-2 border-surface @xs:size-10"
                  person={person}
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -bottom-0.5 grid size-5 place-items-center rounded-full bg-primary-subtle font-semibold text-primary text-xs tabular-nums"
                >
                  {score}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground text-xs leading-snug">
            <strong className="font-semibold text-primary">
              {ratings.length} personas
            </strong>{' '}
            la recomiendan
            <br />
            promedio{' '}
            <strong className="font-semibold text-primary tabular-nums">
              {average.toFixed(1)}
            </strong>
          </p>
        </div>
      </div>
    </article>
  );
}

function RecentPost({
  media,
  person,
  handle,
  time,
  score,
}: Rating & { media: Media; handle: string; time: string }) {
  return (
    <article className="flex gap-3 px-4 py-4">
      <PersonAvatar className="size-9" person={person} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-semibold">{person.name}</span>
              <span className="text-muted-foreground text-xs">{handle}</span>
              <span className="text-subtle-foreground">·</span>
              <span className="text-subtle-foreground text-xs">{time}</span>
            </div>
            <p className="text-muted-foreground text-xs">calificó</p>
          </div>
          <PostMenuIcon />
        </div>
        <div className="mt-3 flex gap-3">
          <Poster className="w-20 @xs:w-24" media={media} />
          <div className="min-w-0 flex-1 py-0.5">
            <MediaInfo media={media} />
            <p className="mt-4 font-semibold text-primary text-2xl leading-none tabular-nums">
              {score}
              <span className="text-base">/10</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Poster({ media, className }: { media: Media; className: string }) {
  return (
    <Image
      alt=""
      className={cn(
        'aspect-2/3 shrink-0 self-start rounded-xs bg-muted object-cover',
        className
      )}
      height={180}
      src={`/landing/${media.poster}.webp`}
      width={120}
    />
  );
}

function PersonAvatar({
  person,
  className,
}: {
  person: Person;
  className: string;
}) {
  return (
    <Avatar aria-hidden="true" className={className}>
      {person.avatar ? (
        <Image
          alt=""
          className="size-full object-cover"
          height={40}
          src={`/landing/${person.avatar}.webp`}
          width={40}
        />
      ) : (
        <AvatarFallback className="text-sm">{person.name[0]}</AvatarFallback>
      )}
    </Avatar>
  );
}

function PostMenuIcon() {
  return (
    <MoreHorizontal
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
    />
  );
}

function MediaInfo({
  media,
  trailing,
}: {
  media: Media;
  trailing?: ReactNode;
}) {
  return (
    <>
      <div className="flex justify-between gap-2">
        <h3 className="min-w-0 wrap-anywhere font-semibold leading-snug">
          {media.title}
        </h3>
        {trailing}
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-snug">
        {media.metadata}
      </p>
      {media.runtime && (
        <p className="mt-1 text-subtle-foreground text-xs leading-snug">
          {media.runtime}
        </p>
      )}
    </>
  );
}
