import { z } from 'zod';

const searchEnvelopeSchema = z.object({
  page: z.number().int(),
  total_pages: z.number().int(),
  total_results: z.number().int(),
});

const movieSearchResultSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    release_date: z.string(),
    overview: z.string(),
  })
  .passthrough();

const tvSearchResultSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    first_air_date: z.string(),
    overview: z.string(),
  })
  .passthrough();

const multiSearchMovieResultSchema = movieSearchResultSchema.extend({
  media_type: z.literal('movie'),
  runtime: z.number().nullable().optional(),
});

const multiSearchTvResultSchema = tvSearchResultSchema.extend({
  media_type: z.literal('tv'),
});

const multiSearchMediaTypeSchema = z
  .object({ media_type: z.string() })
  .passthrough();

const supportedMultiSearchResultsSchema = z.preprocess(
  (value) =>
    z
      .array(z.unknown())
      .parse(value)
      .filter((result) => {
        const mediaType = multiSearchMediaTypeSchema.safeParse(result);
        return (
          mediaType.success &&
          (mediaType.data.media_type === 'movie' ||
            mediaType.data.media_type === 'tv')
        );
      }),
  z.array(
    z.discriminatedUnion('media_type', [
      multiSearchMovieResultSchema,
      multiSearchTvResultSchema,
    ])
  )
);

export const multiSearchResponseSchema = searchEnvelopeSchema.extend({
  results: supportedMultiSearchResultsSchema,
});

export const movieSearchResponseSchema = searchEnvelopeSchema.extend({
  results: z.array(movieSearchResultSchema),
});

export const tvSearchResponseSchema = searchEnvelopeSchema.extend({
  results: z.array(tvSearchResultSchema),
});

export const movieDetailResponseSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    release_date: z.string(),
    overview: z.string(),
    runtime: z.number().nullable(),
  })
  .passthrough();

export const tvDetailResponseSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    first_air_date: z.string(),
    overview: z.string(),
  })
  .passthrough();

const watchProviderSchema = z
  .object({
    logo_path: z.string(),
    provider_id: z.number().int(),
    provider_name: z.string(),
    display_priority: z.number().int(),
  })
  .passthrough();

const watchProviderRegionSchema = z
  .object({
    link: z.string(),
    buy: z.array(watchProviderSchema).optional(),
    flatrate: z.array(watchProviderSchema).optional(),
    rent: z.array(watchProviderSchema).optional(),
  })
  .passthrough();

export const watchProviderResponseSchema = z
  .object({
    id: z.number().int(),
    results: z.record(z.string(), watchProviderRegionSchema),
  })
  .passthrough();
