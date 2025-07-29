/**
 * CRM Hooks - Custom hooks pour la feature CRM
 * Gestion des tiers, opportunités et logique métier CRM
 */

// TODO: Ajouter les hooks CRM génériques
// export { useTiers } from './useTiers';
// export { useOpportunities } from './useOpportunities';
// export { useCrmStats } from './useCrmStats';

// Re-export des hooks spécialisés des sous-composants
export { useEntrepriseForm, useParticulierForm } from '../components/tiers/hooks';