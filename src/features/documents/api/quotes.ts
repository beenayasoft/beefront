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
  totalHt: (() => {
    console.log(`🔍 Item "${item.designation}" - totalHt brut du backend:`, item.totalHt, typeof item.totalHt);
    return item.totalHt || 0;
  })(),
  totalTtc: (() => {
    console.log(`🔍 Item "${item.designation}" - totalTtc brut du backend:`, item.totalTtc, typeof item.totalTtc);
    return item.totalTtc || 0;
  })(),
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
const transformQuote = (quote: any): Quote => {
  // Log pour débugger les valeurs reçues du backend
  console.log('🔍 Transform Quote - Données reçues:', {
    id: quote.id,
    number: quote.number,
    clientName: quote.clientName,
    client_name: quote.client_name,
    totalHt: quote.totalHt,
    totalHT: quote.totalHT,
    total_ht: quote.total_ht,
    totalVat: quote.totalVat,
    total_vat: quote.total_vat,
    totalTtc: quote.totalTtc,
    total_ttc: quote.total_ttc,
    items: quote.items?.length,
    itemsCount: quote.itemsCount
  });

  return {
    id: quote.id,
    number: quote.number,
    // ❌ tierId supprimé - isolation automatique par schéma tenant
    clientName: quote.clientName || quote.client_name,
    clientAddress: quote.clientAddress || quote.client_address,
    clientInfo: quote.clientInfo || quote.client_info,
    projectName: quote.projectName || quote.project_name,
    projectAddress: quote.projectAddress || quote.project_address,
    projectReference: quote.projectReference || quote.project_reference,
    projectInfo: quote.projectInfo || quote.project_info,
    issueDate: quote.issueDate || quote.issue_date,
    issueDateFormatted: quote.issueDateFormatted || quote.issue_date_formatted,
    expiryDate: quote.expiryDate || quote.expiry_date,
    expiryDateFormatted: quote.expiryDateFormatted || quote.expiry_date_formatted,
    validityPeriod: quote.validityPeriod || quote.validity_period,
    notes: quote.notes,
    termsAndConditions: quote.termsAndConditions || quote.terms_and_conditions,
    status: quote.status,
    statusDisplay: quote.statusDisplay || quote.status_display,
    opportunityId: quote.opportunityId || quote.opportunity_id,
    margin: quote.margin,
    // Gérer les différentes variantes de nommage pour les totaux
    totalHt: quote.totalHt || quote.totalHT || quote.total_ht || 0,
    totalVat: quote.totalVat || quote.totalVAT || quote.total_vat || 0,
    totalTtc: quote.totalTtc || quote.totalTTC || quote.total_ttc || 0,
    itemsCount: quote.itemsCount || quote.items_count || quote.items?.length || 0,
    vatBreakdown: quote.vatBreakdown || quote.vat_breakdown,
    items: quote.items?.map(transformQuoteItem) || [],
    itemsStats: quote.itemsStats || quote.items_stats,
    createdAt: quote.createdAt || quote.created_at,
    updatedAt: quote.updatedAt || quote.updated_at,
    createdBy: quote.createdBy || quote.created_by,
    updatedBy: quote.updatedBy || quote.updated_by,
  };
};

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
      console.log('📤 API CALL - Création devis avec données:', {
        number: data.number,
        client_name: data.client_name,
        project_name: data.project_name,
        items_count: data.items?.length || 0
      });
      
      const response = await apiClient.post('/quotes/', data);
      
      console.log('📥 API RESPONSE - Devis créé:', {
        id: response.data.id,
        number: response.data.number,
        status: response.data.status
      });
      
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
      const response = await apiClient.get('/quotes/next_number/', { signal });
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
      // Essayons d'abord l'endpoint spécifique aux projets
      const response = await apiClient.get('/projects/next-reference/', { signal });
      return response.data.reference;
    } catch (error) {
      console.warn('Endpoint /projects/next-reference/ non disponible, utilisation du fallback:', error);
      
      try {
        // Fallback : utiliser l'endpoint des devis pour générer une référence
        const quotesResponse = await apiClient.get('/quotes/next_number/', { signal });
        const nextNumber = quotesResponse.data.next_number;
        return `PROJ-${nextNumber}`;
      } catch (fallbackError) {
        console.error('Erreur lors de la génération de la référence projet (fallback):', fallbackError);
        // Fallback final : générer une référence temporaire unique
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PROJ-${year}-${timestamp}-${random}`;
      }
    }
  },

  /**
   * Envoie un devis par email
   */
  sendQuote: async (id: string, emailData: { recipient_email: string; message?: string }): Promise<void> => {
    try {
      console.log('📤 sendQuote - Début de la fonction');
      console.log('📤 sendQuote - ID:', id);
      console.log('📤 sendQuote - Données reçues:', emailData);
      console.log('📤 sendQuote - Type des données:', typeof emailData);
      console.log('📤 sendQuote - Keys des données:', Object.keys(emailData));
      console.log('📤 sendQuote - JSON stringified:', JSON.stringify(emailData));
      
      // Créer un objet propre sans propriétés héritées
      const cleanData = {
        action: 'send',
        recipient_email: emailData.recipient_email,
        message: emailData.message
      };
      
      console.log('📤 sendQuote - Données nettoyées:', cleanData);
      console.log('📤 sendQuote - URL complète:', `/quotes/${id}/send/`);
      
      // Essai avec des headers explicites pour forcer JSON
      await apiClient.post(`/quotes/${id}/send/`, cleanData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('📤 sendQuote - Succès !');
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
      const requestData = {
        action: 'accept',
        ...data
      };
      const response = await apiClient.post(`/quotes/${id}/accept/`, requestData);
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
      const requestData = {
        action: 'reject',
        note: data?.reason || undefined
      };
      const response = await apiClient.post(`/quotes/${id}/reject/`, requestData);
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
      const requestData = {
        action: 'cancel',
        note: data?.reason || undefined
      };
      const response = await apiClient.post(`/quotes/${id}/cancel/`, requestData);
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
   * Exporte un devis au format PDF avec paramètres d'apparence complets
   */
  exportQuoteToPdf: async (id: string, requestData?: any): Promise<Blob> => {
    try {
      console.log(`📤 exportQuoteToPdf - Début pour devis ${id}`);
      
      // Si requestData est fourni, c'est un objet complet avec appearance_settings, tenant_info, etc.
      // Sinon, c'est juste les anciens paramètres d'apparence (rétrocompatibilité)
      let effectiveRequestData = requestData;
      
      if (!effectiveRequestData || (!effectiveRequestData.appearance_settings && !effectiveRequestData.tenant_info)) {
        // Mode rétrocompatibilité : traiter comme des paramètres d'apparence simples
        const legacySettings = requestData;
        
        console.log('🔄 Mode rétrocompatibilité - construction des données complètes...');
        
        // Récupérer les détails du devis
        const quoteDetails = await quotesApi.getQuoteDetails(id);
        
        // Construire l'objet de requête complet
        effectiveRequestData = {
          appearance_settings: legacySettings,
          quote_data: {
            id: quoteDetails.id,
            number: quoteDetails.number,
            clientName: quoteDetails.clientName,
            projectName: quoteDetails.projectName,
            totalHt: quoteDetails.totalHt,
            totalVat: quoteDetails.totalVat,
            totalTtc: quoteDetails.totalTtc,
            items: quoteDetails.items,
            issueDate: quoteDetails.issueDate,
            expiryDate: quoteDetails.expiryDate,
            notes: quoteDetails.notes,
            termsAndConditions: quoteDetails.termsAndConditions
          }
        };
        
        // Essayer de récupérer les infos tenant
        try {
          const { tenantApi } = await import('@/lib/api/tenant');
          effectiveRequestData.tenant_info = await tenantApi.getCurrentTenantInfo();
        } catch (tenantError) {
          console.warn('⚠️ Impossible de récupérer les infos tenant:', tenantError);
        }
      }
      
      console.log('📤 Données complètes à envoyer au backend:', {
        hasAppearanceSettings: !!effectiveRequestData.appearance_settings,
        hasTenantInfo: !!effectiveRequestData.tenant_info,
        hasQuoteData: !!effectiveRequestData.quote_data,
        quoteId: id
      });
      
      let response;
      
      // Essayer d'abord avec les données complètes
      if (effectiveRequestData && (effectiveRequestData.appearance_settings || effectiveRequestData.tenant_info)) {
        try {
          console.log('🎨 Tentative avec données complètes...');
          
          // Préparer les paramètres de requête (GET avec query params)
          const params = new URLSearchParams();
          params.append('pdf_data', JSON.stringify(effectiveRequestData));
          
          response = await apiClient.get(`/quotes/${id}/pdf/`, {
            params: params,
            responseType: 'blob'
          });
          
          console.log('✅ PDF généré avec données complètes');
        } catch (paramError) {
          console.warn('⚠️ Échec avec données complètes, tentative simple:', paramError);
          
          // Fallback : essayer sans paramètres
          response = await apiClient.get(`/quotes/${id}/pdf/`, {
            responseType: 'blob'
          });
          
          console.log('✅ PDF généré simple (fallback)');
        }
      } else {
        // Pas de données spéciales, appel direct
        response = await apiClient.get(`/quotes/${id}/pdf/`, {
          responseType: 'blob'
        });
        
        console.log('✅ PDF généré simple');
      }
      
      // Vérifier la réponse
      if (response.status !== 200) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Vérifier le type de contenu
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      console.log(`📄 PDF Response - Content-Type: ${contentType}, Size: ${response.data.size} bytes`);
      
      if (!contentType?.includes('pdf') && !contentType?.includes('octet-stream')) {
        console.warn(`⚠️ Type de contenu inattendu: ${contentType}`);
      }
      
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
      const response = await apiClient.post(`/quotes/${id}/export/`, {
        format: 'excel',
        include_details: true
      }, {
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
    number?: string; // ✅ Ajout du numéro optionnel
  }): Promise<any> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/convert_to_invoice/`, data);
      return response.data.invoice;
    } catch (error) {
      console.error(`Erreur lors de la conversion du devis ${id} en facture:`, error);
      throw error;
    }
  },


  /**
   * Génère un PDF pour un devis avec paramètres d'apparence
   */
  generateQuotePdf: async (id: string, data?: { template?: string; appearance_settings?: any }): Promise<Blob> => {
    try {
      console.log(`📤 generateQuotePdf - Début pour devis ${id} avec params:`, data);
      
      // Récupérer les détails du devis avant génération
      const quoteDetails = await quotesApi.getQuoteDetails(id);
      console.log(`🔍 Données devis pour PDF génération:`, {
        id: quoteDetails.id,
        number: quoteDetails.number,
        clientName: quoteDetails.clientName,
        totalHt: quoteDetails.totalHt,
        totalTtc: quoteDetails.totalTtc,
        itemsCount: quoteDetails.items?.length
      });
      
      // Récupérer les paramètres d'apparence si pas fournis
      let requestData = data || {};
      if (!requestData.appearance_settings) {
        try {
          const { documentAppearanceAPI } = await import('@/lib/api/documentAppearance');
          requestData.appearance_settings = await documentAppearanceAPI.getAppearanceSettings();
          console.log('🎨 Paramètres d\'apparence récupérés pour generatePDF:', requestData.appearance_settings);
        } catch (settingsError) {
          console.warn('⚠️ Impossible de récupérer les paramètres d\'apparence:', settingsError);
        }
      }
      
      const response = await apiClient.post(`/quotes/${id}/pdf/`, requestData, {
        responseType: 'blob'
      });
      
      console.log(`📄 PDF généré - Taille: ${response.data.size} bytes`);
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
