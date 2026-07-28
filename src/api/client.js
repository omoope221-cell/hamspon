export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Registered once by AuthContext so the client can force a logout/redirect
// if a refresh attempt ultimately fails.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh_failed');
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Central request helper.
 * - `body` may be a plain object (JSON-encoded) or a FormData instance (file uploads).
 * - Automatically retries once after a silent token refresh on 401.
 */
async function request(path, { method = 'GET', body, headers = {}, isForm = false, retry = true } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: { ...headers },
  };

  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`;

  if (body !== undefined) {
    if (isForm) {
      opts.body = body; // browser sets multipart boundary
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);

  // Only treat a 401 as "your session expired" when there was an actual
  // session to expire (we had an access token) and this isn't the login
  // request itself. A 401 from /auth/login just means wrong credentials —
  // let it fall through below so the real server message (e.g. "Incorrect
  // credentials or account type selected.") reaches the user instead of
  // being masked by a confusing "Session expired" message.
  const isLoginRequest = path.startsWith('/auth/login');
  if (res.status === 401 && retry && accessToken && !isLoginRequest) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, headers, isForm, retry: false });
    } catch (err) {
      onUnauthorized();
      throw new ApiError('Session expired. Please log in again.', 401);
    }
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data);
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export const api = {
  get: (path, params) => request(withQuery(path, params)),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
};

function withQuery(path, params) {
  if (!params) return path;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? `${path}?${qs}` : path;
}