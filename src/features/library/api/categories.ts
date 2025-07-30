import { apiClient } from '@/lib/api/client';
import { WorkCategory } from '../types/workLibrary';
import { transformCategory } from './transformers';

export const categoriesApi = {
  // Récupérer toutes les catégories (avec pagination Django)
  getCategories: async (filters?: Record<string, string>): Promise<WorkCategory[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/categories/?${params.toString()}`);
      
      // Django REST retourne {count, next, previous, results}
      const categories = response.data.results || response.data;
      return categories.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      throw error;
    }
  },

  // Récupérer les catégories racines
  getRootCategories: async (): Promise<WorkCategory[]> => {
    try {
      const response = await apiClient.get('/api/categories/racines/');
      return response.data.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories racines:", error);
      throw error;
    }
  },

  // Statistiques des catégories
  getCategoryStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/categories/stats/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques des catégories:", error);
      throw error;
    }
  },
};