import { apiClient } from '@/lib/api/client';
import { Material } from '../types/workLibrary';
import { DjangoPaginatedResponse, PaginationParams } from './types';
import { transformMaterial, transformMaterialToBackend } from './transformers';

export const materialsApi = {
  // Récupérer tous les matériaux
  getMaterials: async (filters?: Record<string, string>): Promise<Material[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/library/fournitures/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const materials = response.data.results || response.data;
      return materials.map(transformMaterial);
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
      throw error;
    }
  },

  // Récupérer un matériau par ID
  getMaterial: async (id: string): Promise<Material> => {
    try {
      const response = await apiClient.get(`/api/library/fournitures/${id}/`);
      return transformMaterial(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement du matériau ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau matériau
  createMaterial: async (material: Partial<Material>): Promise<Material> => {
    try {
      const backendData = transformMaterialToBackend(material);
      const response = await apiClient.post('/api/library/fournitures/', backendData);
      return transformMaterial(response.data);
    } catch (error) {
      console.error("Erreur lors de la création du matériau:", error);
      throw error;
    }
  },

  // Mettre à jour un matériau
  updateMaterial: async (id: string, material: Partial<Material>): Promise<Material> => {
    try {
      const backendData = transformMaterialToBackend(material);
      const response = await apiClient.patch(`/api/library/fournitures/${id}/`, backendData);
      return transformMaterial(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du matériau ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un matériau
  deleteMaterial: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/library/fournitures/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du matériau ${id}:`, error);
      throw error;
    }
  },

  // Matériaux groupés par catégorie
  getMaterialsByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/library/fournitures/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux par catégorie:", error);
      throw error;
    }
  },

  // Méthodes avec pagination explicite
  getMaterialsPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Material>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/library/fournitures/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformMaterial),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformMaterial),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginé des matériaux:", error);
      throw error;
    }
  },
};