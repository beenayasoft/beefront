import { Tier } from './tiers.types';
import { Opportunity } from './opportunities.types';

export type { Tier, Opportunity };

export interface Address {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays?: string;
  facturation: boolean;
}

export interface Contact {
  id: string;
  prenom: string;
  nom: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  contactPrincipalDevis: boolean;
  contactPrincipalFacture: boolean;
}

export interface TierFilters {
  search?: string;
  relation?: TierRelation;
  type?: string[];
  status?: 'active' | 'inactive';
}

export interface OpportunityFilters {
  search?: string;
  stage?: OpportunityStatus[];
  tier_id?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  probability?: number;
}

export interface PaginatedTiersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tier[];
}

export interface PaginatedOpportunitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Opportunity[];
}

export interface CreateTierData {
  nom: string;
  type: string;
  relation: TierRelation;
  siret?: string;
  tva?: string;
  adresses?: Omit<Address, 'id'>[];
  contacts?: Omit<Contact, 'id'>[];
}

export interface CreateOpportunityData {
  name: string;
  tier: string;
  stage: OpportunityStatus;
  estimated_amount: number;
  probability: number;
  expected_close_date: string;
  source: string;
  description?: string;
  assigned_to?: string;
}

export interface CRMStats {
  tiers: {
    total: number;
    byRelation: Record<TierRelation, number>;
    byType: Record<string, number>;
    activeCount: number;
    inactiveCount: number;
  };
  opportunities: {
    total: number;
    byStage: Record<OpportunityStatus, number>;
    totalAmount: number;
    avgAmount: number;
    conversionRate: number;
  };
}

export interface ClientOption {
  id: string;
  name: string;
  type: string[];
  relation: TierRelation;
  adressePrincipale?: Address;
  contactPrincipalDevis?: Contact;
}

export interface OpportunityOption {
  id: string;
  name: string;
  stage: OpportunityStatus;
  estimatedAmount: number;
  probability: number;
  tierId: string;
  tierName: string;
}

export enum TierRelation {
  CLIENT = 'client',
  PROSPECT = 'prospect',
  FOURNISSEUR = 'fournisseur',
  SOUS_TRAITANT = 'sous_traitant'
}

export enum OpportunityStatus {
  NEW = 'new',
  NEEDS_ANALYSIS = 'needs_analysis',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost'
}