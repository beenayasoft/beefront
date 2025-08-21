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

// Type de TVA - ✅ Aligné avec VATRateInfo du système tenant-specific
// @deprecated Utiliser VATRateInfo à la place pour les taux dynamiques
export type VATRate = 0 | 7 | 10 | 14 | 20;

// Type de paiement
export type PaymentMethod = 
  | 'bank_transfer' // Virement bancaire
  | 'check'         // Chèque
  | 'cash'          // Espèces
  | 'card'          // Carte bancaire
  | 'other';        // Autre

// Interface pour un élément de facture (ligne)
// ✅ Alignée avec le modèle Django InvoiceItem
export interface InvoiceItem {
  id: string;
  type: 'material' | 'labor' | 'work' | 'chapter' | 'section' | 'discount' | 'advance_payment'; // ✅ Aligné avec backend
  parent?: string | null; // ✅ Renommé de parentId vers parent
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // ✅ Non optionnel comme dans le backend, défaut 0
  vatRate: string; // ✅ Changé vers string pour cohérence (code du taux)
  vatRateDisplay?: string; // ✅ Ajouté pour affichage
  totalHt: number; // ✅ Renommé de totalHT vers totalHt
  totalTtc: number; // ✅ Renommé de totalTTC vers totalTtc
  // Champs pour les ouvrages
  workId?: string;
  // ✅ Ajouts pour cohérence backend
  invoiceNumber?: string;
  invoice?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour un paiement
// ✅ Alignée avec le modèle Django Payment
export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string; // Référence du paiement (numéro de chèque, etc.)
  notes?: string;
  // ✅ Ajouts pour cohérence backend
  invoice?: string; // ID de la facture parente
  createdAt?: string;
}

// Interface pour une facture complète
// ✅ Alignée avec le modèle Django Invoice
export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  statusDisplay?: string; // ✅ Ajouté pour affichage
  // IDs nécessaires pour l'éditeur
  clientId?: string;
  clientName: string;
  clientAddress?: string;
  clientInfo?: any; // ✅ Ajouté pour cohérence
  projectId?: string;
  projectName?: string;
  projectAddress?: string;
  projectReference?: string; // ✅ Ajouté
  projectInfo?: any; // ✅ Ajouté pour cohérence
  issueDate: string;
  issueDateFormatted?: string; // ✅ Ajouté pour affichage
  dueDate?: string; // ✅ Rendu optionnel comme backend
  dueDateFormatted?: string; // ✅ Ajouté pour affichage
  paymentTerms: number; // ✅ Non optionnel, défaut 30
  items?: InvoiceItem[]; // ✅ Rendu optionnel
  notes?: string;
  termsAndConditions?: string;
  
  // ✅ Ajout spécifique aux factures
  isCreditNote?: boolean; // Nouveau champ du backend
  
  // Montants calculés (✅ noms cohérents)
  totalHt: number; // ✅ Renommé de totalHT
  totalVat: number; // ✅ Renommé de totalVAT  
  totalTtc: number; // ✅ Renommé de totalTTC
  paidAmount: number;
  remainingAmount: number;
  
  // ✅ Ajouts pour cohérence backend
  itemsCount?: number;
  vatBreakdown?: any;
  
  // Paiements
  payments?: Payment[]; // ✅ Rendu optionnel
  
  // Liens avec d'autres documents (✅ noms cohérents)
  quoteId?: string; // ID du devis d'origine
  quoteNumber?: string; // Numéro du devis d'origine
  quoteInfo?: any; // ✅ Ajouté pour cohérence
  creditNoteId?: string; // ID de l'avoir (si facture annulée)
  originalInvoiceId?: string; // ID de la facture d'origine (si avoir)
  originalInvoiceInfo?: any; // ✅ Ajouté pour cohérence
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Interface pour les filtres de recherche de factures
// ✅ Alignée avec les filtres backend
export interface InvoiceFilters {
  search?: string; // ✅ Renommé de query vers search
  status?: InvoiceStatus | InvoiceStatus[]; // ✅ Support single et array
  // ❌ clientId et projectId supprimés - filtrage automatique par schéma tenant
  quoteId?: string; // ✅ Ajouté pour filtrer par devis d'origine
  isCreditNote?: boolean; // ✅ Ajouté pour filtrer les avoirs
  issueDate?: string; // ✅ Ajouté pour filtrage par date d'émission
  dueDate?: string; // ✅ Ajouté pour filtrage par date d'échéance
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'issueDate' | 'dueDate' | 'totalTtc' | 'clientName' | 'status' | 'remainingAmount'; // ✅ Ajouts
  sortOrder?: 'asc' | 'desc';
}

// Statistiques des factures
// ✅ Alignée avec les statistiques backend InvoiceStatsSerializer
export interface InvoiceStats {
  totalInvoices: number; // ✅ Renommé de total
  draftInvoices: number; // ✅ Renommé de draft
  sentInvoices: number; // ✅ Renommé de sent
  overdueInvoices: number; // ✅ Renommé de overdue
  partiallyPaidInvoices: number; // ✅ Renommé de partially_paid
  paidInvoices: number; // ✅ Renommé de paid
  cancelledInvoices: number; // ✅ Renommé de cancelled
  creditNoteInvoices: number; // ✅ Renommé de cancelled_by_credit_note
  totalAmountHt: number; // ✅ Ajouté
  totalAmountTtc: number; // ✅ Renommé de totalAmount
  totalPaid: number; // ✅ Renommé de paidAmount
  totalOutstanding: number; // ✅ Renommé de remainingAmount
  overdueAmount: number;
  paymentRate?: number; // ✅ Ajouté - taux de paiement
  averageAmount?: number; // ✅ Ajouté - montant moyen
  averagePaymentDelay: number; // Délai moyen de paiement en jours
}

// Interface pour la création d'une facture
export interface CreateInvoiceData {
  tier: string; // ID du client
  client_name: string;
  client_address?: string;
  project_name?: string;
  project_address?: string;
  project_reference?: string;
  issue_date: string;
  due_date?: string;
  payment_terms: number;
  notes?: string;
  terms_and_conditions?: string;
  items: CreateInvoiceItemData[];
}

// Interface pour la création d'un élément de facture
export interface CreateInvoiceItemData {
  type: 'material' | 'labor' | 'work' | 'chapter' | 'section' | 'discount' | 'advance_payment';
  parent?: string;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  vat_rate: string;
  work_id?: string;
}