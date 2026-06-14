import { publicRequest, authRequest } from './client';

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

export async function verifyTwoFactor({ email, otp }) {
  const res = await publicRequest('/auth/verify-2fa', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid OTP');
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

// --- Security Settings ---

export async function changePassword(currentPassword, newPassword) {
  const res = await authRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data;
}

export async function updateTwoFactor(enabled) {
  const res = await authRequest('/auth/update-2fa', {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update 2FA');
  return data;
}

export async function getSessions() {
  const res = await authRequest('/auth/sessions', { method: 'GET' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch sessions');
  return data.sessions;
}

export async function logoutAllSessions() {
  const res = await authRequest('/auth/sessions/logout-all', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to logout other sessions');
  return data;
}

export async function logoutSession(id) {
  const res = await authRequest(`/auth/sessions/${id}/logout`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to logout session');
  return data;
}

export async function getMe() {
  const res = await authRequest('/auth/me', { method: 'GET' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
  return data;
}

export async function updateProfile(profileData) {
  const res = await authRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

export async function updatePreferences(preferences) {
  const res = await authRequest('/auth/preferences', {
    method: 'PUT',
    body: JSON.stringify({ preferences }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update preferences');
  return data;
}
