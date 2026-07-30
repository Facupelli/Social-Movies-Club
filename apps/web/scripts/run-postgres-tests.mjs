import { spawnSync } from 'node:child_process';

const composeFile = '../../compose.yaml';
const projectName = 'social-movies-club-test';
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://social_movies_club_test:social_movies_club_test@localhost:5433/social_movies_club_test';

const parsedUrl = new URL(testDatabaseUrl);
if (!parsedUrl.pathname.endsWith('_test')) {
  throw new Error('Refusing to run integration tests against a non-test database');
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
}

try {
  run('docker', [
    'compose',
    '-f',
    composeFile,
    '-p',
    projectName,
    '--profile',
    'test',
    'up',
    '-d',
    '--wait',
    'postgres-test',
  ]);
  run('pnpm', ['exec', 'drizzle-kit', 'migrate', '--config=src/platform/database/postgres/drizzle.config.ts'], {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  });
  run('pnpm', ['exec', 'vitest', 'run', '--config=vitest.integration.config.ts'], {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    TEST_DATABASE_URL: testDatabaseUrl,
  });
} finally {
  spawnSync(
    'docker',
    ['compose', '-f', composeFile, '-p', projectName, '--profile', 'test', 'down', '--volumes'],
    { stdio: 'inherit' }
  );
}
