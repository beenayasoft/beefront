/**
 * Types pour les tiers (clients, fournisseurs, etc.)
 */

export interface Tier {
  id: string;
  name: string;
  type: string[];
  contact: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  status: 'active' | 'inactive';
}

export interface TierFilters {
  search?: string;
  type?: string[];
  status?: 'active' | 'inactive';
}

export interface TierStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

export interface CreateTierRequest {
  nom: string;
  type: string; // String simple, pas array
  relation: string;
  siret?: string;
  tva?: string;
  adresses?: {
    libelle: string;
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
    is_facturation: boolean;
  }[];
  contacts?: {
    prenom: string;
    nom: string;
    email?: string;
    telephone?: string;
    is_contact_principal_devis: boolean;
    is_contact_principal_facture: boolean;
  }[];
}

export interface UpdateTierRequest extends Partial<CreateTierRequest> {} 