/**
 * Contrats de données TypeScript pour le service Library
 * Basés sur l'analyse complète du backend Django REST Framework
 * 
 * Principe : Chaque modèle a des types séparés pour :
 * - CreateInput : ce qu'on envoie pour créer
 * - UpdateInput : ce qu'on envoie pour modifier
 * - Output : ce que le backend renvoie
 */

// ============================================================================
// CATEGORIES (Categorie)
// ============================================================================

export interface CategorieCreateInput {
  nom: string;                    // required - max_length=100
  parent?: number | null;         // optional - foreign key to another category
  position?: number;              // optional - default=0, for display ordering
  description?: string | null;    // optional - text field
}

export interface CategorieUpdateInput extends Partial<CategorieCreateInput> {}

export interface CategorieOutput {
  id: number;
  nom: string;
  parent: number | null;
  position: number;
  description: string | null;
  created_at: string;            // ISO datetime string
  updated_at: string;            // ISO datetime string
}

export interface CategorieDetailOutput extends CategorieOutput {
  chemin_complet: string;        // computed property - full hierarchical path
  sous_categories: CategorieOutput[];  // nested subcategories
}

// ============================================================================
// MATERIALS (Fourniture)
// ============================================================================

export interface FournitureCreateInput {
  nom: string;                   // required - max_length=100
  unite: string;                 // required - max_length=20, unit of measure
  prix_achat_ht: string;        // required - decimal as string, purchase price ex VAT
  categorie?: number | null;     // optional - foreign key to category
  description?: string | null;   // optional - text field
  reference?: string | null;     // optional - max_length=50
  vat_rate?: string;            // optional - decimal as string, default="20.0"
  type?: string;                // optional - max_length=20, default="material"
  code?: string | null;         // optional - max_length=50
  waste_factor?: string;        // optional - decimal as string, default="0.0"
  is_recyclable?: boolean;      // optional - default=false
}

export interface FournitureUpdateInput extends Partial<FournitureCreateInput> {}

export interface FournitureOutput {
  id: number;
  nom: string;
  unite: string;
  prix_achat_ht: string;        // decimal as string
  categorie: number | null;
  description: string | null;
  reference: string | null;
  vat_rate: string;             // decimal as string
  type: string;
  code: string | null;
  waste_factor: string;         // decimal as string
  is_recyclable: boolean;
  created_at: string;           // ISO datetime string
  updated_at: string;           // ISO datetime string
  
  // Computed/alias fields from serializer
  categorie_nom: string | null;  // full category path if category exists
  unitPrice: string;            // alias for prix_achat_ht
  vatRate: string;              // alias for vat_rate
  wasteFactor: string;          // alias for waste_factor
}

export interface FournitureDetailOutput extends FournitureOutput {
  categorie_details: CategorieOutput | null;  // full category object instead of just ID
}

// ============================================================================
// LABOR (MainOeuvre)
// ============================================================================

export type SkillLevel = 'apprentice' | 'skilled' | 'expert' | 'specialist';

export interface MainOeuvreCreateInput {
  nom: string;                  // required - max_length=100
  cout_horaire: string;         // required - decimal as string, hourly cost
  categorie?: number | null;    // optional - foreign key to category
  description?: string | null;  // optional - text field
  type?: string;               // optional - max_length=20, default="labor"
  unite?: string;              // optional - max_length=20, default="h"
  code?: string | null;        // optional - max_length=50
  skill_level?: SkillLevel;    // optional - default='skilled'
  productivity_factor?: string; // optional - decimal as string, default="1.0"
}

export interface MainOeuvreUpdateInput extends Partial<MainOeuvreCreateInput> {}

export interface MainOeuvreOutput {
  id: number;
  nom: string;
  cout_horaire: string;         // decimal as string
  categorie: number | null;
  description: string | null;
  type: string;
  unite: string;
  code: string | null;
  skill_level: SkillLevel;
  productivity_factor: string;  // decimal as string
  created_at: string;          // ISO datetime string
  updated_at: string;          // ISO datetime string
  
  // Computed/alias fields from serializer
  categorie_nom: string | null; // full category path if category exists
  unitPrice: string;           // alias for cout_horaire
  prix_achat_ht: string;       // alias for cout_horaire (compatibility)
}

export interface MainOeuvreDetailOutput extends MainOeuvreOutput {
  categorie_details: CategorieOutput | null;  // full category object instead of just ID
}

// ============================================================================
// WORKS (Ouvrage)
// ============================================================================

export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface OuvrageCreateInput {
  nom: string;                  // required - max_length=200
  unite: string;                // required - max_length=20, unit of measure
  categorie?: number | null;    // optional - foreign key to category
  description?: string | null;  // optional - text field
  code?: string | null;         // optional - max_length=50
  prix_recommande?: string;     // optional - decimal as string, default="0"
  marge?: string;              // optional - decimal as string, default="20.0"
  is_custom?: boolean;         // optional - default=false
  type?: string;               // optional - max_length=20, default="work"
  complexity?: ComplexityLevel; // optional - default='medium'
  efficiency?: string;         // optional - decimal as string, default="1.0"
  duration_estimate?: string | null;  // optional - decimal as string
  requires_certification?: boolean;   // optional - default=false
}

