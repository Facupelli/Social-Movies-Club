import {
  type MediaKind,
  MediaKindEnum,
} from '@/modules/media-catalog/media.type';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

function isMediaKind(value: string | null): value is MediaKind {
  return value === MediaKindEnum.movie || value === MediaKindEnum.tvSeries;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const mediaId = Number(rawId);
  const kind = new URL(request.url).searchParams.get('kind');

  const isValidMediaId =
    POSITIVE_INTEGER_PATTERN.test(rawId) && Number.isSafeInteger(mediaId);

  if (!(isValidMediaId && isMediaKind(kind))) {
    return Response.json(
      { error: 'A positive media ID and valid media kind are required' },
      { status: 400 }
    );
  }

  try {
    const result = await new TmdbService().getWatchProvider(mediaId, kind);
    return Response.json(result);
  } catch {
    return Response.json(
      { error: 'Unable to load watch providers' },
      { status: 502 }
    );
  }
}
