/**
 * Service d'opportunités - Version optimisée pour SOA
 * Délégation complète de la logique métier au backend
 */
import { Opportunity } from '../types/opportunities.types';
import { apiClient } from '@/lib/api/client';

interface OpportunityServiceOptions {
  progressive?: boolean;
  includeMetrics?: boolean;
}

interface OpportunityServiceResponse {
  opportunities: Opportunity[];
  metrics?: {
    total: number;
    byStage: Record<string, number>;
    totalAmount: number;
    avgAmount: number;
  };
  source: 'api' | 'mock';
}

export const opportunityService = {
  async getOpportunitiesByTier(
    tierId: string,
    options: OpportunityServiceOptions = {}
  ): Promise<OpportunityServiceResponse> {
    try {
      const response = await apiClient.get(`/opportunities/`, {
        params: { tier_id: tierId }
      });

      const opportunities = response.data.results || [];

      // Calculer les métriques si demandé
      let metrics;
      if (options.includeMetrics) {
        const totalAmount = opportunities.reduce((sum: number, opp: Opportunity) => sum + opp.estimatedAmount, 0);
        metrics = {
          total: opportunities.length,
          byStage: opportunities.reduce((acc: Record<string, number>, opp: Opportunity) => {
            acc[opp.stage] = (acc[opp.stage] || 0) + 1;
            return acc;
          }, {}),
          totalAmount,
          avgAmount: opportunities.length > 0 ? totalAmount / opportunities.length : 0
        };
      }

      return {
        opportunities,
        metrics,
        source: 'api'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des opportunités:', error);
      throw error;
    }
  },

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    try {
      const response = await apiClient.post('/opportunities/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      throw error;
    }
  },

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    try {
      const response = await apiClient.put(`/opportunities/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'opportunité:', error);
      throw error;
    }
  },

  async deleteOpportunity(id: string): Promise<void> {
    try {
      await apiClient.delete(`/opportunities/${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'opportunité:', error);
      throw error;
    }
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    try {
      const response = await apiClient.get(`/opportunities/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'opportunité:', error);
      throw error;
    }
  }
}; 