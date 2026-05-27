// ScanVista — Unified API Client
// All requests go through here to ensure:
//   • credentials: 'include' (refresh token cookie)
//   • Authorization: Bearer <accessToken> on authenticated endpoints
//   • Transparent token refresh + single retry on 401

import { BASE_URL } from './config';

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

/** Lazily import authStore to avoid circular dependency at module load time */
const getStore = () => import('../store/authStore').then((m) => m.useAuthStore);

/** In-flight refresh promise — prevents parallel refresh storms */
let _refreshPromise = null;

async function _doRefresh() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    // Refresh failed — clear auth state
    const store = await getStore();
    store.getState().clearAuth();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  const store = await getStore();
  store.getState().setAuth(data.accessToken, data.user);
  return data.accessToken;
}

/** Trigger a refresh, deduplicated across concurrent calls */
function refreshTokenOnce() {
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * apiRequest — drop-in fetch wrapper
 *
 * @param {string} path   — path relative to BASE_URL, e.g. '/auth/login'
 * @param {RequestInit} options — standard fetch options (method, body, headers…)
 * @param {boolean} [withAuth=false] — inject Authorization header if true
 * @returns {Promise<Response>}
 */
export async function apiRequest(path, options = {}, withAuth = false) {
  const store = await getStore();
  const { accessToken } = store.getState();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(withAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const config = {
    ...options,
    credentials: 'include',
    headers,
  };

  let response = await fetch(`${BASE_URL}${path}`, config);

  // Transparent refresh + retry on 401 for authenticated requests
  if (response.status === 401 && withAuth) {
    try {
      const newToken = await refreshTokenOnce();
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(`${BASE_URL}${path}`, {
        ...config,
        headers: retryHeaders,
      });
    } catch {
      // Refresh failed — return the original 401 so callers can handle it
      return response;
    }
  }

  return response;
}

/**
 * Convenience wrappers
 */
export const authRequest = (path, options = {}) =>
  apiRequest(path, options, true);

export const publicRequest = (path, options = {}) =>
  apiRequest(path, options, false);

/**
 * Multipart upload with the same 401 refresh + retry behavior as authRequest.
 */
export async function authUpload(path, formData) {
  const store = await getStore();

  const buildConfig = (token) => ({
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  let { accessToken } = store.getState();
  let response = await fetch(`${BASE_URL}${path}`, buildConfig(accessToken));

  if (response.status === 401) {
    try {
      accessToken = await refreshTokenOnce();
      response = await fetch(`${BASE_URL}${path}`, buildConfig(accessToken));
    } catch {
      return response;
    }
  }

  return response;
}
