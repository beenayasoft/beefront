/**
 * Service API pour les factures
 * Fournit toutes les méthodes pour interagir avec l'API des factures
 */
import { apiClient, buildQueryParams, handleApiError } from '@/lib/api/client';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, InvoiceStats } from '../types/invoices.types';

// Types pour les réponses API
export interface CreateInvoiceRequest {
  number?: string; // ✅ Numéro de facture à utiliser (optionnel)
  tier: string;
  client_name?: string;
  client_address?: string;
  project_name?: string;
  project_address?: string;
  project_reference?: string;
  quote_id?: string; // Référence vers le devis d'origine
  quote_number?: string; // Numéro du devis d'origine
  issue_date: string;
  due_date?: string;
  payment_terms?: number;
  items?: {
    type: string;
    parent?: string | null;
    position: number;
    reference?: string;
    designation: string;
    description?: string;
    unit?: string;
    quantity: number;
    unit_price: number; // ✅ snake_case
    discount: number;
    vat_rate: string; // ✅ snake_case
    work_id?: string; // ✅ snake_case
  }[];
  notes?: string;
  terms_and_conditions?: string;
}

export interface CreateInvoiceFromQuoteRequest {
  quote_id: string;
  invoice_type: 'acompte' | 'total';
  acompte_percentage?: number;
  client_name?: string;
  client_address?: string;
  project_name?: string;
  project_address?: string;
  project_reference?: string;
  payment_terms?: number;
  notes?: string;
  terms_and_conditions?: string;
}

export interface RecordPaymentRequest {
  date: string;
  amount: number;
  method: 'bank_transfer' | 'check' | 'cash' | 'card' | 'other';
  reference?: string;
  notes?: string;
}

export interface CreateCreditNoteRequest {
  reason: string;
  is_full_credit_note: boolean;
  selected_items?: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  ordering?: string;
}

/**
 * Interface pour les résultats d'actions en lot
 */
export interface BulkActionResult {
  successful: string[];
  failed: Array<{
    invoiceId: string;
    invoiceNumber: string;
    error: string;
  }>;
}

/**
 * Interface pour les contraintes d'actions en lot
 */
export interface BulkActionConstraint {
  invoiceId: string;
  invoiceNumber: string;
  constraint: string;
  severity: 'error' | 'warning';
}

/**
 * Transforme les données d'un élément de facture du format backend vers frontend
 */
