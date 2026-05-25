import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,

  setAuth: (accessToken, user) => {
    set({
      accessToken,
      user,
      isAuthenticated: !!accessToken,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setLoading: (loading) => {
    set({ loading });
  }
}));

// Export lowercase version for compatibility with existing codebase
export const useAuthstore = useAuthStore;