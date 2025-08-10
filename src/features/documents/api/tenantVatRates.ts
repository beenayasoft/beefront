/**
 * Service API pour les taux de TVA tenant-specific
 * Phase 2 : Récupération dynamique depuis le backend
 */
import { apiClient } from '@/lib/api/client';
import { VATRateInfo } from '../types/quotes.types';

export const tenantVatRatesApi = {
  /**
   * Récupère tous les taux de TVA actifs pour le tenant
   */
  getVatRates: async (signal?: AbortSignal): Promise<VATRateInfo[]> => {
    try {
      const response = await apiClient.get('/api/quotes/vat-rates/', { signal });
      return response.data || [];
    } catch (error) {
      console.error('Erreur récupération taux TVA:', error);
      // Fallback avec taux français standard
      return getDefaultVatRates();
    }
  },

  /**
   * Récupère le taux de TVA par défaut
   */
  getDefaultVatRate: async (signal?: AbortSignal): Promise<VATRateInfo | null> => {
    try {
      const response = await apiClient.get('/vat-rates/default/', { signal });
      return response.data || null;
    } catch (error) {
      console.error('Erreur taux TVA par défaut:', error);
      return {
        id: 'fallback_20',
        code: '20',
        name: 'TVA Standard',
        rate: 20,
        rate_display: '20%',
        description: 'Taux standard français (fallback)',
        is_default: true,
        is_active: true
      };
    }
  },

  /**
   * Récupère un taux spécifique par code
   */
  getVatRateByCode: async (code: string, signal?: AbortSignal): Promise<VATRateInfo | null> => {
    try {
      const vatRates = await tenantVatRatesApi.getVatRates(signal);
      return vatRates.find(rate => rate.code === code && rate.is_active) || null;
    } catch (error) {
      console.error(`Erreur taux TVA ${code}:`, error);
      return null;
    }
  }
};

/**
 * Taux de TVA par défaut (fallback)
 */
function getDefaultVatRates(): VATRateInfo[] {
  return [
    {
      id: 'fallback_0',
      code: '0',
      name: 'TVA 0%',
      rate: 0,
      rate_display: '0%',
      description: 'Exonéré de TVA',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_5.5',
      code: '5.5',
      name: 'TVA Réduite 5,5%',
      rate: 5.5,
      rate_display: '5,5%',
      description: 'Taux réduit BTP',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_10',
      code: '10',
      name: 'TVA Réduite 10%',
      rate: 10,
      rate_display: '10%',
      description: 'Taux réduit travaux',
      is_default: false,
      is_active: true
    },
    {
      id: 'fallback_20',
      code: '20',
      name: 'TVA Standard',
      rate: 20,
      rate_display: '20%',
      description: 'Taux standard français',
      is_default: true,
      is_active: true
    }
  ];
}

export default tenantVatRatesApi;