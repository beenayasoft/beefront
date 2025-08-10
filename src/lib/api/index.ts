/**
 * Point d'entrée unifié pour toutes les APIs
 * Redirige vers les nouvelles APIs dans features/
 */

// APIs core qui restent dans lib/api
export { apiClient, buildQueryParams, handleApiError } from './client';
export * from './tenant';
export * from './users';
export * from './documentAppearance';

// Redirections vers les nouvelles APIs dans features/
export * from '@/features/auth/api/auth';
export * from '@/features/crm/api/crm';
export * from '@/features/library/api/composite';
export * from '@/features/library/api/materials';
export * from '@/features/library/api/labor';
export * from '@/features/library/api/works';
export * from '@/features/library/api/categories';
export * from '@/features/library/api/ingredients';
export * from '@/features/library/api/stats';
export * from '@/features/library/api/search';
export * from '@/features/documents/api/quotes';
export * from '@/features/documents/api/invoices';
export * from '@/features/documents/api/paymentTerms';
export * from '@/features/documents/api/tenantVatRates';
export * from '@/features/settings/api/settings';

// Types legacy pour compatibilité
export type { QuoteFilters, QuoteStats } from '@/features/documents/api/quotes';
export type { InvoiceFilters } from '@/features/documents/api/invoices';
