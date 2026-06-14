import { create } from 'zustand';
import { updatePreferences } from '../api/auth';

export const useSettingsStore = create((set, get) => ({
  preferences: {
    language: 'English (US)',
    alerts: true,
    completion: false,
    newsletter: true
  },
  
  setPreferences: (prefs) => set({ preferences: { ...get().preferences, ...prefs } }),

  updatePreference: async (key, value) => {
    const currentState = get().preferences;
    const updated = { ...currentState, [key]: value };
    
    // Optimistic UI update
    set({ preferences: updated });
    
    try {
      await updatePreferences(updated);
    } catch (err) {
      console.error('Failed to sync preferences to backend:', err);
      // Revert on failure
      set({ preferences: currentState });
    }
  },
}));
