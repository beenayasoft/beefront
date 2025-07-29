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
} from '../types/crm.types';

/**
 * Service API pour les tiers (clients)
 */
const tiersApi = {
  /**
   * Récupère une liste paginée de tiers avec filtres
   */
  getTiers: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: TierFilters,
    signal?: AbortSignal
  ): Promise<PaginatedTiersResponse> => {
    try {
      const params = buildQueryParams(page, pageSize, filters);
      const response = await apiClient.get('/tiers/', { 
        params, 
        signal
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
      const response = await apiClient.get(`/tiers/${id}/`, { 
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

      const response = await apiClient.get('/tiers/', { 
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
      const response = await apiClient.post('/tiers/', data);
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
      const response = await apiClient.put(`/tiers/${id}/`, data);
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
      await apiClient.delete(`/tiers/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de l'archivage du tier ${id}:`, error);
      throw error;
    }
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
      const response = await apiClient.get('/opportunities/', { 
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
      const response = await apiClient.get(`/opportunities/${id}/`, { 
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

      const response = await apiClient.get('/opportunities/', { 
        params,
        signal
      });
      
      // Transformer en options simplifiées
      return response.data.results.map((opp: Opportunity) => ({
        id: opp.id,
        name: opp.name,
        stage: opp.stage,
        estimatedAmount: opp.estimatedAmount,
        probability: opp.probability,
        tierId: opp.tier,
        tierName: opp.tierInfo?.nom || ''
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
      console.log('📤 Création opportunité - Données envoyées:', data);
      
      const response = await apiClient.post('/opportunities/', data);
      
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
      const response = await apiClient.put(`/opportunities/${id}/`, data);
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
      const response = await apiClient.post(`/opportunities/${id}/mark_as_won/`, data);
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
      const response = await apiClient.post(`/opportunities/${id}/mark_as_lost/`, data);
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
      const response = await apiClient.patch(`/opportunities/${id}/`, { stage: newStage });
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
      await apiClient.delete(`/opportunities/${id}/`);
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
      const response = await apiClient.get('/opportunities/stats/', { 
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
  tiers: tiersApi,
  opportunities: opportunitiesApi,
  stats: crmStatsApi,
  
  /**
   * Recherche unifiée dans tiers et opportunités
   */
  search: async (query: string, signal?: AbortSignal) => {
    try {
      const [tiersResponse, opportunitiesResponse] = await Promise.all([
        tiersApi.getTiers(1, 10, { search: query }, signal),
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

export default crmApi;