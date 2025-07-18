import { apiClient } from './client';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, InvoiceStats } from '@/lib/types/invoice';

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

// API Functions

/**
 * Récupère la liste des factures avec pagination et filtres
 */
export const getInvoices = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: InvoiceStatus;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  ordering?: string;
}): Promise<PaginatedResponse<Invoice>> => {
  const response = await apiClient.get('/invoices/', { params });
  
  // Adapter les données du backend au format frontend
  const adaptedResults = response.data.results.map((invoice: any) => ({
    ...invoice,
    clientId: invoice.client_id || invoice.tier,
    clientName: invoice.client_name,
    clientAddress: invoice.client_address,
    projectId: invoice.project_id,
    projectName: invoice.project_name,
    projectAddress: invoice.project_address,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
    termsAndConditions: invoice.terms_and_conditions,
    totalHT: invoice.total_ht,
    totalVAT: invoice.total_vat,
    totalTTC: invoice.total_ttc,
    paidAmount: invoice.paid_amount,
    remainingAmount: invoice.remaining_amount,
    quoteId: invoice.quote_id,
    quoteNumber: invoice.quote_number,
    creditNoteId: invoice.credit_note_id,
    originalInvoiceId: invoice.original_invoice_id,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    createdBy: invoice.created_by,
    updatedBy: invoice.updated_by
  }));
  
  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    results: adaptedResults
  };
};

/**
 * Récupère les détails d'une facture
 */
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await apiClient.get(`/invoices/${id}/`);
  
  // Adapter les données du backend au format frontend
  const invoice = response.data;
  return {
    ...invoice,
    clientId: invoice.client_id || invoice.tier,
    clientName: invoice.client_name,
    clientAddress: invoice.client_address,
    projectId: invoice.project_id,
    projectName: invoice.project_name,
    projectAddress: invoice.project_address,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
    termsAndConditions: invoice.terms_and_conditions,
    totalHT: invoice.total_ht,
    totalVAT: invoice.total_vat,
    totalTTC: invoice.total_ttc,
    paidAmount: invoice.paid_amount,
    remainingAmount: invoice.remaining_amount,
    quoteId: invoice.quote_id,
    quoteNumber: invoice.quote_number,
    creditNoteId: invoice.credit_note_id,
    originalInvoiceId: invoice.original_invoice_id,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    createdBy: invoice.created_by,
    updatedBy: invoice.updated_by,
    // Adapter les éléments si présents
    items: invoice.items ? invoice.items.map((item: any) => ({
      ...item,
      parentId: item.parent_id,
      unitPrice: item.unit_price,
      vatRate: item.vat_rate,
      totalHT: item.total_ht,
      totalTTC: item.total_ttc,
      workId: item.work_id
    })) : []
  };
};

/**
 * Crée une nouvelle facture directe (US 5.2)
 */
export const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice> => {
  console.log("Appel de createInvoice avec les données:", data);
  
  try {
  const response = await apiClient.post('/invoices/', data);
    
    // S'assurer que la réponse est correctement transformée et que l'ID est présent
    const invoice = response.data;
    
    console.log("Réponse API createInvoice brute:", invoice);
    
    if (!invoice) {
      console.error("Erreur: La réponse de l'API est vide");
      throw new Error("La réponse de l'API est vide");
    }
    
    if (!invoice.id) {
      console.error("Erreur: La réponse de l'API ne contient pas d'ID", invoice);
      
      // Si l'ID n'est pas présent mais que nous avons une réponse, tentons de récupérer la dernière facture créée
      if (invoice.tier) {
        console.log("Tentative de récupération de la dernière facture créée pour le tier:", invoice.tier);
        const invoicesResponse = await apiClient.get('/invoices/', {
          params: {
            tier: invoice.tier,
            ordering: '-created_at',
            page_size: 1
          }
        });
        
        if (invoicesResponse.data.results && invoicesResponse.data.results.length > 0) {
          const latestInvoice = invoicesResponse.data.results[0];
          console.log("Dernière facture récupérée:", latestInvoice);
          
          if (latestInvoice.id) {
            console.log("Utilisation de l'ID de la dernière facture:", latestInvoice.id);
            invoice.id = latestInvoice.id;
          } else {
            throw new Error("Impossible de récupérer un ID valide pour la facture");
          }
        } else {
          throw new Error("Impossible de récupérer la dernière facture créée");
        }
      } else {
        throw new Error("La réponse de l'API ne contient pas d'ID valide");
      }
    }
    
    // Transformer la réponse pour s'assurer qu'elle correspond au format attendu par le frontend
    const transformedInvoice = {
      ...invoice,
      clientId: invoice.client_id || invoice.tier,
      clientName: invoice.client_name,
      clientAddress: invoice.client_address,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      projectAddress: invoice.project_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paymentTerms: invoice.payment_terms,
      termsAndConditions: invoice.terms_and_conditions,
      totalHT: invoice.total_ht || 0,
      totalVAT: invoice.total_vat || 0,
      totalTTC: invoice.total_ttc || 0,
      paidAmount: invoice.paid_amount || 0,
      remainingAmount: invoice.remaining_amount || 0,
      quoteId: invoice.quote_id,
      quoteNumber: invoice.quote_number,
      creditNoteId: invoice.credit_note_id,
      originalInvoiceId: invoice.original_invoice_id,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by,
      updatedBy: invoice.updated_by,
      // Adapter les éléments si présents
      items: invoice.items ? invoice.items.map((item: any) => ({
        ...item,
        parentId: item.parent_id,
        unitPrice: item.unit_price,
        vatRate: item.vat_rate,
        totalHT: item.total_ht,
        totalTTC: item.total_ttc,
        workId: item.work_id
      })) : []
    };
    
    console.log("Invoice transformée:", transformedInvoice);
    console.log("ID de la facture transformée:", transformedInvoice.id);
    
    return transformedInvoice;
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw error;
  }
};

