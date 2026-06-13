import { authRequest } from './client';

export const fetchNotifications = async () => {
  const res = await authRequest('/notifications');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
  return data;
};

export const markNotificationsAsRead = async () => {
  const res = await authRequest('/notifications/read', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to mark notifications as read');
  return data;
};

export const clearNotificationsApi = async () => {
  const res = await authRequest('/notifications', { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear notifications');
  return data;
};
