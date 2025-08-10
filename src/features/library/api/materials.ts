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
      console.log('🔍 [GET MATERIAL] Récupération du matériau ID:', id);
      const response = await apiClient.get(`/api/library/fournitures/${id}/`);
      console.log('📥 [GET MATERIAL] Réponse brute du backend:', response.data);
      console.log('📥 [GET MATERIAL] Supplier_id dans la réponse:', response.data.supplier_id);
      
      const transformedMaterial = transformMaterial(response.data);
      console.log('🔄 [GET MATERIAL] Matériau transformé:', transformedMaterial);
      console.log('🔄 [GET MATERIAL] Supplier_id final:', transformedMaterial.supplier_id);
      
      return transformedMaterial;
    } catch (error) {
      console.error(`❌ [GET MATERIAL] Erreur lors du chargement du matériau ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau matériau
  createMaterial: async (material: Partial<Material>): Promise<Material> => {
    try {
      console.log('🔍 [CREATE MATERIAL] Données frontend reçues:', material);
      console.log('🔍 [CREATE MATERIAL] Type de reference:', typeof material.reference, 'Value:', material.reference);
      
      const backendData = transformMaterialToBackend(material);
      
      // HACK TEMPORAIRE: Forcer une copie profonde pour éviter les mutations d'objet
      const cleanBackendData = JSON.parse(JSON.stringify(backendData));
      console.log('📤 [CREATE MATERIAL] Données envoyées au backend:', backendData);
      console.log('📤 [CREATE MATERIAL] Type de reference backend:', typeof backendData.reference, 'Value:', backendData.reference);
      console.log('📤 [CREATE MATERIAL] Données complètes backend:', JSON.stringify(backendData, null, 2));
      
      // Intercepteur temporaire pour voir les données réellement envoyées
      const requestInterceptor = apiClient.interceptors.request.use((config) => {
        if (config.url?.includes('/api/library/fournitures/')) {
          console.log('🌐 [AXIOS REQUEST] URL:', config.url);
          console.log('🌐 [AXIOS REQUEST] Method:', config.method);
          console.log('🌐 [AXIOS REQUEST] Headers:', config.headers);
          console.log('🌐 [AXIOS REQUEST] Data avant envoi:', typeof config.data, config.data);
          console.log('🌐 [AXIOS REQUEST] Data JSON:', JSON.stringify(config.data));
        }
        return config;
      });
      
      try {
        const response = await apiClient.post('/api/library/fournitures/', cleanBackendData);
        return transformMaterial(response.data);
      } finally {
        // Nettoyer l'intercepteur après utilisation
        apiClient.interceptors.request.eject(requestInterceptor);
      }
    } catch (error) {
      console.error("❌ [CREATE MATERIAL] Erreur lors de la création du matériau:", error);
      if (error.response?.data) {
        console.error("📋 [CREATE MATERIAL] Détails de l'erreur backend:", error.response.data);
      }
      throw error;
    }
  },

  // Mettre à jour un matériau
  updateMaterial: async (id: string, material: Partial<Material>): Promise<Material> => {
    try {
      console.log('🔍 [UPDATE MATERIAL] Données frontend reçues:', material);
      console.log('🔍 [UPDATE MATERIAL] Supplier ID:', material.supplier_id);
      console.log('🔍 [UPDATE MATERIAL] Supplier data:', material.supplier);
      
      const backendData = transformMaterialToBackend(material);
      console.log('📤 [UPDATE MATERIAL] Données transformées pour backend:', backendData);
      console.log('📤 [UPDATE MATERIAL] Backend supplier_id:', backendData.supplier_id);
      
      const response = await apiClient.patch(`/api/library/fournitures/${id}/`, backendData);
      
      console.log('✅ [UPDATE MATERIAL] Réponse du backend:', response.data);
      const transformedMaterial = transformMaterial(response.data);
      console.log('🔄 [UPDATE MATERIAL] Matériau transformé:', transformedMaterial);
      console.log('🔄 [UPDATE MATERIAL] Matériau supplier_id final:', transformedMaterial.supplier_id);
      
      return transformedMaterial;
    } catch (error) {
      console.error(`❌ [UPDATE MATERIAL] Erreur lors de la mise à jour du matériau ${id}:`, error);
      if (error.response?.data) {
        console.error("📋 [UPDATE MATERIAL] Détails de l'erreur backend:", error.response.data);
      }
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