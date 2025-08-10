/**
 * Service API pour la gestion des adresses
 */
import { apiClient } from '@/lib/api/client';

export interface Address {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  is_facturation: boolean;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  libelle?: string;
  rue?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  is_facturation?: boolean;
  tier: string; // Requis pour la création
}

export interface UpdateAddressRequest {
  libelle?: string;
  rue?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  is_facturation?: boolean;
}

/**
 * Service API pour les adresses
 */
export const addressesApi = {
  /**
   * Crée une nouvelle adresse
   */
  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    try {
      console.log('🔄 API createAddress - Création de l\'adresse:', data);
      
      const response = await apiClient.post('/api/adresses/', data);
      
      console.log('✅ API createAddress - Adresse créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'adresse:', error);
      throw error;
    }
  },

  /**
   * Met à jour une adresse existante
   */
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    try {
      console.log('🔄 API updateAddress - Mise à jour de l\'adresse:', { id, data });
      
      const response = await apiClient.put(`/api/adresses/${id}/`, data);
      
      console.log('✅ API updateAddress - Adresse mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'adresse:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une adresse
   */
  getAddress: async (id: string): Promise<Address> => {
    try {
      const response = await apiClient.get(`/api/adresses/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'adresse ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère toutes les adresses d'un tier
   */
  getAddressesByTier: async (tierId: string): Promise<Address[]> => {
    try {
      const response = await apiClient.get(`/api/adresses/?tier=${tierId}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des adresses du tier ${tierId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une adresse
   */
  deleteAddress: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/adresses/${id}/`);
      console.log(`✅ Adresse ${id} supprimée avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'adresse ${id}:`, error);
      throw error;
    }
  }
};