export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type GetToken = () => Promise<string | null>;

let tokenGetter: GetToken | null = null;

export function setApiTokenGetter(getter: GetToken) {
  tokenGetter = getter;
}

async function authHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;

  // Inject a dev impersonation header for local development so the
  // backend's `x-dev-clerk-id` dev flow works when calling from the
  // browser. Only active in dev builds and when mocks are disabled.
  const devHeader: Record<string, string> = {};
  try {
    const isDev = import.meta.env.DEV;
    const useMock = import.meta.env.VITE_USE_MOCK_SELLER_API === '1';
    if (isDev && !useMock) {
      devHeader['x-dev-clerk-id'] = 'dev_user_1';
    }
  } catch {
    /* ignore when running outside browser build */
  }

  const res = await fetch(url, {
    ...init,
    headers: { ...(await authHeaders()), ...devHeader, ...init?.headers },
    credentials: 'include',
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
