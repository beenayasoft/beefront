/**
 * Service d'opportunités - Version optimisée pour SOA
 * Délégation complète de la logique métier au backend
 */
import { opportunitiesApi } from '../api/opportunities';
import { Opportunity, OpportunityFilters } from '../types/opportunity';

export const opportunityService = {
  // Récupérer toutes les opportunités avec filtres optionnels
  getOpportunities: async (filters?: OpportunityFilters): Promise<Opportunity[]> => {
    console.log('🔍 Service: Récupération des opportunités avec filtres', filters);
    try {
      const opportunities = await opportunitiesApi.getOpportunities(filters);
      console.log(`✅ ${opportunities.length} opportunités récupérées`);
      return opportunities;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des opportunités:', error);
      throw error;
    }
  },

  // Récupérer une opportunité par ID
  getOpportunity: async (id: string): Promise<Opportunity> => {
    console.log(`🔍 Service: Récupération de l'opportunité ${id}`);
    try {
      const opportunity = await opportunitiesApi.getOpportunity(id);
      console.log('✅ Opportunité récupérée:', opportunity.name);
      return opportunity;
      } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle opportunité
  createOpportunity: async (data: Partial<Opportunity>): Promise<Opportunity> => {
    console.log('📝 Service: Création d\'une nouvelle opportunité', data.name);
    try {
      const opportunity = await opportunitiesApi.createOpportunity(data);
      console.log('✅ Opportunité créée avec succès:', opportunity.id);
      return opportunity;
      } catch (error) {
      console.error('❌ Erreur lors de la création de l\'opportunité:', error);
      throw error;
    }
  },

  // Mettre à jour une opportunité existante
  updateOpportunity: async (id: string, data: Partial<Opportunity>): Promise<Opportunity> => {
    console.log(`📝 Service: Mise à jour de l'opportunité ${id}`, data);
    try {
      const opportunity = await opportunitiesApi.updateOpportunity(id, data);
      console.log('✅ Opportunité mise à jour avec succès');
      return opportunity;
      } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une opportunité
  deleteOpportunity: async (id: string): Promise<void> => {
    console.log(`🗑️ Service: Suppression de l'opportunité ${id}`);
    try {
      await opportunitiesApi.deleteOpportunity(id);
      console.log('✅ Opportunité supprimée avec succès');
      } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'opportunité ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une opportunité
  updateOpportunityStage: async (id: string, stage: string): Promise<Opportunity> => {
    console.log(`🔄 Service: Mise à jour du statut de l'opportunité ${id} vers ${stage}`);
    try {
      const opportunity = await opportunitiesApi.updateOpportunityStage(id, stage);
      console.log('✅ Statut de l\'opportunité mis à jour avec succès');
      return opportunity;
      } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du statut de l'opportunité ${id}:`, error);
      throw error;
    }
  },
  
  // Alias pour updateOpportunityStage pour compatibilité avec le code existant
  updateStage: async (id: string, stage: string): Promise<Opportunity> => {
    console.log(`🔄 Service: Mise à jour du statut (alias) de l'opportunité ${id} vers ${stage}`);
    return await opportunityService.updateOpportunityStage(id, stage);
  },

  // Marquer une opportunité comme gagnée
  markAsWon: async (id: string, data?: { project_id?: string }): Promise<Opportunity> => {
    console.log(`🏆 Service: Marquer l'opportunité ${id} comme gagnée`);
    try {
      const opportunity = await opportunitiesApi.markAsWon(id, data);
      console.log('✅ Opportunité marquée comme gagnée avec succès');
      return opportunity;
      } catch (error) {
      console.error(`❌ Erreur lors du marquage de l'opportunité ${id} comme gagnée:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme perdue
  markAsLost: async (id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> => {
    console.log(`❌ Service: Marquer l'opportunité ${id} comme perdue`);
    try {
      const opportunity = await opportunitiesApi.markAsLost(id, data);
      console.log('✅ Opportunité marquée comme perdue avec succès');
      return opportunity;
      } catch (error) {
      console.error(`❌ Erreur lors du marquage de l'opportunité ${id} comme perdue:`, error);
      throw error;
    }
  },

  // Obtenir les données Kanban
  getKanbanData: async (): Promise<any> => {
    console.log('🔍 Service: Récupération des données Kanban');
    try {
      const data = await opportunitiesApi.getKanbanData();
      console.log('✅ Données Kanban récupérées avec succès');
      return data;
      } catch (error) {
      console.error('❌ Erreur lors de la récupération des données Kanban:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des opportunités
  getOpportunityStats: async (): Promise<any> => {
    console.log('📊 Service: Récupération des statistiques des opportunités');
    try {
      const stats = await opportunitiesApi.getOpportunityStats();
      console.log('✅ Statistiques des opportunités récupérées avec succès');
      return stats;
      } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques des opportunités:', error);
      throw error;
    }
  },
  
  // Alias pour getOpportunityStats pour compatibilité avec le code existant
  getStats: async (): Promise<any> => {
    console.log('📊 Service: Récupération des statistiques (alias)');
    try {
      // Utiliser directement les statistiques du backend sans transformation
      return await opportunitiesApi.getOpportunityStats();
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer les opportunités d'un tier spécifique
  getOpportunitiesByTier: async (
    tierId: string, 
    options?: { 
      includeMetrics?: boolean; 
    }
  ): Promise<{
    opportunities: Opportunity[];
    metrics?: any;
  }> => {
    console.log(`🎯 Service: Récupération des opportunités pour le tier ${tierId}`);
    
    try {
      // Utiliser l'API existante avec filtre par tier
      const filters: OpportunityFilters = {
        tier: tierId
      };
      
      // Récupérer les opportunités via l'API
      const opportunities = await opportunitiesApi.getOpportunities(filters);
      
      console.log(`✅ ${opportunities.length} opportunités récupérées pour le tier ${tierId}`);
      
      // Si les métriques sont demandées, les récupérer via l'API stats
      let metrics = undefined;
      if (options?.includeMetrics) {
        const statsResponse = await opportunitiesApi.getOpportunityStats();
        metrics = statsResponse;
      }
      
      return {
        opportunities,
        metrics
      };
      
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des opportunités pour le tier ${tierId}:`, error);
      throw error;
    }
  }
}; 