const PRIVATE_NO_STORE = 'private, no-store';

export function authenticatedJson<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', PRIVATE_NO_STORE);

  return Response.json(data, { ...init, headers });
}

export function unauthorizedJson() {
  return authenticatedJson(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
