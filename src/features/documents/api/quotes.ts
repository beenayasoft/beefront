/**
 * Service API pour les devis
 * Fournit toutes les méthodes pour interagir avec l'API des devis
 */
import { apiClient, buildQueryParams, handleApiError } from '@/lib/api/client';
import {
  Quote,
  QuoteItem,
  QuoteStatus,
  VATRate,
  VATRateInfo,
  PaginatedQuotesResponse,
  CreateQuoteData,
  CreateQuoteItemData,
  QuoteFilters
} from '../types/quotes.types';

/**
 * Transforme les données d'un élément de devis du format backend (snake_case) vers frontend (camelCase)
 */
const transformQuoteItem = (item: any): QuoteItem => ({
  id: item.id,
  type: item.type,
  typeDisplay: item.typeDisplay,
  parent: item.parent,
  parentInfo: item.parentInfo,
  position: item.position,
  reference: item.reference,
  designation: item.designation,
  description: item.description,
  unit: item.unit,
  quantity: item.quantity,
  unitPrice: item.unitPrice || 0,
  discount: item.discount || 0,
  vatRate: String(item.vatRate || '20'), // ✅ Conversion vers string
  vatRateDisplay: item.vatRateDisplay,
  margin: item.margin,
  totalHt: item.totalHt || 0,
  totalTtc: item.totalTtc || 0,
  workId: item.workId,
  children: item.children?.map(transformQuoteItem),
  quoteNumber: item.quoteNumber,
  quote: item.quote,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Transforme les données d'un devis du format backend (snake_case) vers frontend (camelCase)
 */
const transformQuote = (quote: any): Quote => ({
  id: quote.id,
  number: quote.number,
  // ❌ tierId supprimé - isolation automatique par schéma tenant
  clientName: quote.clientName,
  clientAddress: quote.clientAddress,
  clientInfo: quote.clientInfo,
  projectName: quote.projectName,
  projectAddress: quote.projectAddress,
  projectReference: quote.projectReference,
  projectInfo: quote.projectInfo,
  issueDate: quote.issueDate,
  issueDateFormatted: quote.issueDateFormatted,
  expiryDate: quote.expiryDate,
  expiryDateFormatted: quote.expiryDateFormatted,
  validityPeriod: quote.validityPeriod,
  notes: quote.notes,
  termsAndConditions: quote.termsAndConditions,
  status: quote.status,
  statusDisplay: quote.statusDisplay,
  opportunityId: quote.opportunityId,
  margin: quote.margin,
  totalHt: quote.totalHt || 0,
  totalVat: quote.totalVat || 0,
  totalTtc: quote.totalTtc || 0,
  itemsCount: quote.itemsCount,
  vatBreakdown: quote.vatBreakdown,
  items: quote.items?.map(transformQuoteItem) || [],
  itemsStats: quote.itemsStats,
  createdAt: quote.createdAt,
  updatedAt: quote.updatedAt,
  createdBy: quote.createdBy,
  updatedBy: quote.updatedBy,
});

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
      const response = await apiClient.get('/quotes/', { 
        params, 
        signal
      });
      
      return {
        ...response.data,
        results: response.data.results?.map(transformQuote) || []
      };
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
      const response = await apiClient.get(`/quotes/${id}/`, { 
        signal
      });
      
      return transformQuote(response.data);
    } catch (error) {
      // Ne pas logger les erreurs d'annulation
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error(`Erreur lors de la récupération du devis ${id}:`, error);
      }
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
   * Récupère les taux de TVA disponibles depuis le tenant service
   * @deprecated Use tenantVatRatesApi.getVatRates() instead
   */
  getVATRates: async (signal?: AbortSignal): Promise<VATRateInfo[]> => {
    try {
      const response = await apiClient.get('/tenant/vat_rates/', { 
        signal
      });
      
      // Le backend renvoie déjà le bon format
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des taux de TVA:', error);
      // En cas d'erreur, retourner une liste vide - plus de fallback hardcodé
      console.error('Aucun taux de TVA configuré pour ce tenant - configuration requise');
      return [];
    }
  },

  /**
   * Génère un aperçu du prochain numéro de devis
   */
  getNextQuoteNumber: async (signal?: AbortSignal): Promise<string> => {
    try {
      const response = await apiClient.get('/quotes/next-number/', { signal });
      return response.data.number;
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de devis:', error);
      // Fallback : générer un numéro temporaire
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-3);
      return `DEV-${year}-${timestamp}`;
    }
  },

  /**
   * Génère une référence unique pour un projet (tenant-aware)
   */
  getNextProjectReference: async (signal?: AbortSignal): Promise<string> => {
    try {
      const response = await apiClient.get('/projects/next-reference/', { signal });
      return response.data.reference;
    } catch (error) {
      console.error('Erreur lors de la génération de la référence projet:', error);
      // Fallback : générer une référence temporaire tenant-aware
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      return `PROJ-${year}-${timestamp}`;
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
  },

  /**
   * Convertit un devis en facture
   */
  convertToInvoice: async (id: string, data: {
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    notes?: string;
    copyItems: boolean;
  }): Promise<any> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/convert_to_invoice/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la conversion du devis ${id} en facture:`, error);
      throw error;
    }
  },

  /**
   * Valide un devis
   */
  validateQuote: async (id: string, data?: { notes?: string }): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/validate/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la validation du devis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Génère un PDF pour un devis
   */
  generateQuotePdf: async (id: string, data?: { template?: string }): Promise<Blob> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/pdf/`, data || {}, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la génération du PDF du devis ${id}:`, error);
      throw error;
    }
  },

  // PHASE 2 - Gestion avancée des éléments

  /**
   * Récupère les éléments d'un devis via l'API spécialisée
   */
  getQuoteItemsByDocument: async (quoteId: string, signal?: AbortSignal): Promise<QuoteItem[]> => {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}/items/`, { signal });
      return response.data.results || response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des éléments du devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un élément à un devis spécifique
   */
  createQuoteItemByDocument: async (quoteId: string, data: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/items/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'élément au devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour un élément d'un devis spécifique
   */
  updateQuoteItemByDocument: async (quoteId: string, itemId: string, data: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.put(`/quotes/${quoteId}/items/${itemId}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${itemId} du devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un élément d'un devis spécifique
   */
  deleteQuoteItemByDocument: async (quoteId: string, itemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotes/${quoteId}/items/${itemId}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ${itemId} du devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Réorganise les éléments d'un devis
   */
  reorderQuoteItems: async (quoteId: string, itemIds: string[]): Promise<void> => {
    try {
      await apiClient.post(`/quotes/${quoteId}/items/reorder/`, { item_ids: itemIds });
    } catch (error) {
      console.error(`Erreur lors de la réorganisation des éléments du devis ${quoteId}:`, error);
      throw error;
    }
  },

  /**
   * Effectue des opérations en lot sur les éléments d'un devis
   */
  bulkOperationsQuoteItems: async (quoteId: string, operations: {
    action: 'delete' | 'update' | 'move';
    items: Array<{
      id: string;
      data?: Partial<CreateQuoteItemData>;
      target_position?: number;
    }>;
  }): Promise<{ success: number; errors: Array<{ id: string; error: string }> }> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/items/bulk_operations/`, operations);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors des opérations en lot sur les éléments du devis ${quoteId}:`, error);
      throw error;
    }
  }
};

export { quotesApi };
export default quotesApi;
