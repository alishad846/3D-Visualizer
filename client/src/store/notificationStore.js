import { create } from 'zustand';
import { fetchNotifications, markNotificationsAsRead, clearNotificationsApi } from '../api/notifications';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchUserNotifications: async () => {
    try {
      const data = await fetchNotifications();
      const notifs = data.notifications || [];
      const unread = notifs.filter(n => !n.read).length;
      set({ notifications: notifs, unreadCount: unread });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },

  markAllAsRead: async () => {
    // Optimistic
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));

    try {
      await markNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      // We could revert here, but for notifications optimistic failure is usually acceptable
    }
  },

  clearNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });
    try {
      await clearNotificationsApi();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }
}));
