import { z } from 'zod';
import {
  getSearchTrustedRatingSummaries,
  MAX_SEARCH_TRUSTED_RATING_IDENTITIES,
} from '@/modules/trusted-rating-context/get-search-trusted-rating-summaries/get-search-trusted-rating-summaries';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

const identitySchema = z
  .string()
  .regex(/^(movie|tv_series):[1-9]\d*$/)
  .transform((identity) => {
    const [kind, tmdbId] = identity.split(':');
    return {
      kind: z.enum(['movie', 'tv_series']).parse(kind),
      tmdbId: z.coerce.number().int().positive().parse(tmdbId),
    };
  });
const identitiesSchema = z
  .array(identitySchema)
  .max(MAX_SEARCH_TRUSTED_RATING_IDENTITIES);

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return unauthorizedJson();
  }

  try {
    const identities = identitiesSchema.parse(
      new URL(request.url).searchParams.getAll('identity')
    );
    return authenticatedJson(
      await getSearchTrustedRatingSummaries(session.user.id, identities)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return authenticatedJson(
        { success: false, error: 'Invalid media identities' },
        { status: 400 }
      );
    }

    return authenticatedJson(
      { success: false, error: 'Unable to load trusted ratings' },
      { status: 500 }
    );
  }
}
