import { create } from 'zustand';
import { fetchMyProjects } from '../api/projects';
import { fetchProductsByProject, fetchFavorites, toggleFavoriteApi } from '../api/products';

export const useWorkspaceStore = create((set, get) => ({
  projects: [],
  activeProject: null,
  products: [],
  activeProduct: null,
  favorites: [],
  loadingProjects: false,
  loadingProducts: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  
  setFavorites: (favorites) => set({ favorites }),

  fetchUserFavorites: async () => {
    try {
      const data = await fetchFavorites();
      set({ favorites: data.favorites || [] });
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  },

  toggleFavorite: async (id) => {
    const state = get();
    const isFav = state.favorites.includes(id);
    
    // Optimistic update
    set({
      favorites: isFav 
        ? state.favorites.filter(fid => fid !== id)
        : [...state.favorites, id]
    });

    try {
      await toggleFavoriteApi(id);
    } catch (err) {
      console.error('Failed to toggle favorite on backend:', err);
      // Revert on error
      set({ favorites: state.favorites });
    }
  },
  
  setActiveProject: (project) => {
    set({ activeProject: project, activeProduct: null, products: [] });
    if (project) {
      get().fetchProductsForActiveProject(project.id);
      localStorage.setItem('scanvista-active-project-id', project.id);
    } else {
      localStorage.removeItem('scanvista-active-project-id');
    }
  },
  
  setProducts: (products) => set({ products }),
  setActiveProduct: (product) => set({ activeProduct: product }),

  fetchProjects: async () => {
    // If already loading, ignore
    if (get().loadingProjects) return;
    set({ loadingProjects: true, error: null });
    
    try {
      const data = await fetchMyProjects();
      const projects = Array.isArray(data) ? data : [];
      set({ projects, loadingProjects: false });

      // Automatically select active project from localStorage or default to first
      const savedProjectId = localStorage.getItem('scanvista-active-project-id');
      const savedProject = projects.find(p => p.id === savedProjectId);
      
      if (savedProject) {
        get().setActiveProject(savedProject);
      } else if (projects.length > 0) {
        get().setActiveProject(projects[0]);
      } else {
        set({ activeProject: null });
      }
    } catch (err) {
      set({ error: err.message || 'Failed to fetch projects', loadingProjects: false });
    }
  },

  fetchProductsForActiveProject: async (projectId) => {
    set({ loadingProducts: true });
    try {
      const data = await fetchProductsByProject(projectId);
      const products = Array.isArray(data) ? data : [];
      set({ products, loadingProducts: false });
      
      // Automatically select the first product if none selected
      if (products.length > 0) {
        set({ activeProduct: products[0] });
      } else {
        set({ activeProduct: null });
      }
    } catch (err) {
      console.error('Failed to fetch products for project:', err);
      set({ products: [], loadingProducts: false, activeProduct: null });
    }
  }
}));
