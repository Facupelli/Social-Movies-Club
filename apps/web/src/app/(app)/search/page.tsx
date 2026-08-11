import { SearchMediaPage } from '@/modules/media-catalog/search-media/search-media-page';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([
    getServerSession(),
    searchParams,
  ]);
  const rawQuery = params.q;
  const initialQuery = Array.isArray(rawQuery) ? (rawQuery[0] ?? '') : rawQuery;

  return (
    <SearchMediaPage
      initialQuery={initialQuery}
      viewerUserId={session?.user.id}
    />
  );
}
