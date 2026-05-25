// ScanVista Auth API — all calls routed through unified client
import { publicRequest, authRequest } from './client';

// ── Register ──────────────────────────────────────────────────
export async function registerUser({ name, email, password }) {
  const res = await publicRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data; // { accessToken, user }
}

// ── Login ─────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  const res = await publicRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data; // { accessToken, user }
}

// ── Refresh (called internally by client.js interceptor) ─────
export async function refreshSession() {
  const res = await publicRequest('/auth/refresh', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session expired');
  return data; // { accessToken, user }
}

// ── Logout ────────────────────────────────────────────────────
export async function logoutUser() {
  // Best-effort — ignore errors so local state always clears
  try {
    await authRequest('/auth/logout', { method: 'POST' });
  } catch {
    // no-op
  }
}