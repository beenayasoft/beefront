/**
 * API exports for CRM feature
 */
export { crmApi, tiersApi } from './crm';
export { opportunitiesApi } from './opportunities'; // ✅ AJOUT : Export manquant
export { contactsApi } from './contacts'; // ✅ AJOUT : API des contacts
export type { TiersFilters, PaginationInfo, TiersGlobalStats, TierData } from './crm';
export type { Contact, UpdateContactRequest } from './contacts'; // ✅ AJOUT : Types des contacts
export * from './crm';