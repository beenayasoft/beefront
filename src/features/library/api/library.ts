import { Work, Material, Labor } from '../types/workLibrary';
import { categoriesApi } from './categories';
import { materialsApi } from './materials';
import { laborApi } from './labor';
import { worksApi } from './works';
import { ingredientsApi } from './ingredients';
import { searchApi } from './search';
import { statsApi } from './stats';
import { compositeApi } from './composite';
import { DjangoPaginatedResponse, PaginationParams, ApiResponse, extractResults, isPaginatedResponse } from './types';

// API Bibliothèque - Point d'entrée unifié
export const libraryApi = {
  // Délégation aux modules spécialisés
  ...categoriesApi,
  ...materialsApi,
  ...laborApi,
  ...worksApi,
  ...ingredientsApi,
  ...searchApi,
  ...statsApi,
  ...compositeApi,

  // ==================== MÉTHODES COMBINÉES ====================
  
  // Récupérer tous les éléments de la bibliothèque
  getAllLibraryItems: async (): Promise<(Material | Labor | Work)[]> => {
    try {
      console.log("API: Récupération de tous les éléments de la bibliothèque");
      
      const [materials, labor, works] = await Promise.all([
        materialsApi.getMaterials(),
        laborApi.getLabor(),
        worksApi.getWorks(),
      ]);
      
      return [...materials, ...labor, ...works];
    } catch (error) {
      console.error("Erreur lors du chargement de la bibliothèque complète:", error);
      throw error;
    }
  },

  // Fallback pour recherche avec APIs séparées
  searchLibraryFallback: async (query: string): Promise<(Material | Labor | Work)[]> => {
    try {
      const [materials, labor, works] = await Promise.all([
        materialsApi.getMaterials({ search: query }),
        laborApi.getLabor({ search: query }),
        worksApi.getWorks({ search: query }),
      ]);
      
      return [...materials, ...labor, ...works];
    } catch (error) {
      console.error("Erreur lors de la recherche fallback:", error);
      throw error;
    }
  },
};

// Exports pour compatibilité
export type { DjangoPaginatedResponse, PaginationParams, ApiResponse };
export { extractResults, isPaginatedResponse };

// Exports des APIs spécialisées
export { categoriesApi } from './categories';
export { materialsApi } from './materials';
export { laborApi } from './labor';
export { worksApi } from './works';
export { ingredientsApi } from './ingredients';
export { searchApi } from './search';
export { statsApi } from './stats';
export { compositeApi } from './composite';