/**
 * Met à jour une facture
 */
export const updateInvoice = async (id: string, data: Partial<CreateInvoiceRequest>): Promise<Invoice> => {
  try {
    console.log(`Mise à jour de la facture ${id} avec les données:`, data);
  const response = await apiClient.put(`/invoices/${id}/`, data);
    
    // Adapter les données du backend au format frontend
    const invoice = response.data;
    return {
      ...invoice,
      clientId: invoice.client_id || invoice.tier,
      clientName: invoice.client_name,
      clientAddress: invoice.client_address,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      projectAddress: invoice.project_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paymentTerms: invoice.payment_terms,
      termsAndConditions: invoice.terms_and_conditions,
      totalHT: invoice.total_ht,
      totalVAT: invoice.total_vat,
      totalTTC: invoice.total_ttc,
      paidAmount: invoice.paid_amount,
      remainingAmount: invoice.remaining_amount,
      quoteId: invoice.quote_id,
      quoteNumber: invoice.quote_number,
      creditNoteId: invoice.credit_note_id,
      originalInvoiceId: invoice.original_invoice_id,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by,
      updatedBy: invoice.updated_by,
      // Adapter les éléments si présents
      items: invoice.items ? invoice.items.map((item: any) => ({
        ...item,
        parentId: item.parent_id,
        unitPrice: item.unit_price,
        vatRate: item.vat_rate,
        totalHT: item.total_ht,
        totalTTC: item.total_ttc,
        workId: item.work_id
      })) : []
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    throw error;
  }
};

/**
 * Supprime une facture (brouillon uniquement)
 */
export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    console.log(`Suppression de la facture ${id}`);
  await apiClient.delete(`/invoices/${id}/`);
    console.log(`Facture ${id} supprimée avec succès`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error);
    throw error;
  }
};

/**
 * Valide et émet une facture (US 5.3)
 */
export const validateInvoice = async (id: string, data?: { issue_date?: string }): Promise<Invoice> => {
  try {
    console.log(`Validation de la facture ${id}`);
  const response = await apiClient.post(`/invoices/${id}/validate/`, data || {});
    
    // Adapter les données du backend au format frontend
    const invoice = response.data;
    return {
      ...invoice,
      clientId: invoice.client_id || invoice.tier,
      clientName: invoice.client_name,
      clientAddress: invoice.client_address,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      projectAddress: invoice.project_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paymentTerms: invoice.payment_terms,
      termsAndConditions: invoice.terms_and_conditions,
      totalHT: invoice.total_ht,
      totalVAT: invoice.total_vat,
      totalTTC: invoice.total_ttc,
      paidAmount: invoice.paid_amount,
      remainingAmount: invoice.remaining_amount,
      quoteId: invoice.quote_id,
      quoteNumber: invoice.quote_number,
      creditNoteId: invoice.credit_note_id,
      originalInvoiceId: invoice.original_invoice_id,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by,
      updatedBy: invoice.updated_by,
      items: invoice.items ? invoice.items.map((item: any) => ({
        ...item,
        parentId: item.parent_id,
        unitPrice: item.unit_price,
        vatRate: item.vat_rate,
        totalHT: item.total_ht,
        totalTTC: item.total_ttc,
        workId: item.work_id
      })) : []
    };
  } catch (error) {
    console.error("Erreur lors de la validation de la facture:", error);
    throw error;
  }
};

