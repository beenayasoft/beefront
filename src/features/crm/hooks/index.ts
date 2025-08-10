/**
 * CRM Hooks - Custom hooks pour la feature CRM
 * Gestion des tiers, opportunités et logique métier CRM
 */

// Hooks CRM optimisés avec cache hybride
export * from './useTiers';
export * from './useOpportunities';
export * from './useClientSearchForOpportunities';

// Re-export des hooks spécialisés des sous-composants
export { useEntrepriseForm, useParticulierForm } from '../components/tiers/hooks';