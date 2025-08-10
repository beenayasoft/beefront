/**
 * Contrats de données TypeScript pour l'intégration Library ↔ CRM
 * Basés sur l'implémentation backend Django REST Framework
 * 
 * Ces types garantissent la cohérence entre frontend et backend
 * pour la gestion des fournisseurs cross-service
 */

// ============================================================================
// SUPPLIER DATA CONTRACTS (CRM Service)
// ============================================================================

/**
 * Fournisseur tel que retourné par le service CRM
 * Correspond au modèle Tiers avec relation='fournisseur'
 */
export interface CRMSupplierDetails {
  id: string;                    // UUID du fournisseur dans CRM
  nom: string;                   // Nom/raison sociale
  siret?: string | null;         // Numéro SIRET
  numero_tva?: string | null;    // Numéro TVA intracommunautaire
  email?: string | null;         // Email principal
  telephone?: string | null;     // Téléphone principal
  relation: 'fournisseur';       // Type de relation (toujours 'fournisseur')
  is_deleted: boolean;           // Statut de suppression
  created_at: string;            // Date de création ISO
  updated_at: string;            // Date de mise à jour ISO
  
  // Champs optionnels supplémentaires du CRM
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  site_web?: string | null;
  notes?: string | null;
}

/**
 * Format simplifié pour les recherches et sélections
 * Correspond au retour de SupplierIntegrationService.search_suppliers()
 */
export interface CRMSupplierSummary {
  id: string;                    // UUID du fournisseur
  nom: string;                   // Nom pour affichage
  siret?: string | null;         // SIRET pour identification
  numero_tva?: string | null;    // TVA pour validation
  email?: string | null;         // Contact rapide
  telephone?: string | null;     // Contact rapide
  relation: 'fournisseur';       // Toujours 'fournisseur'
}

/**
 * Réponse de recherche de fournisseurs
 * Correspond au retour de /api/library/fournitures/suppliers_search/
 */
export interface SupplierSearchResponse {
  results: CRMSupplierSummary[];
  total?: number;                // Nombre total de résultats (optionnel)
}

/**
 * Statistiques des fournisseurs cross-service
 * Correspond au retour de /api/library/fournitures/suppliers_stats/
 */
export interface SupplierStatsResponse {
  total_suppliers: number;       // Nombre total de fournisseurs
  active_suppliers: number;      // Fournisseurs actifs
  materials_with_suppliers?: number; // Matériaux avec fournisseurs assignés
  error?: string;               // Message d'erreur si service indisponible
}

// ============================================================================
// ENHANCED MATERIAL CONTRACTS (Library Service with CRM Integration)
// ============================================================================

/**
 * Matériau avec intégration CRM - Version Input (création/modification)
 * Correspond aux champs acceptés par FournitureSerializer
 */
export interface MaterialWithSupplierInput {
  // Champs matériau standard
  nom: string;                   // required
  unite: string;                 // required
  prix_achat_ht: string;        // required - decimal as string
  description?: string | null;
  reference?: string | null;
  vat_rate?: string;            // decimal as string, default="20.0"
  type?: string;                // default="material"
  code?: string | null;
  waste_factor?: string;        // decimal as string, default="0.0"
  is_recyclable?: boolean;      // default=false
  categorie?: number | null;    // Category foreign key
  
  // Intégration fournisseurs
  supplier_id?: string | null; // UUID référence vers CRM
}

/**
 * Matériau avec intégration CRM - Version Output (lecture)
 * Correspond au retour enrichi de FournitureSerializer
 */
export interface MaterialWithSupplierOutput {
  // Champs de base
  id: number;
  nom: string;
  unite: string;
  prix_achat_ht: string;        // decimal as string
  description: string | null;
  reference: string | null;
  vat_rate: string;             // decimal as string
  type: string;
  code: string | null;
  waste_factor: string;         // decimal as string
  is_recyclable: boolean;
  categorie: number | null;
  created_at: string;           // ISO datetime
  updated_at: string;           // ISO datetime
  
  // Champs enrichis existants
  categorie_nom: string | null; // Nom complet catégorie
  unitPrice: string;            // Alias pour prix_achat_ht
  vatRate: string;              // Alias pour vat_rate
  wasteFactor: string;          // Alias pour waste_factor
  
  // Intégration CRM
  supplier_id: string | null;           // UUID référence CRM
  supplier_details: CRMSupplierDetails | null; // Détails enrichis depuis CRM
  effective_supplier_name: string | null;      // Nom effectif CRM
}

// ============================================================================
// FRONTEND INTEGRATION TYPES
// ============================================================================

/**
 * Props pour le composant SupplierSelector
 */