/**
 * Enregistre un paiement pour une facture (US 5.4)
 */
export const recordPayment = async (id: string, payment: RecordPaymentRequest): Promise<{
  payment: Payment;
  invoice: Invoice;
}> => {
  const response = await apiClient.post(`/invoices/${id}/record-payment/`, payment);
  return response.data;
};

/**
 * Crée un avoir à partir d'une facture (US 5.5)
 */
export const createCreditNote = async (id: string, data: CreateCreditNoteRequest): Promise<{
  creditNote: Invoice;
  originalInvoice: Invoice;
}> => {
  const response = await apiClient.post(`/invoices/${id}/create-credit-note/`, data);
  
  // Le backend renvoie l'avoir créé, mais nous devons récupérer aussi la facture originale
  const creditNote = response.data;
  const originalInvoice = await getInvoiceById(id);
  
  return {
    creditNote,
    originalInvoice
  };
};

/**
 * Crée une facture depuis un devis (US 5.1)
 */
export const createInvoiceFromQuote = async (data: CreateInvoiceFromQuoteRequest): Promise<Invoice> => {
  const response = await apiClient.post('/invoices/from-quote/', data);
  return response.data;
};

/**
 * Récupère les statistiques des factures
 */
export const getInvoiceStats = async (): Promise<InvoiceStats> => {
  try {
    console.log("🔍 API: Récupération des statistiques des factures...");
    const response = await apiClient.get('/invoices/stats/');
    console.log("📡 API: Réponse brute reçue:", response.data);
    
    const data = response.data;
    
    // Adapter les données du backend au format frontend
    const adaptedStats = {
      total: data.total_invoices || 0,
      draft: data.draft_invoices || 0,
      sent: data.sent_invoices || 0,
      paid: data.paid_invoices || 0,
      overdue: data.overdue_invoices || 0,
      partially_paid: data.partially_paid_invoices || 0,
      cancelled: data.cancelled_invoices || 0,
      cancelled_by_credit_note: data.credit_note_invoices || 0,
      totalAmount: data.total_amount_ttc || 0,
      paidAmount: data.total_paid || 0,
      remainingAmount: data.total_outstanding || 0,
      overdueAmount: data.overdue_amount || 0,
      averagePaymentDelay: data.average_payment_delay || 0
    };
    
    console.log("📊 API: Statistiques adaptées:", adaptedStats);
    return adaptedStats;
  } catch (error) {
    console.error("❌ API: Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
};

/**
 * Récupère le prochain numéro de facture disponible
 */
export const getNextInvoiceNumber = async (): Promise<{ number: string }> => {
  const response = await apiClient.get('/invoices/next-number/');
  return response.data;
};

/**
 * Récupère le prochain numéro d'avoir disponible
 */
export const getNextCreditNumber = async (): Promise<{ number: string }> => {
  const response = await apiClient.get('/invoices/next-credit-number/');
  return response.data;
};

/**
 * Simule l'impact d'un paiement sur une facture
 */
export const getPaymentImpact = async (id: string, amount: number): Promise<{
  newStatus: InvoiceStatus;
  newRemainingAmount: number;
}> => {
  const response = await apiClient.get(`/invoices/${id}/payment-impact/`, {
    params: { amount }
  });
  return response.data;
};

/**
 * Récupère l'aperçu d'un avoir
 */
export const getCreditNotePreview = async (id: string, data: {
  is_full: boolean;
  selected_items?: string[];
}): Promise<{
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  impact: string;
}> => {
  const response = await apiClient.post(`/invoices/${id}/credit-note-preview/`, data);
  return response.data;
};

/**
 * Change l'état d'une facture directement
 */
export const changeInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice> => {
  try {
    console.log(`Changement de statut de la facture ${id} vers ${status}`);
    const response = await apiClient.patch(`/invoices/${id}/`, { status });
    
    // Adapter les données du backend au format frontend
    const invoice = response.data;
    return {
      ...invoice,
      clientId: invoice.client_id || invoice.tier,
      clientName: invoice.client_name,
      clientAddress: invoice.client_address,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      projectAddress: invoice.project_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paymentTerms: invoice.payment_terms,
      termsAndConditions: invoice.terms_and_conditions,
      totalHT: invoice.total_ht,
      totalVAT: invoice.total_vat,
      totalTTC: invoice.total_ttc,
      paidAmount: invoice.paid_amount,
      remainingAmount: invoice.remaining_amount,
      quoteId: invoice.quote_id,
      quoteNumber: invoice.quote_number,
      creditNoteId: invoice.credit_note_id,
      originalInvoiceId: invoice.original_invoice_id,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by,
      updatedBy: invoice.updated_by,
      items: invoice.items ? invoice.items.map((item: any) => ({
        ...item,
        parentId: item.parent_id,
        unitPrice: item.unit_price,
        vatRate: item.vat_rate,
        totalHT: item.total_ht,
        totalTTC: item.total_ttc,
        workId: item.work_id
      })) : []
    };
  } catch (error) {
    console.error(`Erreur lors du changement de statut de la facture vers ${status}:`, error);
    throw error;
  }
};

/**
 * Export d'une facture en PDF
 */
export const exportInvoicePdf = async (id: string): Promise<Blob> => {
  try {
  const response = await apiClient.post(`/invoices/${id}/export/`, {
    format: 'pdf'
    }, {
      responseType: 'blob'
  });
    
  return response.data;
  } catch (error) {
    console.error("Erreur lors de l'export PDF de la facture:", error);
    throw error;
  }
};

/**
 * Récupère les valeurs distinctes pour les filtres
 */
export const getInvoiceFilterValues = async (): Promise<{
  creators: Array<{ id: string; name: string }>;
  paymentMethods: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
}> => {
  const response = await apiClient.get('/invoices/filter-values/');
  return response.data;
};

/**
 * Récupère les contraintes de suppression d'une facture
 */
export const getInvoiceDeletionConstraints = async (id: string): Promise<{
  canDelete: boolean;
  constraints: Array<{
    type: 'status' | 'payments' | 'credit_notes' | 'items';
    message: string;
    blocking: boolean;
  }>;
}> => {
  const response = await apiClient.get(`/invoices/${id}/deletion-constraints/`);
  return response.data;
};

/**
 * Récupère les paiements d'une facture
 */
export const getInvoicePayments = async (invoiceId: string): Promise<Payment[]> => {
  const response = await apiClient.get('/payments/', {
    params: { invoice_id: invoiceId, ordering: '-payment_date' }
  });
  return response.data.results || response.data;
};

/**
 * Récupère les éléments d'une facture
 */
export const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  const response = await apiClient.get('/invoice-items/by_invoice/', {
    params: { invoice_id: invoiceId }
  });
  return response.data;
};

/**
 * Gestion en lot des éléments de facture
 */
export const batchUpdateInvoiceItems = async (operations: Array<{
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<InvoiceItem>;
}>): Promise<{
  success: boolean;
  results: {
    created: InvoiceItem[];
    updated: InvoiceItem[];
    deleted: string[];
  };
}> => {
  const response = await apiClient.post('/invoice-items/batch_operations/', {
    operations
  });
  return response.data;
};

// === ACTIONS EN LOT ===

/**
 * Valide plusieurs factures en lot
 */
export const bulkValidateInvoices = async (invoiceIds: string[]): Promise<BulkActionResult> => {
  const response = await apiClient.post('/invoices/bulk/validate/', { 
    invoice_ids: invoiceIds 
  });
  return response.data;
};

/**
 * Exporte plusieurs factures en lot
 */
export const bulkExportInvoices = async (invoiceIds: string[], format: 'pdf' | 'excel'): Promise<BulkActionResult> => {
  const response = await apiClient.post('/invoices/bulk/export/', { 
    invoice_ids: invoiceIds,
    format 
  });
  return response.data;
};

/**
 * Supprime plusieurs factures en lot
 */
export const bulkDeleteInvoices = async (invoiceIds: string[]): Promise<BulkActionResult> => {
  const response = await apiClient.delete('/invoices/bulk/delete/', { 
    data: { invoice_ids: invoiceIds }
  });
  return response.data;
};

/**
 * Récupère les contraintes pour une action en lot
 */
export const getBulkActionConstraints = async (action: string, invoiceIds: string[]): Promise<BulkActionConstraint[]> => {
  const response = await apiClient.post('/invoices/bulk/constraints/', { 
    action,
    invoice_ids: invoiceIds 
  });
  return response.data;
}; 