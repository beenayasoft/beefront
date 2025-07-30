import { apiClient } from '@/lib/api/client';
import { Work, Material, Labor, WorkCategory } from '../types/workLibrary';
import { transformCategory, transformMaterial, transformLabor, transformWork } from './transformers';

export const searchApi = {
  // Rechercher dans la bibliothèque (endpoint dédié Django)
  searchLibrary: async (query: string): Promise<{
    categories: WorkCategory[];
    fournitures: Material[];
    main_oeuvre: Labor[];
    ouvrages: Work[];
    total_results: number;
  }> => {
    try {
      const response = await apiClient.get(`/api/search/?q=${encodeURIComponent(query)}`);
      
      return {
        categories: (response.data.categories || []).map(transformCategory),
        fournitures: (response.data.fournitures || []).map(transformMaterial),
        main_oeuvre: (response.data.main_oeuvre || []).map(transformLabor),
        ouvrages: (response.data.ouvrages || []).map(transformWork),
        total_results: response.data.total_results || 0,
      };
    } catch (error) {
      console.error("Erreur lors de la recherche dans la bibliothèque:", error);
      throw error;
    }
  },

  // Version simple pour compatibilité (retourne tous les résultats dans un tableau)
  searchLibrarySimple: async (query: string): Promise<(Material | Labor | Work)[]> => {
    try {
      const results = await searchApi.searchLibrary(query);
      return [...results.fournitures, ...results.main_oeuvre, ...results.ouvrages];
    } catch (error) {
      console.error("Erreur lors de la recherche simple dans la bibliothèque:", error);
      throw error;
    }
  },
};