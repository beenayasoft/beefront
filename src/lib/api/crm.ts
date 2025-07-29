import { apiClient, buildQueryParams } from './client';
import type { 
    Tiers, 
    TiersCreateInput, 
    TiersUpdateInput,
    TiersStats,
    TiersFrontendFormat,
    Contact,
    Adresse,
    Opportunity,
    OpportunityCreateInput,
    OpportunityUpdateInput,
    OpportunityStats,
    OpportunityKanban
} from '../types/crm';

const BASE_URL = '/api/crm';

// Tiers API
export const getTiers = async (page = 1, pageSize = 20, filters?: any) => {
    const params = buildQueryParams(page, pageSize, filters);
    const response = await apiClient.get(`${BASE_URL}/tiers/`, { params });
    return response.data;
};

export const getTiersFrontendFormat = async (page = 1, pageSize = 20, filters?: any) => {
    const params = buildQueryParams(page, pageSize, filters);
    const response = await apiClient.get<TiersFrontendFormat>(`${BASE_URL}/tiers/frontend_format/`, { params });
    return response.data;
};

export const getTiersStats = async () => {
    const response = await apiClient.get<TiersStats>(`${BASE_URL}/tiers/stats/`);
    return response.data;
};

export const getTiersById = async (id: string) => {
    const response = await apiClient.get<Tiers>(`${BASE_URL}/tiers/${id}/`);
    return response.data;
};

export const createTiers = async (data: TiersCreateInput) => {
    const response = await apiClient.post<Tiers>(`${BASE_URL}/tiers/`, data);
    return response.data;
};

export const updateTiers = async (id: string, data: TiersUpdateInput) => {
    const response = await apiClient.put<Tiers>(`${BASE_URL}/tiers/${id}/`, data);
    return response.data;
};

export const deleteTiers = async (id: string) => {
    await apiClient.delete(`${BASE_URL}/tiers/${id}/`);
};

export const restoreTiers = async (id: string) => {
    const response = await apiClient.post<Tiers>(`${BASE_URL}/tiers/${id}/restore/`);
    return response.data;
};

export const getTiersVue360 = async (id: string) => {
    const response = await apiClient.get<Tiers>(`${BASE_URL}/tiers/${id}/vue_360/`);
    return response.data;
};

// Contacts API
export const getContacts = async (tierId: string) => {
    const response = await apiClient.get<Contact[]>(`${BASE_URL}/tiers/${tierId}/contacts/`);
    return response.data;
};

export const createContact = async (tierId: string, data: Partial<Contact>) => {
    const response = await apiClient.post<Contact>(`${BASE_URL}/tiers/${tierId}/contacts/`, data);
    return response.data;
};

export const updateContact = async (tierId: string, contactId: string, data: Partial<Contact>) => {
    const response = await apiClient.put<Contact>(`${BASE_URL}/tiers/${tierId}/contacts/${contactId}/`, data);
    return response.data;
};

export const deleteContact = async (tierId: string, contactId: string) => {
    await apiClient.delete(`${BASE_URL}/tiers/${tierId}/contacts/${contactId}/`);
};

// Adresses API
export const getAdresses = async (tierId: string) => {
    const response = await apiClient.get<Adresse[]>(`${BASE_URL}/tiers/${tierId}/adresses/`);
    return response.data;
};

export const createAdresse = async (tierId: string, data: Partial<Adresse>) => {
    const response = await apiClient.post<Adresse>(`${BASE_URL}/tiers/${tierId}/adresses/`, data);
    return response.data;
};

export const updateAdresse = async (tierId: string, adresseId: string, data: Partial<Adresse>) => {
    const response = await apiClient.put<Adresse>(`${BASE_URL}/tiers/${tierId}/adresses/${adresseId}/`, data);
    return response.data;
};

export const deleteAdresse = async (tierId: string, adresseId: string) => {
    await apiClient.delete(`${BASE_URL}/tiers/${tierId}/adresses/${adresseId}/`);
};

// Opportunities API
export const getOpportunities = async (page = 1, pageSize = 20, filters?: any) => {
    const params = buildQueryParams(page, pageSize, filters);
    const response = await apiClient.get<Opportunity[]>(`${BASE_URL}/opportunities/`, { params });
    return response.data;
};

export const getOpportunityStats = async () => {
    const response = await apiClient.get<OpportunityStats>(`${BASE_URL}/opportunities/stats/`);
    return response.data;
};

export const getOpportunityKanban = async () => {
    const response = await apiClient.get<OpportunityKanban>(`${BASE_URL}/opportunities/kanban/`);
    return response.data;
};

export const getOpportunityById = async (id: string) => {
    const response = await apiClient.get<Opportunity>(`${BASE_URL}/opportunities/${id}/`);
    return response.data;
};

export const createOpportunity = async (data: OpportunityCreateInput) => {
    const response = await apiClient.post<Opportunity>(`${BASE_URL}/opportunities/`, data);
    return response.data;
};

export const updateOpportunity = async (id: string, data: OpportunityUpdateInput) => {
    const response = await apiClient.put<Opportunity>(`${BASE_URL}/opportunities/${id}/`, data);
    return response.data;
};

export const deleteOpportunity = async (id: string) => {
    await apiClient.delete(`${BASE_URL}/opportunities/${id}/`);
};

export const updateOpportunityStage = async (id: string, stage: string) => {
    const response = await apiClient.patch<Opportunity>(`${BASE_URL}/opportunities/${id}/update_stage/`, { stage });
    return response.data;
};

export const markOpportunityAsWon = async (id: string, projectId?: string) => {
    const response = await apiClient.post<Opportunity>(`${BASE_URL}/opportunities/${id}/mark_won/`, { project_id: projectId });
    return response.data;
};

export const markOpportunityAsLost = async (id: string, reason: string, description?: string) => {
    const response = await apiClient.post<Opportunity>(`${BASE_URL}/opportunities/${id}/mark_lost/`, {
        loss_reason: reason,
        loss_description: description
    });
    return response.data;
}; 