export interface SupplierSelectorProps {
  value?: string | null;        // UUID du fournisseur sélectionné
  onChange: (supplierId: string | null, supplierData?: CRMSupplierSummary) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Props pour le composant SupplierDisplay
 */
export interface SupplierDisplayProps {
  material: MaterialWithSupplierOutput;
  showDetails?: boolean;        // Afficher les détails complets
  showContactInfo?: boolean;    // Afficher email/téléphone
  showActions?: boolean;        // Afficher boutons d'action
  onViewInCRM?: (supplierId: string) => void;
}

/**
 * État du hook useSupplierIntegration
 */
export interface SupplierIntegrationState {
  suppliers: CRMSupplierSummary[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedSupplier: CRMSupplierDetails | null;
}

/**
 * Actions du hook useSupplierIntegration
 */
export interface SupplierIntegrationActions {
  searchSuppliers: (query: string) => Promise<void>;
  getSupplierDetails: (supplierId: string) => Promise<CRMSupplierDetails | null>;
  clearSearch: () => void;
  setSelectedSupplier: (supplier: CRMSupplierDetails | null) => void;
}

// ============================================================================
// API INTEGRATION TYPES
// ============================================================================

/**
 * Configuration pour les appels API d'intégration
 */
export interface SupplierApiConfig {
  searchEndpoint: '/api/library/fournitures/suppliers_search/';
  detailsEndpoint: '/api/suppliers/{id}/'; // Via API Gateway → CRM
  statsEndpoint: '/api/library/fournitures/suppliers_stats/';
  timeout: number;              // Timeout en ms
  retries: number;              // Nombre de tentatives
}

/**
 * Réponse d'erreur de l'API d'intégration
 */
export interface SupplierApiError {
  error: string;
  code?: string;
  details?: Record<string, any>;
  service_unavailable?: boolean; // true si CRM service down
}

// ============================================================================
// TRANSFORMATION & VALIDATION TYPES
// ============================================================================

/**
 * Transformer pour conversion legacy Material → MaterialWithSupplierInput
 */
export interface MaterialToSupplierTransformer {
  fromLegacyMaterial(material: any): MaterialWithSupplierInput;
  toLegacyMaterial(material: MaterialWithSupplierOutput): any;
  validateSupplierData(data: Partial<MaterialWithSupplierInput>): string[];
}

/**
 * Validation constraints pour les fournisseurs
 */
export interface SupplierValidationRules {
  supplier_id?: {
    format: 'uuid';
    nullable: true;
  };
  effective_supplier_name: {
    readonly: true;
    computed: true;
  };
}

// ============================================================================
// QUERY & CACHE TYPES (pour React Query)
// ============================================================================

/**
 * Query keys pour React Query
 */
export const SUPPLIER_QUERY_KEYS = {
  all: ['suppliers'] as const,
  search: (query: string) => ['suppliers', 'search', query] as const,
  details: (id: string) => ['suppliers', 'details', id] as const,
  stats: () => ['suppliers', 'stats'] as const,
  materialsWithSuppliers: () => ['materials', 'with-suppliers'] as const,
} as const;

/**
 * Options de cache pour les données fournisseurs
 */
export interface SupplierCacheOptions {
  staleTime: {
    search: number;             // 2 minutes pour les recherches
    details: number;            // 5 minutes pour les détails
    stats: number;              // 10 minutes pour les stats
  };
  cacheTime: {
    search: number;             // 5 minutes retention
    details: number;            // 30 minutes retention
    stats: number;              // 1 heure retention
  };
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Types d'erreurs spécifiques à l'intégration fournisseurs
 */
export type SupplierIntegrationError = 
  | 'SERVICE_UNAVAILABLE'       // CRM service down
  | 'INVALID_SUPPLIER_ID'       // UUID invalide
  | 'SUPPLIER_NOT_FOUND'        // Fournisseur inexistant
  | 'TENANT_MISMATCH'          // Problème de tenant
  | 'NETWORK_ERROR'            // Erreur réseau
  | 'VALIDATION_ERROR'         // Erreur de validation
  | 'PERMISSION_DENIED'        // Droits insuffisants
  | 'RATE_LIMITED';            // Trop de requêtes

/**
 * Contexte d'erreur avec informations de debug
 */
export interface SupplierErrorContext {
  type: SupplierIntegrationError;
  message: string;
  supplierId?: string;
  tenantId?: string;
  endpoint?: string;
  httpStatus?: number;
  retryable: boolean;
  timestamp: string;
}

// ============================================================================
// CONSTANTS & DEFAULTS
// ============================================================================

/**
 * Valeurs par défaut pour l'intégration fournisseurs
 */
export const SUPPLIER_DEFAULTS = {
  SEARCH_MIN_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  API_TIMEOUT_MS: 5000,
  MAX_RETRIES: 3,
  CACHE_TTL: {
    SEARCH: 120000,      // 2 minutes
    DETAILS: 300000,     // 5 minutes
    STATS: 600000,       // 10 minutes
  },
} as const;

/**
 * Messages d'erreur standardisés
 */
export const SUPPLIER_ERROR_MESSAGES = {
  SERVICE_UNAVAILABLE: 'Service fournisseurs temporairement indisponible',
  INVALID_SUPPLIER_ID: 'Identifiant fournisseur invalide',
  SUPPLIER_NOT_FOUND: 'Fournisseur non trouvé',
  NETWORK_ERROR: 'Erreur de connexion au service fournisseurs',
  SEARCH_TOO_SHORT: 'Veuillez saisir au moins 2 caractères pour la recherche',
  TENANT_REQUIRED: 'Contexte tenant requis pour accéder aux fournisseurs',
} as const;

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Type guard pour vérifier si un matériau a un fournisseur CRM
 */
export function hasCRMSupplier(material: MaterialWithSupplierOutput): material is MaterialWithSupplierOutput & {
  supplier_id: string;
  supplier_details: CRMSupplierDetails;
} {
  return !!(material.supplier_id && material.supplier_details);
}

/**
 * Type guard pour vérifier si une réponse API est une erreur
 */
export function isSupplierApiError(response: any): response is SupplierApiError {
  return typeof response === 'object' && response !== null && 'error' in response;
}

/**
 * Utilitaire pour formater l'affichage d'un fournisseur
 */
export function formatSupplierDisplay(supplier: CRMSupplierSummary | CRMSupplierDetails): string {
  if (supplier.siret) {
    return `${supplier.nom} (${supplier.siret})`;
  }
  return supplier.nom;
}

/**
 * Utilitaire pour valider un UUID de fournisseur
 */
export function isValidSupplierUUID(supplierId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(supplierId);
}