const transformInvoiceItem = (item: any): InvoiceItem => ({
  id: item.id,
  type: item.type,
  parent: item.parent,
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
  totalHT: item.totalHt || 0,
  totalTTC: item.totalTtc || 0,
  workId: item.workId,
  invoiceNumber: item.invoiceNumber,
  invoice: item.invoice,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Transforme les données d'un paiement du format backend vers frontend
 */
const transformPayment = (payment: any): Payment => ({
  id: payment.id,
  date: payment.date,
  amount: payment.amount,
  method: payment.method,
  reference: payment.reference,
  notes: payment.notes,
  invoice: payment.invoice,
  createdAt: payment.createdAt,
});

/**
 * Transforme les données d'une facture du format backend vers frontend
 */
const transformInvoice = (invoice: any): Invoice => {
  // Log pour débugger les valeurs reçues du backend
  console.log('🔍 Transform Invoice - Données reçues:', {
    id: invoice.id,
    number: invoice.number,
    totalHt: invoice.totalHt,
    totalHT: invoice.totalHT,
    total_ht: invoice.total_ht,
    totalVat: invoice.totalVat,
    totalVAT: invoice.totalVAT,
    total_vat: invoice.total_vat,
    totalTtc: invoice.totalTtc,
    totalTTC: invoice.totalTTC,
    total_ttc: invoice.total_ttc,
    clientName: invoice.clientName,
    client_name: invoice.client_name,
    items: invoice.items?.length
  });

  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    statusDisplay: invoice.statusDisplay,
    // Ajouter les IDs nécessaires pour l'éditeur
    clientId: invoice.tier || invoice.clientId || invoice.client_id,
    clientName: invoice.clientName || invoice.client_name,
    clientAddress: invoice.clientAddress || invoice.client_address,
    clientInfo: invoice.clientInfo || invoice.client_info,
    projectId: invoice.projectId || invoice.project_id,
    projectName: invoice.projectName || invoice.project_name,
    projectAddress: invoice.projectAddress || invoice.project_address,
    projectReference: invoice.projectReference || invoice.project_reference,
    projectInfo: invoice.projectInfo || invoice.project_info,
    issueDate: invoice.issueDate || invoice.issue_date,
    issueDateFormatted: invoice.issueDateFormatted || invoice.issue_date_formatted,
    dueDate: invoice.dueDate || invoice.due_date,
    dueDateFormatted: invoice.dueDateFormatted || invoice.due_date_formatted,
    paymentTerms: invoice.paymentTerms || invoice.payment_terms || 30,
    items: invoice.items?.map(transformInvoiceItem),
    notes: invoice.notes,
    termsAndConditions: invoice.termsAndConditions || invoice.terms_and_conditions,
    isCreditNote: invoice.isCreditNote || invoice.is_credit_note,
    // Gérer les différentes variantes de nommage pour les totaux
    totalHT: invoice.totalHT || invoice.totalHt || invoice.total_ht || 0,
    totalVAT: invoice.totalVAT || invoice.totalVat || invoice.total_vat || 0,
    totalTTC: invoice.totalTTC || invoice.totalTtc || invoice.total_ttc || 0,
    paidAmount: invoice.paidAmount || invoice.paid_amount || 0,
    remainingAmount: invoice.remainingAmount || invoice.remaining_amount || 0,
    itemsCount: invoice.itemsCount || invoice.items_count || invoice.items?.length || 0,
    vatBreakdown: invoice.vatBreakdown || invoice.vat_breakdown,
    payments: invoice.payments?.map(transformPayment),
    quoteId: invoice.quoteId || invoice.quote_id,
    quoteNumber: invoice.quoteNumber || invoice.quote_number,
    quoteInfo: invoice.quoteInfo || invoice.quote_info,
    creditNoteId: invoice.creditNoteId || invoice.credit_note_id,
    originalInvoiceId: invoice.originalInvoiceId || invoice.original_invoice_id,
    originalInvoiceInfo: invoice.originalInvoiceInfo || invoice.original_invoice_info,
    createdAt: invoice.createdAt || invoice.created_at,
    updatedAt: invoice.updatedAt || invoice.updated_at,
    createdBy: invoice.createdBy || invoice.created_by,
    updatedBy: invoice.updatedBy || invoice.updated_by,
  };
};

/**
 * Service API pour les factures
 */
const invoicesApi = {
  /**
   * Récupère une liste paginée de factures avec filtres optionnels
   */
  getInvoices: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: InvoiceFilters,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Invoice>> => {
    try {
      const params = buildQueryParams(page, pageSize, filters);
      const response = await apiClient.get('/invoices/', { 
        params, 
        signal
      });
      
      return {
        ...response.data,
        results: response.data.results?.map(transformInvoice) || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une facture par son ID
   */
  getInvoiceById: async (id: string, signal?: AbortSignal): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/`, { 
        signal
      });
      return transformInvoice(response.data);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les éléments d'une facture
   */
  getInvoiceItems: async (invoiceId: string, signal?: AbortSignal): Promise<InvoiceItem[]> => {
    try {
      const response = await apiClient.get(`/invoice-items/`, {
        params: { invoice_id: invoiceId },
        signal
      });
      return response.data.results?.map(transformInvoiceItem) || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des éléments de la facture ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle facture
   */
  createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    try {
      const response = await apiClient.post('/invoices/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      throw error;
    }
  },

  /**
   * Met à jour une facture existante
   */
  updateInvoice: async (id: string, data: Partial<CreateInvoiceRequest>): Promise<Invoice> => {
    try {
      const response = await apiClient.put(`/api/invoices/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une facture
   */
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/invoices/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel élément de facture
   */
  createInvoiceItem: async (data: any): Promise<InvoiceItem> => {
    try {
      const response = await apiClient.post('/invoice-items/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément de facture:', error);
      throw error;
    }
  },

  /**
   * Met à jour un élément de facture existant
   */
  updateInvoiceItem: async (id: string, data: any): Promise<InvoiceItem> => {
    try {
      const response = await apiClient.put(`/api/invoice-items/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément de facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un élément de facture
   */
  deleteInvoiceItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/invoice-items/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément de facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les statuts de factures disponibles
   */
  getInvoiceStatuses: async (signal?: AbortSignal): Promise<any[]> => {
    try {
      const response = await apiClient.get('/invoice-statuses/', { signal });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts de factures:', error);
      throw error;
    }
  },

  /**
   * Récupère les moyens de paiement disponibles
   */
  getPaymentMethods: async (signal?: AbortSignal): Promise<any[]> => {
    try {
      const response = await apiClient.get('/payment-methods/', { signal });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des moyens de paiement:', error);
      throw error;
    }
  },

  /**
   * Valide et envoie une facture
   */
  validateInvoice: async (id: string, data?: { issue_date?: string }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/validate/`, data || {});
      return transformInvoice(response.data);
    } catch (error) {
      console.error(`Erreur lors de la validation de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Enregistre un paiement pour une facture
   */
  recordPayment: async (id: string, payment: RecordPaymentRequest): Promise<{
    payment: Payment;
    invoice: Invoice;
  }> => {
    try {
      const response = await apiClient.post(`/api/invoices/${id}/record_payment/`, payment);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement du paiement pour la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un avoir à partir d'une facture
   */
  createCreditNote: async (id: string, data: CreateCreditNoteRequest): Promise<{
    creditNote: Invoice;
    originalInvoice: Invoice;
  }> => {
    try {
      const response = await apiClient.post(`/api/invoices/${id}/create_credit_note/`, data);
      
      // Le backend renvoie l'avoir créé, mais nous devons récupérer aussi la facture originale
      const creditNote = response.data;
      const originalInvoice = await invoicesApi.getInvoiceById(id);
      
      return {
        creditNote,
        originalInvoice
      };
    } catch (error) {
      console.error(`Erreur lors de la création de l'avoir pour la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une facture depuis un devis
   */
  createInvoiceFromQuote: async (data: CreateInvoiceFromQuoteRequest): Promise<Invoice> => {
    try {
      const response = await apiClient.post('/invoices/from-quote/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de facture depuis devis:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des factures
   */
  getInvoiceStats: async (signal?: AbortSignal): Promise<InvoiceStats> => {
    try {
      const response = await apiClient.get('/invoices/stats/', {
        signal
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des factures:', error);
      throw error;
    }
  },

  /**
   * Envoie une facture par email
   */
  sendInvoice: async (id: string, emailData: { recipient_email: string; message?: string }): Promise<void> => {
    try {
      console.log('📤 sendInvoice - Début de la fonction');
      console.log('📤 sendInvoice - ID:', id);
      console.log('📤 sendInvoice - Données reçues:', emailData);
      
      // Créer un objet propre sans propriétés héritées (comme pour les devis)
      const cleanData = {
        action: 'send',
        recipient_email: emailData.recipient_email,
        message: emailData.message
      };
      
      console.log('📤 sendInvoice - Données nettoyées:', cleanData);
      console.log('📤 sendInvoice - URL complète:', `/invoices/${id}/send/`);
      
      // Essai avec des headers explicites pour forcer JSON
      await apiClient.post(`/invoices/${id}/send/`, cleanData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('📤 sendInvoice - Succès !');
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Duplique une facture
   */
  duplicateInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/api/invoices/${id}/duplicate/`, {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la duplication de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exporte une facture au format PDF
   */
  exportInvoiceToPdf: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/api/invoices/${id}/export/pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export de la facture ${id} en PDF:`, error);
      throw error;
    }
  },

  /**
   * Exporte une facture au format Excel
   */
  exportInvoiceToExcel: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/api/invoices/${id}/export/excel/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export de la facture ${id} en Excel:`, error);
      throw error;
    }
  },

  /**
   * Génère un PDF pour une facture
   */
  generateInvoicePdf: async (id: string, data?: { template?: string }): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf/`, {
        responseType: 'blob',
        params: data || {}
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la génération du PDF de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Change l'état d'une facture directement
   */
  changeInvoiceStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    try {
      const response = await apiClient.patch(`/api/invoices/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de statut de la facture vers ${status}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les paiements d'une facture
   */
  getInvoicePayments: async (invoiceId: string): Promise<Payment[]> => {
    try {
      const response = await apiClient.get('/payments/', {
        params: { invoice_id: invoiceId, ordering: '-date' }
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des paiements de la facture ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Simule l'impact d'un paiement sur une facture (calcul local)
   */
  getPaymentImpact: async (id: string, amount: number): Promise<{
    newStatus: string;
    newRemainingAmount: number;
  }> => {
    try {
      // Récupérer les détails de la facture pour faire le calcul
      const invoice = await invoicesApi.getInvoiceById(id);
      
      const currentPaidAmount = invoice.paidAmount || 0;
      const totalAmount = invoice.totalTTC || 0;
      
      const newPaidAmount = currentPaidAmount + amount;
      const newRemainingAmount = Math.max(0, totalAmount - newPaidAmount);
      
      // Déterminer le nouveau statut
      let newStatus: string;
      if (newRemainingAmount <= 0) {
        newStatus = 'paid'; // Payée
      } else if (newPaidAmount > 0) {
        newStatus = 'partially_paid'; // Partiellement payée
      } else {
        newStatus = invoice.status; // Garder le statut actuel
      }
      
      return {
        newStatus,
        newRemainingAmount
      };
    } catch (error) {
      console.error(`Erreur lors du calcul de l'impact du paiement pour la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère l'aperçu d'un avoir
   */
  getCreditNotePreview: async (id: string, data: {
    is_full: boolean;
    selected_items?: string[];
  }): Promise<{
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
    impact: string;
  }> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/credit_note_preview/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'aperçu de l'avoir pour la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le prochain numéro de facture disponible
   */
  getNextInvoiceNumber: async (): Promise<{ number: string }> => {
    try {
      const response = await apiClient.get('/invoices/next-number/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du prochain numéro de facture:', error);
      throw error;
    }
  },

  /**
   * Récupère le prochain numéro d'avoir disponible
   */
  getNextCreditNumber: async (): Promise<{ number: string }> => {
    try {
      const response = await apiClient.get('/invoices/next-credit-number/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du prochain numéro d\'avoir:', error);
      throw error;
    }
  },

  /**
   * Récupère les contraintes de suppression d'une facture
   */
  getInvoiceDeletionConstraints: async (id: string): Promise<{
    canDelete: boolean;
    constraints: Array<{
      type: 'status' | 'payments' | 'credit_notes' | 'items';
      message: string;
      blocking: boolean;
    }>;
  }> => {
    try {
      const response = await apiClient.get(`/api/invoices/${id}/deletion-constraints/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des contraintes de suppression pour la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les valeurs distinctes pour les filtres
   */
  getInvoiceFilterValues: async (): Promise<{
    creators: Array<{ id: string; name: string }>;
    paymentMethods: Array<{ id: string; name: string }>;
    projects: Array<{ id: string; name: string }>;
  }> => {
    try {
      const response = await apiClient.get('/invoices/filter-values/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des valeurs de filtres:', error);
      throw error;
    }
  },

  /**
   * Récupère les contraintes pour une action en lot
   */
  getBulkActionConstraints: async (action: string, invoiceIds: string[]): Promise<BulkActionConstraint[]> => {
    try {
      const response = await apiClient.post('/invoices/bulk/constraints/', { 
        action,
        invoice_ids: invoiceIds 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des contraintes d\'action en lot:', error);
      throw error;
    }
  },

  /**
   * Valide plusieurs factures en lot
   */
  bulkValidateInvoices: async (invoiceIds: string[]): Promise<BulkActionResult> => {
    try {
      const response = await apiClient.post('/invoices/bulk/validate/', { 
        invoice_ids: invoiceIds 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation en lot des factures:', error);
      throw error;
    }
  },

  /**
   * Exporte plusieurs factures en lot
   */
  bulkExportInvoices: async (invoiceIds: string[], format: 'pdf' | 'excel'): Promise<BulkActionResult> => {
    try {
      const response = await apiClient.post('/invoices/bulk/export/', { 
        invoice_ids: invoiceIds,
        format 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'export en lot des factures:', error);
      throw error;
    }
  },

  /**
   * Supprime plusieurs factures en lot
   */
  bulkDeleteInvoices: async (invoiceIds: string[]): Promise<BulkActionResult> => {
    try {
      const response = await apiClient.delete('/invoices/bulk/delete/', { 
        data: { invoice_ids: invoiceIds }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression en lot des factures:', error);
      throw error;
    }
  },

  /**
   * Effectue des opérations en lot sur les factures
   */
  bulkOperations: async (operations: {
    action: 'delete' | 'validate' | 'send';
    invoice_ids: string[];
  }): Promise<{ success: number; errors: Array<{ id: string; error: string }> }> => {
    try {
      const response = await apiClient.post(`/api/invoices/bulk_operations/`, operations);
      return response.data;
    } catch (error) {
      console.error('Erreur lors des opérations en lot sur les factures:', error);
      throw error;
    }
  }
};

// Maintenir la compatibilité avec l'ancienne API
export const getInvoices = invoicesApi.getInvoices;
export const getInvoiceById = invoicesApi.getInvoiceById;
export const createInvoice = invoicesApi.createInvoice;
export const updateInvoice = invoicesApi.updateInvoice;
export const deleteInvoice = invoicesApi.deleteInvoice;
export const validateInvoice = invoicesApi.validateInvoice;
export const recordPayment = invoicesApi.recordPayment;
export const createCreditNote = invoicesApi.createCreditNote;
export const createInvoiceFromQuote = invoicesApi.createInvoiceFromQuote;
export const getInvoiceStats = invoicesApi.getInvoiceStats;
export const sendInvoice = invoicesApi.sendInvoice;
export const generateInvoicePdf = invoicesApi.generateInvoicePdf;
export const changeInvoiceStatus = invoicesApi.changeInvoiceStatus;
export const getInvoicePayments = invoicesApi.getInvoicePayments;
export const getInvoiceItems = invoicesApi.getInvoiceItems;
export const getPaymentImpact = invoicesApi.getPaymentImpact;
export const getCreditNotePreview = invoicesApi.getCreditNotePreview;
export const getNextInvoiceNumber = invoicesApi.getNextInvoiceNumber;
export const getNextCreditNumber = invoicesApi.getNextCreditNumber;
export const getInvoiceDeletionConstraints = invoicesApi.getInvoiceDeletionConstraints;
export const getInvoiceFilterValues = invoicesApi.getInvoiceFilterValues;
export const getBulkActionConstraints = invoicesApi.getBulkActionConstraints;
export const bulkValidateInvoices = invoicesApi.bulkValidateInvoices;
export const bulkExportInvoices = invoicesApi.bulkExportInvoices;
export const bulkDeleteInvoices = invoicesApi.bulkDeleteInvoices;
export const exportInvoicePdf = invoicesApi.exportInvoiceToPdf;
export const exportInvoiceToExcel = invoicesApi.exportInvoiceToExcel;

// Export du service principal
export { invoicesApi };
export default invoicesApi;