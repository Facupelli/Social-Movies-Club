import {
  type MediaType,
  MediaTypeEnum,
} from '@/modules/media-catalog/media.type';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

function isMediaType(value: string | null): value is MediaType {
  return value === MediaTypeEnum.movie || value === MediaTypeEnum.tv;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const mediaId = Number(rawId);
  const type = new URL(request.url).searchParams.get('type');

  const isValidMediaId =
    POSITIVE_INTEGER_PATTERN.test(rawId) && Number.isSafeInteger(mediaId);

  if (!(isValidMediaId && isMediaType(type))) {
    return Response.json(
      { error: 'A positive media ID and valid media type are required' },
      { status: 400 }
    );
  }

  try {
    const result = await new TmdbService().getWatchProvider(mediaId, type);
    return Response.json(result);
  } catch {
    return Response.json(
      { error: 'Unable to load watch providers' },
      { status: 502 }
    );
  }
}
