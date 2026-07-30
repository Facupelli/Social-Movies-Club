import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMediaDetail } from '@/modules/media-catalog/get-media-details/get-media-detail';
import { getMediaByTmdbIdentity } from '@/modules/media-catalog/get-media-details/media.pg';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { MediaDetailPage } from '@/modules/media-catalog/view-media-detail/media-detail-page';
import { getViewerRatingForMedia } from '@/modules/ratings/get-viewer-rating-for-media/get-viewer-rating-for-media';
import { getTrustedRatingDetails } from '@/modules/trusted-rating-context/get-trusted-rating-details/get-trusted-rating-details';
import { getServerSession } from '@/platform/auth/get-server-session';

type PageProps = {
  params: Promise<{ kind: string; tmdbId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const identity = parseIdentity(await params);
  if (!identity) {
    return {};
  }

  try {
    const { data } = await getMediaDetail(identity.tmdbId, identity.kind);
    return { title: `${data.title} | Social Movies Club` };
  } catch {
    return {};
  }
}

export default async function MediaPage({ params }: PageProps) {
  const identity = parseIdentity(await params);
  if (!identity) {
    notFound();
  }

  const [{ data: media }, session] = await Promise.all([
    getMediaDetail(identity.tmdbId, identity.kind),
    getServerSession(),
  ]);
  const viewerUserId = session?.user.id;

  if (!viewerUserId) {
    return (
      <MediaDetailPage
        isAuthenticated={false}
        media={media}
        trustedContextFailed={false}
        trustedDetails={null}
        viewerRating={null}
        viewerRatingFailed={false}
        viewerUserId={null}
      />
    );
  }

  const localMedia = await getMediaByTmdbIdentity(
    identity.tmdbId,
    identity.kind
  );
  if (!localMedia) {
    return (
      <MediaDetailPage
        isAuthenticated
        media={media}
        trustedContextFailed={false}
        trustedDetails={{
          summary: {
            mediaId: '',
            ratingCount: 0,
            averageScore: null,
            previewRaters: [],
          },
          raters: [],
        }}
        viewerRating={null}
        viewerRatingFailed={false}
        viewerUserId={viewerUserId}
      />
    );
  }

  const [trustedResult, viewerRatingResult] = await Promise.allSettled([
    getTrustedRatingDetails(viewerUserId, localMedia.id),
    getViewerRatingForMedia(viewerUserId, localMedia.id),
  ]);

  return (
    <MediaDetailPage
      isAuthenticated
      media={media}
      trustedContextFailed={trustedResult.status === 'rejected'}
      trustedDetails={
        trustedResult.status === 'fulfilled' ? trustedResult.value : null
      }
      viewerRating={
        viewerRatingResult.status === 'fulfilled'
          ? viewerRatingResult.value
          : null
      }
      viewerRatingFailed={viewerRatingResult.status === 'rejected'}
      viewerUserId={viewerUserId}
    />
  );
}

function parseIdentity({
  kind,
  tmdbId,
}: {
  kind: string;
  tmdbId: string;
}): { kind: MediaKind; tmdbId: number } | null {
  if (kind !== 'movie' && kind !== 'tv_series') {
    return null;
  }

  const parsedTmdbId = Number(tmdbId);
  if (!(Number.isSafeInteger(parsedTmdbId) && parsedTmdbId > 0)) {
    return null;
  }

  return { kind, tmdbId: parsedTmdbId };
}
