/**
 * Types pour les tiers (clients, fournisseurs, etc.)
 */
export interface Tier {
  id: string;
  nom: string;
  type: string; // ✅ CORRIGÉ : string au lieu de string[]
  type_display?: string; // ✅ AJOUTÉ : depuis le backend
  relation: string;
  relation_display?: string; // ✅ AJOUTÉ : depuis le backend
  siret?: string;
  tva?: string;
  adresses?: Address[];
  contacts?: Contact[];
  contacts_count?: number; // ✅ AJOUTÉ : depuis le backend
  opportunities_count?: number; // ✅ AJOUTÉ : depuis le backend
  adresse_facturation?: Address; // ✅ AJOUTÉ : depuis le backend
  contact_principal?: string; // ✅ AJOUTÉ : nom du contact principal
  contact_principal_email?: string; // ✅ AJOUTÉ : email du contact principal
  contact_principal_telephone?: string; // ✅ AJOUTÉ : téléphone du contact principal
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Statuts possibles pour une opportunité
export type OpportunityStatus = 
  | 'new'           // Nouvelle
  | 'needs_analysis' // Analyse des besoins
  | 'negotiation'   // Négociation
  | 'won'           // Gagnée
  | 'lost';         // Perdue

// Sources possibles pour une opportunité
export type OpportunitySource =
  | 'website'    // Site web
  | 'referral'   // Recommandation
  | 'cold_call'  // Démarchage téléphonique
  | 'exhibition' // Salon/Exposition
  | 'partner'    // Partenaire
  | 'social_media' // Réseaux sociaux
  | 'other';     // Autre

// Raisons de perte possibles
export type LossReason =
  | 'price'      // Prix trop élevé
  | 'competitor' // Concurrent choisi
  | 'timing'     // Mauvais timing
  | 'no_budget'  // Pas de budget
  | 'no_need'    // Pas de besoin réel
  | 'no_decision' // Pas de décision prise
  | 'other';     // Autre

// Interface pour une opportunité
export interface Opportunity {
  id: string;
  name: string;
  tierId: string;
  tierName: string;
  tierType: string[];
  stage: OpportunityStatus;
  estimatedAmount: number;
  probability: number;
  expectedCloseDate: string;
  source: OpportunitySource;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  lossReason?: LossReason;
  lossDescription?: string;
  // Liens avec d'autres objets
  quoteIds?: string[];
  // ✅ AJOUT : Données détaillées des devis
  quotes?: Array<{
    id: string;
    number: string;
    status: string;
    status_display: string;
    total_ttc: number;
    created_at: string;
    issue_date?: string;
  }>;
  quotes_count?: number;
  projectId?: string;
  // Conversion automatique prospect → client
  tier_converted?: boolean;
  tier_converted_message?: string;
}

export interface Address {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays?: string;
  is_facturation: boolean; // ✅ CORRIGÉ : nom du champ backend
}

export interface Contact {
  id: string;
  prenom: string;
  nom: string;
  nom_complet?: string; // ✅ AJOUTÉ : depuis le backend
  fonction?: string;
  email?: string;
  telephone?: string;
  is_contact_principal_devis: boolean; // ✅ CORRIGÉ : nom du champ backend
  is_contact_principal_facture: boolean; // ✅ CORRIGÉ : nom du champ backend
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

// ✅ AJOUTÉ : Type manquant utilisé dans les imports
export interface CreateTierRequest extends CreateTierData {}

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
  type: string;
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