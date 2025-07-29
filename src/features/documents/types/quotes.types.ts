/**
 * Types pour les devis
 * Générés à partir des modèles Django du backend
 */

/**
 * Statuts possibles pour un devis
 */
export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Types possibles pour un élément de devis (aligné avec bibliothèque)
 */
export enum QuoteItemType {
  MATERIAL = 'material',
  LABOR = 'labor',
  WORK = 'work',
  CHAPTER = 'chapter',
  SECTION = 'section',
  DISCOUNT = 'discount',
  ADVANCE_PAYMENT = 'advance_payment'
}

/**
 * Unités de mesure BTP
 */
export enum BTPUnits {
  UNIT = 'u',
  SQUARE_METER = 'm²',
  CUBIC_METER = 'm³',
  LINEAR_METER = 'ml',
  KILOGRAM = 'kg',
  TONNE = 't',
  LITER = 'l',
  HOUR = 'h',
  DAY = 'j',
  WEEK = 'sem',
  MONTH = 'mois',
  PACKAGE = 'forfait',
  PERCENT = '%'
}

/**
 * Configuration d'affichage pour les types d'éléments
 */
export interface QuoteItemTypeConfig {
  type: QuoteItemType;
  label: string;
  description: string;
  icon: string;
  allowPricing: boolean;
  allowQuantity: boolean;
  defaultUnit?: BTPUnits;
  color: string;
}

/**
 * Types de remises
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  UNIT_PRICE = 'unit_price'
}

/**
 * Portée d'application d'une remise
 */
export enum DiscountScope {
  ITEM = 'item',
  SECTION = 'section',
  TOTAL = 'total'
}

/**
 * Taux de TVA disponibles (ancienne version)
 * @deprecated Utiliser l'interface VATRateInfo à la place
 * Conservé pour compatibilité avec l'ancien code
 */
export enum VATRate {
  ZERO = '0',
  REDUCED_55 = '5.5',
  REDUCED_10 = '10',
  STANDARD = '20'
}

/**
 * Interface pour les taux de TVA tenant-specific
 */
export interface VATRateInfo {
  id: string;
  code: string;
  name: string;
  rate: number;
  rate_display?: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

/**
 * Interface pour les informations client
 */
export interface ClientInfo {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  contactName?: string;
}

/**
 * Interface pour les informations projet
 */
export interface ProjectInfo {
  id?: string;
  name?: string;
  address?: string;
  reference?: string;
}

/**
 * Interface pour la répartition de TVA
 */
export interface VATBreakdown {
  rate: string;
  baseAmount: number;
  vatAmount: number;
}

/**
 * Interface pour les statistiques des éléments d'un devis
 */
export interface QuoteItemsStats {
  totalItems: number;
  byType: {
    [key: string]: number;
  };
  totalDiscount: number;
  averageMargin?: number;
}

/**
 * Interface pour un élément de devis
 * Alignée avec le modèle Django QuoteItem
 */
export interface QuoteItem {
  id: string;
  type: QuoteItemType;
  typeDisplay?: string;
  parent?: string | null;
  parentInfo?: Partial<QuoteItem> | null;
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: string; // ✅ Changé de number à string pour cohérence backend (code du taux)
  vatRateDisplay?: string;
  margin?: number;
  totalHt: number;
  totalTtc: number;
  workId?: string;
  children?: QuoteItem[];
  quoteNumber?: string;
  quote?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour un devis
 * Alignée avec le modèle Django Quote
 */
export interface Quote {
  id: string;
  number: string;
  // ❌ tierId supprimé - isolation automatique par schéma tenant
  clientName: string;
  clientAddress?: string;
  clientInfo?: ClientInfo;
  projectName?: string;
  projectAddress?: string;
  projectReference?: string;
  projectInfo?: ProjectInfo;
  issueDate: string;
  issueDateFormatted?: string;
  expiryDate?: string;
  expiryDateFormatted?: string;
  validityPeriod?: number;
  notes?: string;
  termsAndConditions?: string;
  status: QuoteStatus;
  statusDisplay?: string;
  opportunityId?: string;
  margin?: number;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  itemsCount?: number;
  vatBreakdown?: VATBreakdown[];
  items?: QuoteItem[];
  itemsStats?: QuoteItemsStats;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Interface pour les statistiques globales des devis
 */
export interface QuoteStats {
  totalQuotes: number;
  totalAmount: number;
  acceptanceRate: number;
  averageAmount: number;
  byStatus: {
    [key in QuoteStatus]?: {
      count: number;
      amount: number;
    };
  };
  byMonth: {
    month: string;
    count: number;
    amount: number;
  }[];
  topClients: {
    clientId: string;
    clientName: string;
    count: number;
    amount: number;
  }[];
}

/**
 * Interface pour les paramètres de filtrage des devis
 * Alignée avec les filtres backend
 */
export interface QuoteFilters {
  status?: QuoteStatus | string;
  // ❌ tierId supprimé - filtrage automatique par schéma tenant
  opportunityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface pour la pagination des devis
 */
export interface QuotePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Interface pour la réponse paginée de l'API
 */
export interface PaginatedQuotesResponse {
  results: Quote[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Interface pour la création d'un élément de devis (alignée avec backend)
 */
export interface CreateQuoteItemData {
  type: QuoteItemType;
  parent?: string | null;
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  details?: string; // Détails techniques supplémentaires
  unit?: BTPUnits | string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType?: DiscountType;
  vatRate: string; // ✅ Code du taux de TVA (ex: '0', '5.5', '10', '20')
  margin?: number;
  workId?: string;
  // Nouveaux champs pour texte libre et séparateurs
  freeText?: string;
  separatorTitle?: string;
  // Configuration d'affichage
  isVisible?: boolean;
  isPrintable?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Interface pour la création d'un devis avec intégration CRM (snake_case pour backend)
 * Alignée avec le serializer QuoteCreateSerializer
 */
export interface CreateQuoteData {
  // Informations CRM
  // ✅ Note: tier_id retiré car gestion automatique par schéma tenant
  opportunity_id?: string; // ID de l'opportunité dans le CRM
  
  // Informations client (auto-remplies depuis CRM)
  client_name: string;
  client_address?: string;
  
  // Informations projet
  project_name?: string;
  project_address?: string;
  project_reference?: string;
  
  // Dates et validité
  issue_date?: string;
  expiry_date?: string;
  validity_period?: number;
  
  // Contenu
  notes?: string;
  terms_and_conditions?: string;
  
  // Configuration
  margin?: number;
  
  // Éléments du devis
  items?: CreateQuoteItemData[];
}

/**
 * Interface pour les actions sur un devis
 */
export interface QuoteAction {
  reason?: string;
  notes?: string;
}

/**
 * Interface pour l'export d'un devis
 */
export interface QuoteExport {
  format: 'pdf' | 'excel' | 'csv';
  documentIds?: string[];
  includeDetails?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