export interface OuvrageUpdateInput extends Partial<OuvrageCreateInput> {}

export interface OuvrageOutput {
  id: number;
  nom: string;
  unite: string;
  categorie: number | null;
  description: string | null;
  code: string | null;
  prix_recommande: string;      // decimal as string
  marge: string;               // decimal as string
  is_custom: boolean;
  type: string;
  complexity: ComplexityLevel;
  efficiency: string;          // decimal as string
  duration_estimate: string | null;  // decimal as string
  requires_certification: boolean;
  created_at: string;          // ISO datetime string
  updated_at: string;          // ISO datetime string
  
  // Computed fields from serializer and model properties
  categorie_nom: string | null;     // full category path if category exists
  debourse_sec: string;            // computed total cost (decimal as string)
  totalCost: string;               // alias for debourse_sec
  recommendedPrice: string;        // computed recommended price (decimal as string)
  margin: string;                  // alias for marge
  laborCost: string;              // computed labor cost (decimal as string)
  materialCost: string;           // computed material cost (decimal as string)
}

export interface OuvrageDetailOutput extends OuvrageOutput {
  categorie_details: CategorieOutput | null;    // full category object
  ingredients: IngredientOuvrageOutput[];       // list of work components
}

// ============================================================================
// WORK COMPONENTS (IngredientOuvrage)
// ============================================================================

export type ElementTypeName = 'fourniture' | 'mainoeuvre';

export interface IngredientOuvrageCreateInput {
  ouvrage: number;                    // required - foreign key to work
  element_type_nom: ElementTypeName;  // required for creation - type name
  element_id: number;                 // required - ID of the referenced material or labor
  quantite: string;                   // required - decimal as string, quantity
  waste_allowance?: string;           // optional - decimal as string, default="0.0"
  notes?: string | null;              // optional - text field
}

export interface IngredientOuvrageUpdateInput {
  quantite?: string;                  // optional - decimal as string
  waste_allowance?: string;           // optional - decimal as string
  notes?: string | null;              // optional - text field
  // Note: element_type and element_id cannot be updated after creation
}

export interface IngredientOuvrageOutput {
  id: number;
  ouvrage: number;                    // foreign key to work
  element_type: number;               // ContentType ID
  element_id: number;                 // ID of referenced material/labor
  quantite: string;                   // decimal as string
  waste_allowance: string;            // decimal as string
  notes: string | null;
  created_at: string;                 // ISO datetime string
  updated_at: string;                 // ISO datetime string
  
  // Computed fields from serializer (optimized with prefetching)
  element_nom: string | null;         // name of referenced element
  element_unite: string | null;       // unit of referenced element
  element_prix: string | null;        // unit price of referenced element (decimal as string)
  cout_total: string;                 // computed total cost (decimal as string)
  element_type_nom: ElementTypeName;  // type name
}

// ============================================================================
// UNIFIED LIBRARY ITEM (LibraryItemSerializer)
// ============================================================================

export type LibraryItemType = 'material' | 'labor' | 'work';

export interface LibraryItemOutput {
  id: number;
  nom: string;
  type: LibraryItemType;
  unite: string;
  unitPrice: string;                  // decimal as string
  categorie: string | null;           // category name
  description: string | null;
  code: string | null;
  
  // Material-specific fields (present when type === 'material')
  vatRate?: string;                   // decimal as string
  wasteFactor?: string;               // decimal as string
  
  // Labor-specific fields (present when type === 'labor')
  skill_level?: SkillLevel;
  productivity_factor?: string;       // decimal as string
  
