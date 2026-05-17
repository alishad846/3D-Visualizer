import { create } from 'zustand';

export const useViewerstore = create((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    // fetch logic here
    set({ loading: false });
  }
}));