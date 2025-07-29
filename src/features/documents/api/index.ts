/**
 * API exports for Documents feature
 */
export { quotesApi } from './quotes';
export { invoicesApi } from './invoices';

// Re-export des fonctions individuelles pour compatibilité
export { 
  createCreditNote,
  getCreditNotePreview,
  recordPayment,
  getPaymentImpact,
  createInvoice,
  createInvoiceFromQuote,
  getInvoiceById,
  updateInvoice,
  validateInvoice,
  deleteInvoice,
  sendInvoice,
  exportInvoicePdf
} from './invoices';