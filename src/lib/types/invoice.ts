// Types pour le module de facturation

// Statuts possibles pour une facture
export type InvoiceStatus = 
  | 'draft'      // Brouillon
  | 'sent'       // Émise
  | 'overdue'    // En retard
  | 'partially_paid' // Payée partiellement
  | 'paid'       // Payée
  | 'cancelled'  // Annulée
  | 'cancelled_by_credit_note'; // Annulée par avoir

// Type de TVA
export type VATRate = 0 | 7 | 10 | 14 | 20;

// Type de paiement
export type PaymentMethod = 
  | 'bank_transfer' // Virement bancaire
  | 'check'         // Chèque
  | 'cash'          // Espèces
  | 'card'          // Carte bancaire
  | 'other';        // Autre

// Interface pour un élément de facture (ligne)
export interface InvoiceItem {
  id: string;
  type: 'product' | 'service' | 'work' | 'chapter' | 'section' | 'discount' | 'advance_payment';
  parentId?: string; // Pour les éléments hiérarchiques
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // Remise en pourcentage
  vatRate: VATRate;
  totalHT: number;
  totalTTC: number;
  // Champs pour les ouvrages
  workId?: string;
}

// Interface pour un paiement
export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string; // Référence du paiement (numéro de chèque, etc.)
  notes?: string;
}

// Interface pour une facture complète
export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  projectAddress?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms?: number; // Délai de paiement en jours
  items: InvoiceItem[];
  notes?: string;
  termsAndConditions?: string;
  
  // Montants calculés
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  paidAmount: number;
  remainingAmount: number;
  
  // Paiements
  payments: Payment[];
  
  // Liens avec d'autres documents
  quoteId?: string; // ID du devis d'origine
  quoteNumber?: string; // Numéro du devis d'origine
  creditNoteId?: string; // ID de l'avoir (si facture annulée)
  originalInvoiceId?: string; // ID de la facture d'origine (si avoir)
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Interface pour les filtres de recherche de factures
export interface InvoiceFilters {
  query?: string;
  status?: InvoiceStatus[];
  clientId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'issueDate' | 'dueDate' | 'totalTTC' | 'clientName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Statistiques des factures
export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  overdue: number;
  partially_paid: number;
  paid: number;
  cancelled: number;
  cancelled_by_credit_note: number;
  totalAmount: number;
  overdueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  averagePaymentDelay: number; // Délai moyen de paiement en jours
}