import { Tier } from "./tiers.types";

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

// Interface pour les filtres de recherche d'opportunités
export interface OpportunityFilters {
  query?: string;
  stage?: OpportunityStatus[];
  tierId?: string;  // Format frontend (legacy)
  tier?: string;    // Format backend API Django
  minAmount?: number;
  maxAmount?: number;
  probability?: number;
  source?: OpportunitySource[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'estimatedAmount' | 'probability' | 'expectedCloseDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Statistiques des opportunités
export interface OpportunityStats {
  total: number;
  byStage: Record<OpportunityStatus, number>;
  totalAmount: number;
  inProgressCount: number;  // Nouveau champ
  conversionRate: number; // Taux de conversion (gagnées / total)
}