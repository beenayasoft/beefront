import { apiClient } from '@/lib/api/client';
import { Work } from '../types/workLibrary';
import { DjangoPaginatedResponse, PaginationParams } from './types';
import { transformWork, transformWorkToBackend } from './transformers';

export const worksApi = {
  // Récupérer tous les ouvrages
  getWorks: async (filters?: Record<string, string>): Promise<Work[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/ouvrages/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const works = response.data.results || response.data;
      return works.map(transformWork);
    } catch (error) {
      console.error("Erreur lors du chargement des ouvrages:", error);
      throw error;
    }
  },

  // Récupérer un ouvrage par ID avec détails
  getWork: async (id: string): Promise<Work> => {
    try {
      const response = await apiClient.get(`/api/ouvrages/${id}/`);
      return transformWork(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel ouvrage
  createWork: async (work: Partial<Work>): Promise<Work> => {
    try {
      const backendData = transformWorkToBackend(work);
      const response = await apiClient.post('/api/ouvrages/', backendData);
      return transformWork(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de l'ouvrage:", error);
      throw error;
    }
  },

  // Mettre à jour un ouvrage
  updateWork: async (id: string, work: Partial<Work>): Promise<Work> => {
    try {
      const backendData = transformWorkToBackend(work);
      const response = await apiClient.patch(`/api/ouvrages/${id}/`, backendData);
      return transformWork(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ouvrage
  deleteWork: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/ouvrages/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Ouvrages groupés par catégorie
  getWorksByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/ouvrages/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des ouvrages par catégorie:", error);
      throw error;
    }
  },

  // Méthodes avec pagination explicite
  getWorksPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Work>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/ouvrages/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformWork),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformWork),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginé des ouvrages:", error);
      throw error;
    }
  },
};