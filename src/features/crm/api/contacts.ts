/**
 * Service API pour la gestion des contacts
 */
import { apiClient } from '@/lib/api/client';

export interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  is_contact_principal_devis: boolean;
  is_contact_principal_facture: boolean;
  tier: string;
}

export interface UpdateContactRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  is_contact_principal_devis?: boolean;
  is_contact_principal_facture?: boolean;
}

/**
 * Service API pour les contacts
 */
export const contactsApi = {
  /**
   * Met à jour un contact existant
   */
  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    try {
      console.log('🔄 API updateContact - Mise à jour du contact:', { id, data });
      
      const response = await apiClient.put(`/api/contacts/${id}/`, data);
      
      console.log('✅ API updateContact - Contact mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du contact:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un contact
   */
  getContact: async (id: string): Promise<Contact> => {
    try {
      const response = await apiClient.get(`/api/contacts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du contact ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau contact
   */
  createContact: async (data: UpdateContactRequest & { tier: string }): Promise<Contact> => {
    try {
      console.log('🔄 API createContact - Création du contact:', data);
      
      const response = await apiClient.post('/api/contacts/', data);
      
      console.log('✅ API createContact - Contact créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du contact:', error);
      throw error;
    }
  },

  /**
   * Supprime un contact
   */
  deleteContact: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/contacts/${id}/`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du contact ${id}:`, error);
      throw error;
    }
  }
};