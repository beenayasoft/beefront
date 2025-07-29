/**
 * Service API pour les conditions de paiement tenant-specific
 * Phase 2 : Récupération dynamique depuis le backend
 */
import { apiClient } from '@/lib/api/client';

/**
 * Interface pour une condition de paiement
 */
export interface PaymentTerm {
  id: string;
  label: string;
  days: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

/**
 * Service API pour les conditions de paiement
 */
export const paymentTermsApi = {
  /**
   * Récupère toutes les conditions de paiement actives
   */
  getPaymentTerms: async (signal?: AbortSignal): Promise<PaymentTerm[]> => {
    try {
      const response = await apiClient.get('/payment-terms/', { signal });
      return response.data || [];
    } catch (error) {
      console.error('Erreur récupération conditions paiement:', error);
      // Fallback avec conditions standard
      return getDefaultPaymentTerms();
    }
  },

  /**
   * Récupère la condition de paiement par défaut
   */
  getDefaultPaymentTerm: async (signal?: AbortSignal): Promise<PaymentTerm | null> => {
    try {
      const response = await apiClient.get('/payment-terms/default/', { signal });
      return response.data || null;
    } catch (error) {
      console.error('Erreur condition paiement par défaut:', error);
      return {
        id: 'fallback_30',
        label: '30 jours',
        days: 30,
        description: 'Paiement sous 30 jours (fallback)',
        is_default: true,
        is_active: true
      };
    }
  },

  /**
   * Récupère une condition de paiement par son ID
   */
  getPaymentTermById: async (id: string, signal?: AbortSignal): Promise<PaymentTerm | null> => {
    try {
      const response = await apiClient.get(`/payment-terms/${id}/`, { signal });
      return response.data || null;
    } catch (error) {
      console.error(`Erreur condition paiement ${id}:`, error);
      return null;
    }
  }
};

/**
 * Conditions de paiement par défaut (fallback)
 */
function getDefaultPaymentTerms(): PaymentTerm[] {
  return [
    {
      id: 'fallback_0',
      label: 'Comptant',
      days: 0,
      description: 'Paiement comptant',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_15',
      label: '15 jours',
      days: 15,
      description: 'Paiement sous 15 jours',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_30',
      label: '30 jours',
      days: 30,
      description: 'Paiement sous 30 jours',
      is_default: true,
      is_active: true
    },
    {
      id: 'fallback_45',
      label: '45 jours',
      days: 45,
      description: 'Paiement sous 45 jours',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_60',
      label: '60 jours',
      days: 60,
      description: 'Paiement sous 60 jours',
      is_default: false,
      is_active: true
    }
  ];
}

export default paymentTermsApi;