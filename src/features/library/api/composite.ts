/**
 * API Composite Library - Endpoint optimisé unique
 * OPTIMISATION Milestone 3.1: Utilise l'endpoint /composite/all_items/ 
 * Réduction 3 appels → 1 appel (-200ms)
 */

import { apiClient } from '@/lib/api/client';
import { transformMaterial, transformLabor, transformWork } from './transformers';
import { Material, Labor, Work } from '../types/workLibrary';
import { ApiResponse, extractResults } from './types';

// Interface pour la réponse de l'endpoint composite optimisé
export interface CompositeLibraryResponse {
  fournitures: {
    count: number;
    total: number;
    items: any[];
  };
  main_oeuvre: {
    count: number;
    total: number;
    items: any[];
  };
  ouvrages: {
    count: number;
    total: number;
    items: any[];
  };
  pagination: {
    page: number;
    page_size: number;
    limit_per_type: number;
    returned_items: number;
    total_items: number;
  };
  filters_applied: {
    search?: string;
    category?: string;
  };
  performance: {
    endpoint: string;
    milestone: string;
    db_optimizations: string[];
    queries_saved: number;
    queryset_optimization: boolean;
  };
}

// Paramètres pour l'endpoint composite
export interface CompositeParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
}

/**
 * API Composite pour récupérer tous les éléments library en un seul appel optimisé
 */
export const compositeApi = {
  /**
   * Récupère tous les éléments de la bibliothèque via l'endpoint composite optimisé
   * OPTIMISATION: 1 appel au lieu de 3 (-200ms network latency)
   */
  getAllLibraryItems: async (params: CompositeParams = {}): Promise<{
    materials: Material[];
    labor: Labor[];
    works: Work[];
    pagination: CompositeLibraryResponse['pagination'];
    performance: CompositeLibraryResponse['performance'];
  }> => {
    try {
      console.log('🚀 [COMPOSITE API] Appel endpoint optimisé /composite/all_items/');
      
      const queryParams = new URLSearchParams();
      
      // Paramètres avec valeurs par défaut optimisées
      queryParams.append('page_size', (params.page_size || 100).toString());
      queryParams.append('page', (params.page || 1).toString());
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.category) {
        queryParams.append('category', params.category);
      }
      
      const response = await apiClient.get<CompositeLibraryResponse>(
        `/library/composite/all_items/?${queryParams.toString()}`
      );
      
      const data = response.data;
      
      // Transformation des données backend → frontend
      const materials = data.fournitures.items.map(transformMaterial);
      const labor = data.main_oeuvre.items.map(transformLabor);
      const works = data.ouvrages.items.map(transformWork);
      
      console.log('✅ [COMPOSITE API] Données transformées:', {
        materials: materials.length,
        labor: labor.length,
        works: works.length,
        performance: data.performance
      });
      
      return {
        materials,
        labor,
        works,
        pagination: data.pagination,
        performance: data.performance
      };
      
    } catch (error: any) {
      console.error('❌ [COMPOSITE API] Erreur endpoint composite:', error);
      
      // Enrichir l'erreur avec des détails
      if (error.response?.status === 404) {
        throw new Error('Endpoint composite non disponible - fallback requis');
      }
      
      throw error;
    }
  },

  /**
   * Recherche dans la bibliothèque via l'endpoint composite
   * OPTIMISATION: Utilise le filtrage intégré côté backend
   */
  searchLibrary: async (query: string, params: Omit<CompositeParams, 'search'> = {}): Promise<{
    materials: Material[];
    labor: Labor[];
    works: Work[];
    pagination: CompositeLibraryResponse['pagination'];
  }> => {
    try {
      console.log(`🔍 [COMPOSITE API] Recherche: "${query}"`);
      
      const result = await compositeApi.getAllLibraryItems({
        ...params,
        search: query
      });
      
      return {
        materials: result.materials,
        labor: result.labor,
        works: result.works,
        pagination: result.pagination
      };
      
    } catch (error) {
      console.error('❌ [COMPOSITE API] Erreur recherche composite:', error);
      throw error;
    }
  },

  /**
   * Filtrage par catégorie via l'endpoint composite
   */
  getLibraryByCategory: async (categoryId: string, params: Omit<CompositeParams, 'category'> = {}): Promise<{
    materials: Material[];
    labor: Labor[];
    works: Work[];
    pagination: CompositeLibraryResponse['pagination'];
  }> => {
    try {
      console.log(`📂 [COMPOSITE API] Filtrage catégorie: ${categoryId}`);
      
      const result = await compositeApi.getAllLibraryItems({
        ...params,
        category: categoryId
      });
      
      return {
        materials: result.materials,
        labor: result.labor,
        works: result.works,
        pagination: result.pagination
      };
      
    } catch (error) {
      console.error('❌ [COMPOSITE API] Erreur filtrage catégorie:', error);
      throw error;
    }
  }
};

// Export pour intégration dans l'API principale
export default compositeApi;
