/**
 * API Service pour l'intégration Library ↔ CRM Suppliers
 * Implémentation basée sur les contrats de données supplier-contracts.ts
 */

import { apiClient } from '@/lib/api/client';
import {
  CRMSupplierDetails,
  CRMSupplierSummary,
  SupplierSearchResponse,
  SupplierStatsResponse,
  SupplierApiError,
  SUPPLIER_DEFAULTS,
  SUPPLIER_ERROR_MESSAGES,
  isSupplierApiError,
  isValidSupplierUUID
} from '../types/supplier-contracts';

/**
 * Service API pour la gestion des fournisseurs intégrés
 */
export class SuppliersApiService {
  private readonly baseUrl = '/api/library/fournitures';
  private readonly timeout = SUPPLIER_DEFAULTS.API_TIMEOUT_MS;

  /**
   * Recherche de fournisseurs dans le service CRM
   */
  async searchSuppliers(query: string): Promise<CRMSupplierSummary[]> {
    if (!query || query.length < SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH) {
      throw new Error(SUPPLIER_ERROR_MESSAGES.SEARCH_TOO_SHORT);
    }

    try {
      console.log('🔍 [SUPPLIERS API] Recherche fournisseurs:', query);
      
      const response = await apiClient.get<SupplierSearchResponse>(
        `${this.baseUrl}/suppliers_search/`,
        {
          params: { q: query.trim() },
          timeout: this.timeout
        }
      );

      if (isSupplierApiError(response.data)) {
        throw new Error(response.data.error);
      }

      return response.data.results || [];
    } catch (error: any) {
      console.error('❌ [SUPPLIERS API] Supplier search failed:', error);
      
      if (error.response?.status === 503) {
        throw new Error(SUPPLIER_ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Paramètres de recherche invalides');
      }
      
      throw new Error(SUPPLIER_ERROR_MESSAGES.NETWORK_ERROR);
    }
  }


  /**
   * Récupération des détails d'un fournisseur par ID
   */
  async getSupplierDetails(supplierId: string): Promise<CRMSupplierDetails> {
    if (!isValidSupplierUUID(supplierId)) {
      throw new Error(SUPPLIER_ERROR_MESSAGES.INVALID_SUPPLIER_ID);
    }

    try {
      const response = await apiClient.get<CRMSupplierDetails>(
        `/api/suppliers/${supplierId}/`, // Via API Gateway → CRM
        { timeout: this.timeout }
      );

      if (isSupplierApiError(response.data)) {
        throw new Error(response.data.error);
      }

      // Vérifier que c'est bien un fournisseur
      if (response.data.relation !== 'fournisseur') {
        throw new Error('Le tiers sélectionné n\'est pas un fournisseur');
      }

      return response.data;
    } catch (error: any) {
      console.error('Supplier details fetch failed:', error);
      
      if (error.response?.status === 404) {
        throw new Error(SUPPLIER_ERROR_MESSAGES.SUPPLIER_NOT_FOUND);
      }
      if (error.response?.status === 503) {
        throw new Error(SUPPLIER_ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      }
      
      throw new Error(SUPPLIER_ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  /**
   * Statistiques des fournisseurs cross-service
   */
  async getSupplierStats(): Promise<SupplierStatsResponse> {
    try {
      const response = await apiClient.get<SupplierStatsResponse>(
        `${this.baseUrl}/suppliers_stats/`,
        { timeout: this.timeout }
      );

      if (isSupplierApiError(response.data)) {
        // Retourner stats par défaut avec message d'erreur
        return {
          total_suppliers: 0,
          active_suppliers: 0,
          error: response.data.error
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Supplier stats fetch failed:', error);
      
      // Graceful degradation - retourner stats par défaut
      return {
        total_suppliers: 0,
        active_suppliers: 0,
        error: error.response?.status === 503 
          ? SUPPLIER_ERROR_MESSAGES.SERVICE_UNAVAILABLE
          : SUPPLIER_ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  }

  /**
   * Validation qu'un fournisseur existe
   */
  async validateSupplierExists(supplierId: string): Promise<boolean> {
    try {
      await this.getSupplierDetails(supplierId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupération du nom d'un fournisseur uniquement (optimisé)
   */
  async getSupplierNameOnly(supplierId: string): Promise<string | null> {
    try {
      const details = await this.getSupplierDetails(supplierId);
      return details.nom;
    } catch (error) {
      console.warn(`Could not fetch supplier name for ${supplierId}:`, error);
      return null;
    }
  }
}

// Instance singleton
export const suppliersApi = new SuppliersApiService();

/**
 * Fonctions utilitaires pour l'intégration
 */
export const supplierUtils = {
  /**
   * Debounced search pour éviter trop d'appels API
   */
  createDebouncedSearch: (searchFn: (query: string) => Promise<CRMSupplierSummary[]>, delay = SUPPLIER_DEFAULTS.SEARCH_DEBOUNCE_MS) => {
    let timeoutId: NodeJS.Timeout;
    
    return (query: string): Promise<CRMSupplierSummary[]> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        
        if (query.length < SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH) {
          resolve([]);
          return;
        }

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchFn(query);
            resolve(results);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  },

  /**
   * Formatage pour affichage dans les selects
   */
  formatSupplierForSelect: (supplier: CRMSupplierSummary) => ({
    value: supplier.id,
    label: supplier.siret 
      ? `${supplier.nom} (${supplier.siret})`
      : supplier.nom,
    data: supplier
  }),

  /**
   * Filtrage des fournisseurs par critères
   */
  filterSuppliers: (suppliers: CRMSupplierSummary[], filters: {
    hasEmail?: boolean;
    hasSiret?: boolean;
    hasPhone?: boolean;
  }) => {
    return suppliers.filter(supplier => {
      if (filters.hasEmail && !supplier.email) return false;
      if (filters.hasSiret && !supplier.siret) return false;
      if (filters.hasPhone && !supplier.telephone) return false;
      return true;
    });
  },

  /**
   * Tri des fournisseurs par pertinence
   */
  sortSuppliersByRelevance: (suppliers: CRMSupplierSummary[], query: string) => {
    if (!suppliers || !Array.isArray(suppliers)) {
      return [];
    }
    
    return suppliers.sort((a, b) => {
      // Exact match en premier
      const aExact = a.nom.toLowerCase() === query.toLowerCase();
      const bExact = b.nom.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Commence par la query
      const aStarts = a.nom.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.nom.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Alphabétique
      return a.nom.localeCompare(b.nom);
    });
  }
};