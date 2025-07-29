/**
 * Service API pour les factures
 * Fournit toutes les méthodes pour interagir avec l'API des factures
 */
import { apiClient, buildQueryParams, handleApiError } from '@/lib/api/client';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, InvoiceStats } from '../types/invoices.types';

// Types pour les réponses API
export interface CreateInvoiceRequest {
  tier: string;
  client_name?: string;
  client_address?: string;
  project_name?: string;
  project_address?: string;
  project_reference?: string;
  issue_date: string;
  due_date?: string;
  payment_terms?: number;
  items?: Omit<InvoiceItem, 'id'>[];
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
  totalHt: item.totalHt || 0,
  totalTtc: item.totalTtc || 0,
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
const transformInvoice = (invoice: any): Invoice => ({
  id: invoice.id,
  number: invoice.number,
  status: invoice.status,
  statusDisplay: invoice.statusDisplay,
  // ❌ clientId et projectId supprimés - isolation automatique par schéma tenant
  clientName: invoice.clientName,
  clientAddress: invoice.clientAddress,
  clientInfo: invoice.clientInfo,
  projectName: invoice.projectName,
  projectAddress: invoice.projectAddress,
  projectReference: invoice.projectReference,
  projectInfo: invoice.projectInfo,
  issueDate: invoice.issueDate,
  issueDateFormatted: invoice.issueDateFormatted,
  dueDate: invoice.dueDate,
  dueDateFormatted: invoice.dueDateFormatted,
  paymentTerms: invoice.paymentTerms || 30,
  items: invoice.items?.map(transformInvoiceItem),
  notes: invoice.notes,
  termsAndConditions: invoice.termsAndConditions,
  isCreditNote: invoice.isCreditNote,
  totalHt: invoice.totalHt || 0,
  totalVat: invoice.totalVat || 0,
  totalTtc: invoice.totalTtc || 0,
  paidAmount: invoice.paidAmount || 0,
  remainingAmount: invoice.remainingAmount || 0,
  itemsCount: invoice.itemsCount,
  vatBreakdown: invoice.vatBreakdown,
  payments: invoice.payments?.map(transformPayment),
  quoteId: invoice.quoteId,
  quoteNumber: invoice.quoteNumber,
  quoteInfo: invoice.quoteInfo,
  creditNoteId: invoice.creditNoteId,
  originalInvoiceId: invoice.originalInvoiceId,
  originalInvoiceInfo: invoice.originalInvoiceInfo,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
  createdBy: invoice.createdBy,
  updatedBy: invoice.updatedBy,
});

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
      const response = await apiClient.post(`/api/invoices/${id}/validate/`, data || {});
      return response.data;
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
      await apiClient.post(`/api/invoices/${id}/send/`, emailData);
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
      const response = await apiClient.post(`/api/invoices/${id}/pdf/`, data || {}, {
        responseType: 'blob'
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
   * Simule l'impact d'un paiement sur une facture
   */
  getPaymentImpact: async (id: string, amount: number): Promise<{
    newStatus: string;
    newRemainingAmount: number;
  }> => {
    try {
      const response = await apiClient.get(`/api/invoices/${id}/payment-impact/`, {
        params: { amount }
      });
      return response.data;
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
      const response = await apiClient.post(`/api/invoices/${id}/credit-note-preview/`, data);
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