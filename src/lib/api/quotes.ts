/**
 * Service API pour les devis
 * Fournit toutes les méthodes pour interagir avec l'API des devis
 */
import { apiClient, buildQueryParams, handleApiError } from './client';
import {
  Quote,
  QuoteItem,
  QuoteStatus,
  VATRate,
  PaginatedQuotesResponse,
  CreateQuoteData,
  CreateQuoteItemData,
  QuoteFilters
} from './types/quotes.types';

/**
 * Service API pour les devis
 */
const quotesApi = {
  /**
   * Récupère une liste paginée de devis avec filtres optionnels
   */
  getQuotes: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: QuoteFilters,
    signal?: AbortSignal
  ): Promise<PaginatedQuotesResponse> => {
    try {
      const params = buildQueryParams(page, pageSize, filters);
      const response = await apiClient.get('/quotes/', { params, signal });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un devis par son ID
   */
  getQuoteDetails: async (id: string, signal?: AbortSignal): Promise<Quote> => {
    try {
      const response = await apiClient.get(`/quotes/${id}/`, { signal });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les éléments d'un devis
   */
  getQuoteItems: async (quoteId: string, signal?: AbortSignal): Promise<QuoteItem[]> => {
    try {
      const response = await apiClient.get(`/quote-items/`, {
        params: { quote_id: quoteId },
        signal
      });
      return response.data.results || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des éléments du devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau devis
   */
  createQuote: async (data: CreateQuoteData): Promise<Quote> => {
    try {
      const response = await apiClient.post('/quotes/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }
  },

  /**
   * Met à jour un devis existant
   */
  updateQuote: async (id: string, data: CreateQuoteData): Promise<Quote> => {
    try {
      const response = await apiClient.put(`/quotes/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un devis
   */
  deleteQuote: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotes/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel élément de devis
   */
  createQuoteItem: async (data: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.post('/quote-items/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément de devis:', error);
      throw error;
    }
  },

  /**
   * Met à jour un élément de devis existant
   */
  updateQuoteItem: async (id: string, data: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.put(`/quote-items/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément de devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un élément de devis
   */
  deleteQuoteItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quote-items/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément de devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les statuts de devis disponibles
   */
  getQuoteStatuses: async (signal?: AbortSignal): Promise<QuoteStatus[]> => {
    try {
      const response = await apiClient.get('/quote-statuses/', { signal });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts de devis:', error);
      throw error;
    }
  },

  /**
   * Récupère les taux de TVA disponibles
   */
  getVATRates: async (signal?: AbortSignal): Promise<VATRate[]> => {
    try {
      const response = await apiClient.get('/api/quotes/vat-rates/', { signal });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des taux de TVA:', error);
      // En cas d'erreur, retourner des taux de TVA par défaut
      return [VATRate.REDUCED_55, VATRate.REDUCED_10, VATRate.STANDARD]; // Taux de TVA français par défaut
    }
  },

  /**
   * Envoie un devis par email
   */
  sendQuote: async (id: string, emailData: { recipient_email: string; message?: string }): Promise<void> => {
    try {
      await apiClient.post(`/quotes/${id}/send/`, emailData);
    } catch (error) {
      console.error(`Erreur lors de l'envoi du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Accepte un devis
   */
  acceptQuote: async (id: string, data?: { notes?: string }): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/accept/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'acceptation du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Rejette un devis
   */
  rejectQuote: async (id: string, data?: { reason?: string }): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/reject/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du rejet du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Annule un devis
   */
  cancelQuote: async (id: string, data?: { reason?: string }): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/cancel/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'annulation du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Duplique un devis
   */
  duplicateQuote: async (id: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/duplicate/`, {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la duplication du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exporte un devis au format PDF
   */
  exportQuoteToPdf: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/quotes/${id}/export/pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export du devis ${id} en PDF:`, error);
      throw error;
    }
  },

  /**
   * Exporte un devis au format Excel
   */
  exportQuoteToExcel: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/quotes/${id}/export/excel/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export du devis ${id} en Excel:`, error);
      throw error;
    }
  }
};

export { quotesApi };
export default quotesApi;
