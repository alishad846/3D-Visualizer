import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  preferences: JSON.parse(localStorage.getItem('scanvista-settings-prefs')) || {
    language: 'English (US)',
    alerts: true,
    completion: false,
    newsletter: true
  },
  updatePreference: (key, value) => set((state) => {
    const updated = { ...state.preferences, [key]: value };
    localStorage.setItem('scanvista-settings-prefs', JSON.stringify(updated));
    return { preferences: updated };
  }),
}));
