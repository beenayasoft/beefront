import { apiClient } from '@/lib/api/client';
import { Labor } from '../types/workLibrary';
import { DjangoPaginatedResponse, PaginationParams } from './types';
import { transformLabor, transformLaborToBackend } from './transformers';

export const laborApi = {
  // Récupérer toute la main d'œuvre
  getLabor: async (filters?: Record<string, string>): Promise<Labor[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/main-oeuvre/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const labor = response.data.results || response.data;
      return labor.map(transformLabor);
    } catch (error) {
      console.error("Erreur lors du chargement de la main d'œuvre:", error);
      throw error;
    }
  },

  // Récupérer un type de main d'œuvre par ID
  getLaborItem: async (id: string): Promise<Labor> => {
    try {
      const response = await apiClient.get(`/api/main-oeuvre/${id}/`);
      return transformLabor(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau type de main d'œuvre
  createLabor: async (labor: Partial<Labor>): Promise<Labor> => {
    try {
      const backendData = transformLaborToBackend(labor);
      const response = await apiClient.post('/api/main-oeuvre/', backendData);
      return transformLabor(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de la main d'œuvre:", error);
      throw error;
    }
  },

  // Mettre à jour un type de main d'œuvre
  updateLabor: async (id: string, labor: Partial<Labor>): Promise<Labor> => {
    try {
      const backendData = transformLaborToBackend(labor);
      const response = await apiClient.patch(`/api/main-oeuvre/${id}/`, backendData);
      return transformLabor(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un type de main d'œuvre
  deleteLabor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/main-oeuvre/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Main d'œuvre groupée par catégorie
  getLaborByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/main-oeuvre/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement de la main d'œuvre par catégorie:", error);
      throw error;
    }
  },

  // Méthodes avec pagination explicite
  getLaborPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Labor>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/main-oeuvre/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformLabor),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformLabor),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginé de la main d'œuvre:", error);
      throw error;
    }
  },
};