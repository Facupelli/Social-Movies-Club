// biome-ignore-all lint/suspicious/noConsole: this operational CLI reports progress to its user
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import pg from 'pg';

const DEFAULT_REQUESTS_PER_SECOND = 20;
const DEFAULT_CONCURRENCY = 5;
const DEFAULT_MAX_RETRIES = 6;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseArguments(argv) {
  const options = {
    confirmProduction: false,
    concurrency: DEFAULT_CONCURRENCY,
    dryRun: false,
    limit: undefined,
    maxRetries: DEFAULT_MAX_RETRIES,
    requestsPerSecond: DEFAULT_REQUESTS_PER_SECOND,
  };

  for (const argument of argv) {
    if (argument === '--confirm-production') {
      options.confirmProduction = true;
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument.startsWith('--limit=')) {
      options.limit = parsePositiveInteger(argument, '--limit');
    } else if (argument.startsWith('--requests-per-second=')) {
      options.requestsPerSecond = parsePositiveNumber(
        argument,
        '--requests-per-second'
      );
    } else if (argument.startsWith('--concurrency=')) {
      options.concurrency = parsePositiveInteger(argument, '--concurrency');
    } else if (argument.startsWith('--max-retries=')) {
      options.maxRetries = parseNonNegativeInteger(argument, '--max-retries');
    } else if (argument === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function parsePositiveInteger(argument, name) {
  const value = Number(argument.split('=')[1]);
  if (!(Number.isSafeInteger(value) && value > 0)) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function parseNonNegativeInteger(argument, name) {
  const value = Number(argument.split('=')[1]);
  if (!(Number.isSafeInteger(value) && value >= 0)) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

function parsePositiveNumber(argument, name) {
  const value = Number(argument.split('=')[1]);
  if (!(Number.isFinite(value) && value > 0)) {
    throw new Error(`${name} must be a positive number`);
  }
  return value;
}

export function isNeonDatabase(databaseUrl) {
  const hostname = new URL(databaseUrl).hostname.toLowerCase();
  return hostname.endsWith('.neon.tech') || hostname === 'neon.tech';
}

export function createRateLimiter(requestsPerSecond, sleep = delay) {
  const intervalMilliseconds = 1000 / requestsPerSecond;
  let nextStartAt = 0;
  let queue = Promise.resolve();

  return async function waitForRequestSlot() {
    let release;
    const previous = queue;
    queue = new Promise((resolve) => {
      release = resolve;
    });

    await previous;
    const now = Date.now();
    const waitMilliseconds = Math.max(0, nextStartAt - now);
    if (waitMilliseconds > 0) {
      await sleep(waitMilliseconds);
    }
    nextStartAt = Math.max(Date.now(), nextStartAt) + intervalMilliseconds;
    release();
  };
}

export function retryDelayMilliseconds(
  response,
  attempt,
  random = Math.random
) {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    const retryAt = Date.parse(retryAfter);
    if (Number.isFinite(retryAt)) {
      return Math.max(0, retryAt - Date.now());
    }
  }

  const exponentialDelay = Math.min(30_000, 1000 * 2 ** attempt);
  return exponentialDelay + Math.floor(random() * 500);
}

export async function fetchTmdbMetadata({
  fetchImplementation = fetch,
  kind,
  maxRetries,
  sleep = delay,
  tmdbId,
  token,
  waitForRequestSlot,
}) {
  const tmdbKind = kind === 'tv_series' ? 'tv' : 'movie';
  const url = `https://api.themoviedb.org/3/${tmdbKind}/${tmdbId}?language=es-AR`;

  for (let attempt = 0; ; attempt += 1) {
    // Retries must remain sequential and each attempt consumes a rate-limit slot.
    // biome-ignore lint/nursery/noAwaitInLoop: intentional retry sequence
    await waitForRequestSlot();
    const response = await fetchImplementation(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const body = await response.json();
      return mapTmdbMetadata(kind, body);
    }

    if (response.status === 404) {
      return { status: 'not-found' };
    }

    if (response.status === 429 && attempt < maxRetries) {
      await sleep(retryDelayMilliseconds(response, attempt));
      continue;
    }

    const responseBody = await response.text();
    throw new Error(
      `TMDB ${response.status} for ${kind} ${tmdbId}: ${responseBody.slice(0, 200)}`
    );
  }
}

export function mapTmdbMetadata(kind, body) {
  if (kind === 'movie') {
    return {
      originalTitle: nonEmptyString(body.original_title),
      releaseDate: validDate(body.release_date),
      runtimeMinutes: positiveInteger(body.runtime),
      status: 'found',
    };
  }

  return {
    originalTitle: nonEmptyString(body.original_name),
    releaseDate: validDate(body.first_air_date),
    runtimeMinutes: null,
    status: 'found',
  };
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function validDate(value) {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value)
    ? value
    : null;
}

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function selectRows(client, limit) {
  const parameters = [];
  const limitClause = limit ? `LIMIT $${parameters.push(limit)}` : '';
  const result = await client.query(
    `
    SELECT
      m.id,
      m.kind,
      m.release_date,
      m.original_title,
      m.runtime_minutes,
      mei.external_id AS tmdb_id
    FROM media AS m
    INNER JOIN media_external_ids AS mei
      ON mei.media_id = m.id
      AND mei.namespace = CASE
        WHEN m.kind = 'movie' THEN 'tmdb:movie'
        WHEN m.kind = 'tv_series' THEN 'tmdb:tv'
      END
    WHERE
      m.release_date IS NULL
      OR m.original_title IS NULL
      OR (m.kind = 'movie' AND m.runtime_minutes IS NULL)
    ORDER BY m.id
    ${limitClause}
  `,
    parameters
  );

  return result.rows;
}

async function updateRow(client, row, metadata) {
  const result = await client.query(
    `UPDATE media
     SET
       release_date = COALESCE(release_date, $2::date),
       original_title = COALESCE(original_title, $3),
       runtime_minutes = CASE
         WHEN kind = 'movie' THEN COALESCE(runtime_minutes, $4::integer)
         ELSE runtime_minutes
       END,
       source_synced_at = now(),
       updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      row.id,
      metadata.releaseDate,
      metadata.originalTitle,
      metadata.runtimeMinutes,
    ]
  );
  return result.rowCount === 1;
}

async function runWorker(items, worker) {
  while (items.length > 0) {
    const item = items.shift();
    if (item) {
      // Each worker intentionally processes one item at a time.
      // biome-ignore lint/nursery/noAwaitInLoop: bounded worker queue
      await worker(item);
    }
  }
}

export async function runBackfill(options, environment = process.env) {
  const databaseUrl = environment.DATABASE_URL;
  const token = environment.TMDB_ACCESS_TOKEN;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  if (!(options.dryRun || token)) {
    throw new Error('TMDB_ACCESS_TOKEN is required');
  }

  const databaseHost = new URL(databaseUrl).hostname;
  console.log(`Database host: ${databaseHost}`);
  if (
    isNeonDatabase(databaseUrl) &&
    !options.dryRun &&
    !options.confirmProduction
  ) {
    throw new Error(
      'Refusing to modify a Neon database without --confirm-production'
    );
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const rows = await selectRows(client, options.limit);
    const movieCount = rows.filter((row) => row.kind === 'movie').length;
    console.log(
      `Found ${rows.length} rows (${movieCount} movies, ${rows.length - movieCount} TV series)`
    );

    if (options.dryRun || rows.length === 0) {
      return {
        selected: rows.length,
        updated: 0,
        skipped: rows.length,
        notFound: 0,
        failed: 0,
      };
    }

    const summary = {
      selected: rows.length,
      updated: 0,
      skipped: 0,
      notFound: 0,
      failed: 0,
    };
    const waitForRequestSlot = createRateLimiter(options.requestsPerSecond);
    let completed = 0;

    const worker = async (row) => {
      try {
        const metadata = await fetchTmdbMetadata({
          kind: row.kind,
          maxRetries: options.maxRetries,
          tmdbId: row.tmdb_id,
          token,
          waitForRequestSlot,
        });

        if (metadata.status === 'not-found') {
          summary.notFound += 1;
        } else if (
          metadata.releaseDate === null &&
          metadata.originalTitle === null &&
          (row.kind === 'tv_series' || metadata.runtimeMinutes === null)
        ) {
          summary.skipped += 1;
        } else if (await updateRow(client, row, metadata)) {
          summary.updated += 1;
        }
      } catch (error) {
        summary.failed += 1;
        console.error(`Failed ${row.kind} ${row.tmdb_id}:`, error.message);
      } finally {
        completed += 1;
        if (completed % 25 === 0 || completed === rows.length) {
          console.log(`Progress: ${completed}/${rows.length}`);
        }
      }
    };

    const queue = [...rows];
    await Promise.all(
      Array.from({ length: Math.min(options.concurrency, rows.length) }, () =>
        runWorker(queue, worker)
      )
    );

    return summary;
  } finally {
    await client.end();
  }
}

function printHelp() {
  console.log(`Usage: pnpm backfill:media-metadata [options]

Options:
  --dry-run                     Count eligible rows without calling TMDB or updating the DB
  --limit=N                     Process at most N rows
  --requests-per-second=N       Maximum TMDB request starts per second (default: 20)
  --concurrency=N               Maximum in-flight items (default: 5)
  --max-retries=N               Retries after HTTP 429 (default: 6)
  --confirm-production          Required for writes to any Neon database
  --help                        Show this help`);
}

async function main() {
  config({ path: '.env.local', quiet: true });
  config({ quiet: true });
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  const summary = await runBackfill(options);
  console.log('Backfill summary:', summary);
  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
