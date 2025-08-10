import { Work, Material, Labor, WorkCategory, WorkComponent } from '../types/workLibrary';

// Types pour la pagination Django REST Framework
export interface DjangoPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Type pour les paramètres de pagination
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// Type pour les réponses avec pagination optionnelle
export type ApiResponse<T> = T[] | DjangoPaginatedResponse<T>;

// Types pour les réponses du backend Django
export interface BackendCategory {
  id: number;
  nom: string;
  parent?: number;
  position: number;
  description?: string;
  chemin_complet: string;
  sous_categories?: BackendCategory[];
  created_at: string;
  updated_at: string;
}

export interface BackendMaterial {
  id: number;
  nom: string;
  unite: string;
  prix_achat_ht: string; // Decimal as string from Django
  categorie: number;
  reference: string;
  supplier_id?: string; // New CRM integration field (UUID)
  supplier_details?: any; // CRM supplier data from backend
  effective_supplier_name?: string; // Computed field from backend
  vat_rate: string; // Decimal as string from Django
  type: string;
  code?: string; // New field
  waste_factor: string; // Decimal as string from Django
  is_recyclable: boolean;
  categorie_nom?: string; // Computed field
  unitPrice?: string; // Alias field
  vatRate?: string; // Alias field
  wasteFactor?: string; // Alias field
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface BackendLabor {
  id: number;
  nom: string;
  cout_horaire: string; // Decimal as string from Django
  categorie: number;
  unite: string;
  skill_level: 'apprentice' | 'skilled' | 'expert' | 'specialist';
  productivity_factor: string; // Decimal as string from Django
  type: string;
  categorie_nom?: string; // Computed field
  unitPrice?: string; // Alias field (= cout_horaire)
  prix_achat_ht?: string; // Alias field (= cout_horaire)
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface BackendIngredient {
  id: number;
  ouvrage: number;
  element_type: number;
  element_id: number;
  element: any; // Generic foreign key content
  quantite: string; // Decimal as string from Django
  waste_allowance: string; // Decimal as string from Django
  cout_total: number; // Computed property
}

export interface BackendWork {
  id: number;
  nom: string;
  unite: string;
  categorie: number;
  prix_recommande: string; // Decimal as string from Django
  marge: string; // Decimal as string from Django
  complexity: 'low' | 'medium' | 'high';
  efficiency: string; // Decimal as string from Django
  duration_estimate?: string; // Decimal as string from Django
  requires_certification: boolean;
  categorie_nom?: string; // Computed field
  debourse_sec: number; // Computed property
  recommendedPrice: number; // Computed property with applied margin
  laborCost: number; // Computed property
  materialCost: number; // Computed property
  ingredients?: BackendIngredient[]; // Related ingredients
  created_at: string;
  updated_at: string;
  description?: string;
  type?: string;
  is_custom?: boolean;
}

// Fonction utilitaire pour extraire les résultats d'une réponse paginée ou non
export const extractResults = <T>(response: ApiResponse<T>): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response.results || [];
};

// Fonction utilitaire pour vérifier si une réponse est paginée
export const isPaginatedResponse = <T>(response: ApiResponse<T>): response is DjangoPaginatedResponse<T> => {
  return !Array.isArray(response) && 'results' in response;
};