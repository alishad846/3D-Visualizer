import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [
    { id: 1, text: 'Welcome to ScanVista Creator Pro!', read: false, time: new Date().toISOString() }
  ],
  unreadCount: 1,
  
  addNotification: (text) => set((state) => {
    const newNotif = { id: Date.now(), text, read: false, time: new Date().toISOString() };
    return {
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));
