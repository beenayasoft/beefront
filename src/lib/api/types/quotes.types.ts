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
 * Types possibles pour un élément de devis
 */
export enum QuoteItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
  WORK = 'work',
  CHAPTER = 'chapter',
  SECTION = 'section',
  DISCOUNT = 'discount'
}

/**
 * Taux de TVA disponibles
 */
export enum VATRate {
  ZERO = '0',
  REDUCED_55 = '5.5',
  REDUCED_10 = '10',
  STANDARD = '20'
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
  vatRate: string;
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
 */
export interface Quote {
  id: string;
  number: string;
  tierId: string;
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
 */
export interface QuoteFilters {
  status?: QuoteStatus | string;
  tierId?: string;
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
 * Interface pour la création d'un élément de devis
 */
export interface CreateQuoteItemData {
  type: QuoteItemType;
  parent?: string | null;
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: string;
  margin?: number;
  workId?: string;
}

/**
 * Interface pour la création d'un devis
 */
export interface CreateQuoteData {
  tierId: string;
  clientName: string;
  clientAddress?: string;
  projectName?: string;
  projectAddress?: string;
  projectReference?: string;
  issueDate?: string;
  expiryDate?: string;
  validityPeriod?: number;
  notes?: string;
  termsAndConditions?: string;
  opportunityId?: string;
  margin?: number;
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
