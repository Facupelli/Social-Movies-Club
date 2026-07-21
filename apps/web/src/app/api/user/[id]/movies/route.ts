import {
  parseProfileRatingsFilters,
  toProfileRatingsRepositoryFilters,
} from '@/modules/ratings/list-profile-ratings/filters/filter-user-movies-parser';
import { loadProfileRatingsPage } from '@/modules/ratings/list-profile-ratings/profile-ratings-query-loader.server';
import { PROFILE_RATINGS_PAGE_SIZE } from '@/modules/ratings/list-profile-ratings/use-user-movies';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

const VALID_PROFILE_ID = /^\S{1,255}$/;
const VALID_PAGE = /^\d+$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return unauthorizedJson();
  }

  const { id: profileUserId } = await params;
  if (!VALID_PROFILE_ID.test(profileUserId)) {
    return authenticatedJson({ error: 'Invalid profile ID' }, { status: 400 });
  }

  const url = new URL(request.url);
  const rawPage = url.searchParams.get('page') ?? '0';
  if (!VALID_PAGE.test(rawPage)) {
    return authenticatedJson({ error: 'Invalid page' }, { status: 400 });
  }

  const page = Number(rawPage);
  if (!Number.isSafeInteger(page)) {
    return authenticatedJson({ error: 'Invalid page' }, { status: 400 });
  }

  const filters = parseProfileRatingsFilters(url.searchParams);

  try {
    const result = await loadProfileRatingsPage({
      profileUserId,
      viewerUserId: session.user.id,
      filters: toProfileRatingsRepositoryFilters(
        filters,
        page,
        PROFILE_RATINGS_PAGE_SIZE
      ),
    });
    return authenticatedJson(result);
  } catch {
    return authenticatedJson(
      { error: 'Unable to load profile ratings' },
      { status: 500 }
    );
  }
}
