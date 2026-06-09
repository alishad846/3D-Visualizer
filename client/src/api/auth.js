import { publicRequest } from './client';

export async function registerUser({ name, email, password }) {
  const res = await publicRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function loginUser({ email, password }) {
  const res = await publicRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function requestPasswordReset({ email }) {
  const res = await publicRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const res = await publicRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
}

export async function refreshSession() {
  const res = await publicRequest('/auth/refresh', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session expired');
  return data;
}

export async function logoutUser() {
  try {
    await publicRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Cookie-only logout should not block local auth cleanup.
  }
}
