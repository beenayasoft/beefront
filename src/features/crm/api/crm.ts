/**
 * Service API pour l'intégration CRM (clients et opportunités)
 * Communique avec le service CRM via l'API Gateway
 */
import { apiClient, buildQueryParams, handleApiError } from '@/lib/api/client';
import {
  Tier,
  Opportunity,
  Address,
  Contact,
  TierFilters,
  OpportunityFilters,
  PaginatedTiersResponse,
  PaginatedOpportunitiesResponse,
  CreateTierRequest,
  CreateOpportunityData,
  CRMStats,
  ClientOption,
  OpportunityOption,
  TierRelation,
  OpportunityStatus
} from '../types';

// Types legacy pour compatibilité
export interface TiersFilters {
  search?: string;
  relation?: TierRelation;
  type?: string | string[]; // Peut être une string ou un array
  status?: 'active' | 'inactive';
  // Pagination
  page?: number;
  page_size?: number;
}
export interface PaginationInfo {
  count: number;
  num_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface TiersGlobalStats {
  total: number;
  clients: number;        // ✅ CORRECTION : pluriel comme le backend
  fournisseurs: number;   // ✅ CORRECTION : pluriel comme le backend
  prospects: number;      // ✅ CORRECTION : pluriel comme le backend
  sous_traitants: number; // ✅ CORRECTION : pluriel comme le backend
}

export interface TierData {
  id: string;
  nom: string;
  type: string;
  relation: string;
  siret?: string;
  tva?: string;
  adresses: Address[];
  contacts: Contact[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

/**
 * Service API pour les tiers (clients)
 */
const tiersApiInternal = {
  /**
   * Récupère une liste paginée de tiers avec filtres
   */
  getTiers: async (
    pageOrFilters?: number | any,
    pageSize?: number,
    filters?: TierFilters,
    signal?: AbortSignal
  ): Promise<PaginatedTiersResponse> => {
    try {
      // Support des deux signatures pour compatibilité
      let params;
      let requestSignal;
      
      if (typeof pageOrFilters === 'object') {
        // Signature legacy: getTiers(filters)
        params = pageOrFilters;
        requestSignal = pageSize as AbortSignal;
      } else {
        // Signature moderne: getTiers(page, pageSize, filters, signal)
        params = buildQueryParams(pageOrFilters || 1, pageSize || 20, filters);
        requestSignal = signal;
      }
      
      const response = await apiClient.get('/api/tiers/', { 
        params, 
        signal: requestSignal
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tiers:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un tier par son ID
   */
  getTierDetails: async (id: string, signal?: AbortSignal): Promise<Tier> => {
    try {
      const response = await apiClient.get(`/api/tiers/${encodeURIComponent(id)}/`, { 
        signal
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les clients et prospects (pour sélection dans formulaires de devis)
   */
  getClients: async (search?: string, options?: { signal?: AbortSignal; page_size?: number }): Promise<ClientOption[]> => {
    try {
      const params: any = {
        relation__in: `${TierRelation.CLIENT},${TierRelation.PROSPECT}`,
        page_size: options?.page_size || 100 // Limite raisonnable pour un sélecteur
      };
      
      if (search) {
        params.search = search;
      }
      
      console.log('🌐 API getClients - Paramètres:', { search, params, options });

      const response = await apiClient.get('/api/tiers/', { 
        params,
        signal: options?.signal
      });
      
      console.log('📊 API getClients - Réponse:', { count: response.data.count, results: response.data.results });
      
      // Transformer en options simplifiées
      return response.data.results.map((tier: Tier) => ({
        id: tier.id,
        name: tier.nom,
        type: tier.type,
        relation: tier.relation,
        adressePrincipale: tier.adresses?.find(a => a.facturation) || tier.adresses?.[0],
        contactPrincipalDevis: tier.contacts?.find(c => c.contactPrincipalDevis)
      }));
    } catch (error) {
      // Ne pas logger les erreurs d'annulation comme des erreurs critiques
      if (error?.message === 'canceled') {
        console.log('🔄 Requête annulée (normale lors de la saisie rapide)');
        return []; // Retourner un tableau vide au lieu de propager l'erreur
      }
      
      // Logger les vraies erreurs avec détails
      console.error('❌ Erreur détaillée API getClients:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        config: error?.config,
        message: error?.message
      });
      throw error;
    }
  },

  /**
   * Crée un nouveau tier
   */
  createTier: async (data: CreateTierRequest): Promise<Tier> => {
    try {
      const response = await apiClient.post('/api/tiers/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du tier:', error);
      throw error;
    }
  },

  /**
   * Met à jour un tier existant
   */
  updateTier: async (id: string, data: Partial<CreateTierData>): Promise<Tier> => {
    try {
      const response = await apiClient.put(`/api/tiers/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du tier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive un tier (soft delete)
   */
  deleteTier: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/tiers/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de l'archivage du tier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des tiers
   */
  getStats: async (search?: string, signal?: AbortSignal): Promise<any> => {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get('/api/tiers/stats/', { 
        params,
        signal 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des tiers:', error);
      throw error;
    }
  },

  /**
   * Récupère un tier par son ID avec vue détaillée
   */
  getTierById: async (id: string, signal?: AbortSignal): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tiers/${id}/vue_360/`, { 
        signal
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Méthode legacy pour récupération simple (compatibilité)
   */
  getTiersLegacy: async (signal?: AbortSignal): Promise<Tier[]> => {
    try {
      const response = await apiClient.get('/api/tiers/', { signal });
      return response.data.results || [];
    } catch (error) {
      console.error('Erreur lors de la récupération legacy des tiers:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un tier (alias pour vue_360)
   */
  getTierDetail: async (id: string, signal?: AbortSignal): Promise<any> => {
    return tiersApiInternal.getTierById(id, signal);
  }
};

/**
 * Service API pour les opportunités
 */
const opportunitiesApi = {
  /**
   * Récupère une liste paginée d'opportunités avec filtres
   */
  getOpportunities: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: OpportunityFilters,
    signal?: AbortSignal
  ): Promise<PaginatedOpportunitiesResponse> => {
    try {
      const params = buildQueryParams(page, pageSize, filters);
      const response = await apiClient.get('/api/opportunities/', { 
        params, 
        signal
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des opportunités:', error);
      if (error?.response?.data) {
        console.error('Détails erreur 500:', error.response.data);
      }
      if (error?.response?.status === 500) {
        console.error('⚠️ Erreur serveur 500 - Vérifier les logs Django');
      }
      throw error;
    }
  },

  /**
   * Récupère les détails d'une opportunité par son ID
   */
  getOpportunityDetails: async (id: string, signal?: AbortSignal): Promise<Opportunity> => {
    try {
      const response = await apiClient.get(`/api/opportunities/${id}/`, { 
        signal
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les opportunités d'un client spécifique
   */
  getOpportunitiesByClient: async (
    clientId: string, 
    status?: OpportunityStatus[],
    signal?: AbortSignal
  ): Promise<OpportunityOption[]> => {
    try {
      const params: any = {
        tier: clientId,
        page_size: 50
      };
      
      if (status && status.length > 0) {
        params.stage__in = status.join(',');
      }

      const response = await apiClient.get('/api/opportunities/', { 
        params,
        signal
      });
      
      // Transformer en options simplifiées
      return response.data.results.map((opp: any) => ({
        id: opp.id,
        name: opp.name,
        stage: opp.stage,
        estimatedAmount: parseFloat(opp.estimated_amount || opp.estimatedAmount || '0'),
        probability: parseInt(opp.probability || '0', 10),
        tierId: opp.tier || opp.tierId,
        tierName: opp.tierInfo?.nom || opp.tier_name || '',
        expectedCloseDate: opp.expected_close_date || opp.expectedCloseDate,
        description: opp.description,
        createdAt: opp.created_at || opp.createdAt,
        updatedAt: opp.updated_at || opp.updatedAt
      }));
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des opportunités du client ${clientId}:`, {
        clientId,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        url: error?.config?.url,
        params: error?.config?.params
      });
      
      // Gestion spécifique des erreurs courantes
      if (error?.response?.status === 404) {
        console.warn(`⚠️ Client ${clientId} non trouvé pour les opportunités, retour tableau vide`);
        return []; // Retourner un tableau vide plutôt qu'une erreur
      }
      
      if (error?.response?.status === 500) {
        console.error(`🚨 Erreur serveur 500 lors de la récupération des opportunités pour ${clientId}`);
      }
      
      throw error;
    }
  },

  /**
   * Crée une nouvelle opportunité
   */
  createOpportunity: async (data: CreateOpportunityData): Promise<Opportunity> => {
    try {
      // Log des données envoyées pour debug
      console.log('📤 Création opportunité - Données envoyées (snake_case):', data);
      
      // Transformer les données snake_case vers camelCase pour le sérialiseur Django
      const transformedData = {
        name: data.name,
        tierId: data.tier, // tier → tierId
        stage: data.stage,
        estimatedAmount: data.estimated_amount, // estimated_amount → estimatedAmount  
        probability: data.probability,
        expectedCloseDate: data.expected_close_date, // expected_close_date → expectedCloseDate
        source: data.source,
        description: data.description,
        assignedTo: data.assigned_to // assigned_to → assignedTo
      };
      
      console.log('📦 Données transformées (camelCase):', transformedData);
      
      const response = await apiClient.post('/api/opportunities/', transformedData);
      
      console.log('✅ Création opportunité - Réponse:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'opportunité:', error);
      if (error?.response?.data) {
        console.error('🔍 Détails de l\'erreur API:', error.response.data);
      }
      if (error?.response?.status) {
        console.error('📊 Status HTTP:', error.response.status);
      }
      throw error;
    }
  },

  /**
   * Met à jour une opportunité existante
   */
  updateOpportunity: async (id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity> => {
    try {
      const response = await apiClient.put(`/api/opportunities/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marque une opportunité comme gagnée
   */
  markAsWon: async (id: string, projectId?: string): Promise<Opportunity> => {
    try {
      const data = projectId ? { project_id: projectId } : {};
      const response = await apiClient.post(`/api/opportunities/${id}/mark_as_won/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage comme gagnée de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marque une opportunité comme perdue
   */
  markAsLost: async (id: string, reason: string, description?: string): Promise<Opportunity> => {
    try {
      const data = { reason, description };
      const response = await apiClient.post(`/api/opportunities/${id}/mark_as_lost/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage comme perdue de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une opportunité
   */
  updateStage: async (id: string, newStage: OpportunityStatus): Promise<Opportunity> => {
    try {
      const response = await apiClient.patch(`/api/opportunities/${id}/`, { stage: newStage });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une opportunité
   */
  deleteOpportunity: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/opportunities/${id}/`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'opportunité ${id}:`, error);
      return false;
    }
  }
};

/**
 * Service API pour les statistiques CRM
 */
const crmStatsApi = {
  /**
   * Récupère les statistiques globales CRM (utilise les stats des opportunités)
   */
  getStats: async (signal?: AbortSignal): Promise<any> => {
    try {
      const response = await apiClient.get('/api/opportunities/stats/', { 
        signal
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des opportunités:', error);
      throw error;
    }
  }
};

/**
 * API unifiée pour le CRM
 */
export const crmApi = {
  tiers: tiersApiInternal,
  opportunities: opportunitiesApi,
  stats: crmStatsApi,
  
  /**
   * Recherche unifiée dans tiers et opportunités
   */
  search: async (query: string, signal?: AbortSignal) => {
    try {
      const [tiersResponse, opportunitiesResponse] = await Promise.all([
        tiersApiInternal.getTiers(1, 10, { search: query }, signal),
        opportunitiesApi.getOpportunities(1, 10, { search: query }, signal)
      ]);
      
      return {
        tiers: tiersResponse.results,
        opportunities: opportunitiesResponse.results,
        totalResults: tiersResponse.count + opportunitiesResponse.count
      };
    } catch (error) {
      console.error('Erreur lors de la recherche CRM:', error);
      throw error;
    }
  }
};

// Export pour compatibilité avec l'ancien API
export const tiersApi = crmApi.tiers;

export default crmApi;