  // Work-specific fields (present when type === 'work')
  complexity?: ComplexityLevel;
  efficiency?: string;                // decimal as string
  duration_estimate?: string;         // decimal as string
  requires_certification?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface LibraryCompositeResponse {
  fournitures: {
    count: number;
    total: number;
    items: FournitureOutput[];
  };
  main_oeuvre: {
    count: number;
    total: number;
    items: MainOeuvreOutput[];
  };
  ouvrages: {
    count: number;
    total: number;
    items: OuvrageOutput[];
  };
  pagination: {
    page: number;
    page_size: number;
    limit_per_type: number;
    returned_items: number;
    total_items: number;
  };
  filters_applied: {
    search: string | null;
    category: string | null;
  };
  performance: {
    endpoint: string;
    milestone: string;
    db_optimizations: string[];
    queries_saved: number;
    queryset_optimization: boolean;
  };
  latency_audit?: {
    total_time_ms: string;
    params_parsing_ms: string;
    queryset_prep_ms: string;
    db_queries_ms: string;
    count_queries_ms: string;
    serialization_ms: string;
    response_building_ms: string;
  };
}

export interface LibrarySearchResponse {
  categories: CategorieOutput[];
  fournitures: FournitureOutput[];
  main_oeuvre: MainOeuvreOutput[];
  ouvrages: OuvrageOutput[];
  total_results: number;
}

// ============================================================================
// STATISTICS RESPONSE TYPES
// ============================================================================

export interface CategorieStatsResponse {
  total_categories: number;
  categories_racines: number;
  categories_avec_parent: number;
}

export interface FournitureStatsResponse {
  total: number;
  par_categorie: number;
  prix_moyen: string | null;        // decimal as string
  prix_total: string | null;        // decimal as string
  avec_reference: number;
  recyclables: number;
}

export interface MainOeuvreStatsResponse {
  total: number;
  par_categorie: number;
  cout_moyen: string | null;        // decimal as string
  cout_total: string | null;        // decimal as string
  par_type: number;
  specialises: number;
}

export interface OuvrageStatsResponse {
  total: number;
  par_categorie: number;
  prix_moyen: string | null;        // decimal as string
  prix_total: string | null;        // decimal as string
  personnalises: number;
  avec_ingredients: number;
  avec_certification: number;
}

export interface IngredientOuvrageStatsResponse {
  total: number;
  par_ouvrage: number;
  par_type: number;
  quantite_moyenne: string | null;   // decimal as string
  quantite_totale: string | null;    // decimal as string
}

// ============================================================================
// VALIDATION CONSTRAINTS (pour le frontend)
// ============================================================================

export interface ValidationConstraints {
  readonly categorie: {
    readonly nom: { maxLength: 100; required: true };
    readonly parent: { type: 'number'; nullable: true };
    readonly position: { type: 'number'; min: 0; default: 0 };
    readonly description: { type: 'string'; nullable: true };
  };
  
  readonly fourniture: {
    readonly nom: { maxLength: 100; required: true };
    readonly unite: { maxLength: 20; required: true };
    readonly prix_achat_ht: { type: 'decimal'; maxDigits: 10; decimalPlaces: 2; required: true };
    readonly categorie: { type: 'number'; nullable: true };
    readonly reference: { maxLength: 50; nullable: true };
    readonly vat_rate: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '20.0' };
    readonly type: { maxLength: 20; default: 'material' };
    readonly code: { maxLength: 50; nullable: true };
    readonly waste_factor: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '0.0' };
    readonly is_recyclable: { type: 'boolean'; default: false };
  };
  
  readonly mainOeuvre: {
    readonly nom: { maxLength: 100; required: true };
    readonly cout_horaire: { type: 'decimal'; maxDigits: 10; decimalPlaces: 2; required: true };
    readonly categorie: { type: 'number'; nullable: true };
    readonly type: { maxLength: 20; default: 'labor' };
    readonly unite: { maxLength: 20; default: 'h' };
    readonly code: { maxLength: 50; nullable: true };
    readonly skill_level: { 
      type: 'choice'; 
      choices: readonly ['apprentice', 'skilled', 'expert', 'specialist']; 
      default: 'skilled' 
    };
    readonly productivity_factor: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '1.0' };
  };
  
  readonly ouvrage: {
    readonly nom: { maxLength: 200; required: true };
    readonly unite: { maxLength: 20; required: true };
    readonly categorie: { type: 'number'; nullable: true };
    readonly code: { maxLength: 50; nullable: true };
    readonly prix_recommande: { type: 'decimal'; maxDigits: 12; decimalPlaces: 2; default: '0' };
    readonly marge: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '20.0' };
    readonly type: { maxLength: 20; default: 'work' };
    readonly complexity: { 
      type: 'choice'; 
      choices: readonly ['low', 'medium', 'high']; 
      default: 'medium' 
    };
    readonly efficiency: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '1.0' };
    readonly duration_estimate: { type: 'decimal'; maxDigits: 8; decimalPlaces: 2; nullable: true };
    readonly requires_certification: { type: 'boolean'; default: false };
  };
  
  readonly ingredientOuvrage: {
    readonly ouvrage: { type: 'number'; required: true };
    readonly element_type_nom: { 
      type: 'choice'; 
      choices: readonly ['fourniture', 'mainoeuvre']; 
      required: true 
    };
    readonly element_id: { type: 'number'; required: true };
    readonly quantite: { type: 'decimal'; maxDigits: 10; decimalPlaces: 3; required: true };
    readonly waste_allowance: { type: 'decimal'; maxDigits: 5; decimalPlaces: 2; default: '0.0' };
    readonly notes: { type: 'string'; nullable: true };
    readonly uniqueTogether: readonly ['ouvrage', 'element_type', 'element_id'];
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type pour la transformation frontend ↔ backend
export type ApiDecimalField = string; // Tous les décimaux sont des strings dans l'API
export type ApiDateField = string;    // Les dates sont des strings ISO

// Type pour les erreurs de validation de l'API
export interface ApiValidationError {
  [fieldName: string]: string[];
}

export interface ApiErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [fieldName: string]: string[] | string | undefined;
}