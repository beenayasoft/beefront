/**
 * Documents Hooks - Custom hooks pour la feature Documents
 * Gestion des devis, factures et logique métier documents
 */

// Hooks pour le wizard de création de devis
export { useQuoteWizard } from './useQuoteWizard';
export { useClientSearch } from './useClientSearch';
export { useOpportunityFlow } from './useOpportunityFlow';

// Hooks pour les taux de TVA intelligents
export { useSmartVatRates } from './useSmartVatRates';
// ✅ Phase 2 : Hook dynamique pour taux de TVA tenant-specific
export { useVatRates } from './useVatRates';

// ✅ Phase 2 : Hook dynamique pour conditions de paiement tenant-specific
export { usePaymentTerms } from './usePaymentTerms';

// Types
export type { UseQuoteWizard } from './useQuoteWizard';
export type { UseClientSearch } from './useClientSearch';
export type { UseOpportunityFlow } from './useOpportunityFlow';

// TODO: Ajouter les hooks Documents génériques
// export { useQuotes } from './useQuotes';
// export { useInvoices } from './useInvoices';
// export { useDocumentStats } from './useDocumentStats';
// export { useDocumentCalculations } from './useDocumentCalculations';