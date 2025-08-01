import { apiClient } from '@/lib/api/client';
import { Opportunity, OpportunityFilters } from '../types/opportunities.types';

// Adapter les données du backend vers le format frontend
const adaptOpportunityFromApi = (opportunityApi: any): Opportunity => {
  // S'assurer que opportunityApi est un objet non-null
  if (!opportunityApi) {
    console.error("opportunityApi est undefined ou null");
    return {
      id: '',
      name: 'Données manquantes',
      tierId: '',
      tierName: '',
      tierType: [],
      stage: 'new',
      estimatedAmount: 0,
      probability: 0,
      expectedCloseDate: new Date().toISOString().split('T')[0],
      source: 'other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    id: opportunityApi.id,
    name: opportunityApi.name,
    tierId: opportunityApi.tier || opportunityApi.tierId,
    tierName: opportunityApi.tier_nom || opportunityApi.tier_name || opportunityApi.tierName || '',
    tierType: opportunityApi.tier_type ? [opportunityApi.tier_type] : opportunityApi.tierType || [],
    stage: opportunityApi.stage,
    estimatedAmount: parseFloat(opportunityApi.estimated_amount || opportunityApi.estimatedAmount || '0'),
    probability: opportunityApi.probability,
    expectedCloseDate: opportunityApi.expected_close_date || opportunityApi.expectedCloseDate,
    source: opportunityApi.source,
    description: opportunityApi.description,
    assignedTo: opportunityApi.assigned_to || opportunityApi.assignedTo,
    createdAt: opportunityApi.created_at || opportunityApi.createdAt,
    updatedAt: opportunityApi.updated_at || opportunityApi.updatedAt,
    closedAt: opportunityApi.closed_at || opportunityApi.closedAt,
    lossReason: opportunityApi.loss_reason || opportunityApi.lossReason,
    lossDescription: opportunityApi.loss_description || opportunityApi.lossDescription,
    projectId: opportunityApi.project_id || opportunityApi.projectId,
    quoteIds: opportunityApi.quote_ids || opportunityApi.quoteIds || [],
    quotes: opportunityApi.quotes || [],
    quotes_count: opportunityApi.quotes_count || 0
  };
};

// Adapter les données du frontend vers le format backend
const adaptOpportunityToApi = (opportunity: Partial<Opportunity>): any => {
  // S'assurer que les valeurs numériques sont des nombres et non des chaînes
  const estimatedAmount = typeof opportunity.estimatedAmount === 'string' 
    ? parseFloat(opportunity.estimatedAmount) 
    : opportunity.estimatedAmount || 1; // Le backend exige un montant > 0
  
  // S'assurer que la probabilité est un nombre
  const probability = typeof opportunity.probability === 'string'
    ? parseInt(opportunity.probability, 10)
    : opportunity.probability || 0;
  
  // Vérifier si assigned_to est un UUID valide ou "none"
  let assignedTo = null;
  if (opportunity.assignedTo && opportunity.assignedTo !== "" && opportunity.assignedTo !== "none") {
    // Regex pour valider un UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(opportunity.assignedTo)) {
      assignedTo = opportunity.assignedTo;
    } else {
      console.warn('⚠️ assigned_to n\'est pas un UUID valide, il sera défini à null');
    }
  }
  
  // S'assurer que la date est au bon format
  const expectedCloseDate = opportunity.expectedCloseDate || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Construire l'objet à envoyer au backend
  const apiData = {
    name: opportunity.name,
    tier: opportunity.tierId || opportunity.tier, // Le backend attend 'tier', pas 'tierId'
    stage: opportunity.stage,
    estimated_amount: estimatedAmount,
    probability: probability,
    expected_close_date: expectedCloseDate, // Assurer qu'il y a toujours une date
    source: opportunity.source || 'website', // Valeur par défaut si non fournie
    description: opportunity.description || '',
    assigned_to: assignedTo, // Utiliser la valeur validée ou null
    loss_reason: opportunity.lossReason || null,
    loss_description: opportunity.lossDescription || '',
    project_id: opportunity.projectId || null
  };
  
  // Filtrer les valeurs null/undefined pour éviter les erreurs de validation
  // MAIS garder les champs obligatoires même s'ils sont vides
  const cleanedData = Object.fromEntries(
    Object.entries(apiData).filter(([key, value]) => {
      // Toujours garder les champs obligatoires
      const requiredFields = ['name', 'tier', 'stage', 'estimated_amount', 'expected_close_date', 'source'];
      if (requiredFields.includes(key)) {
        return true;
      }
      return value !== undefined && value !== null && value !== '';
    })
  );
  
  return cleanedData;
};

// Fonctions d'API pour les opportunités
// Note: apiClient.baseURL est déjà configuré avec http://localhost:8000/api
// donc tous les chemins sont relatifs à cette base
export const opportunitiesApi = {
  // Récupérer toutes les opportunités avec filtres optionnels
  getOpportunities: async (filters?: OpportunityFilters): Promise<Opportunity[]> => {
    try {
      // Log pour déboguer les appels API
      console.log('📞 Appel API: GET /api/opportunities/ avec filtres:', filters);
      
      const response = await apiClient.get('/api/opportunities/', { params: filters });
      console.log('📊 Réponse API opportunités:', {
        total: response.data.count || 'N/A',
        returned: response.data.results?.length || response.data.result?.length || response.data.length || 0,
        structure: response.data.results ? 'paginée (results)' : response.data.result ? 'paginée (result)' : 'directe'
      });
      
      const data = response.data.results || response.data.result || response.data;
      return data.map(adaptOpportunityFromApi);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // Récupérer une opportunité par ID
  getOpportunity: async (id: string): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: GET /api/opportunities/${id}/`);
      const response = await apiClient.get(`/api/opportunities/${id}/`);
      return adaptOpportunityFromApi(response.data);
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle opportunité
  createOpportunity: async (data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const apiData = adaptOpportunityToApi(data);
      
      // Logs détaillés pour débogage
      console.log('📞 Appel API: POST /api/opportunities/ avec données:', data);
      console.log('📦 Données adaptées pour API:', apiData);
      console.log('🔍 Vérification des champs obligatoires:');
      console.log(' - name:', apiData.name ? '✅' : '❌', apiData.name);
      console.log(' - tier:', apiData.tier ? '✅' : '❌', apiData.tier);
      console.log(' - stage:', apiData.stage ? '✅' : '❌', apiData.stage);
      console.log(' - estimated_amount:', apiData.estimated_amount ? '✅' : '❌', apiData.estimated_amount);
      console.log(' - expected_close_date:', apiData.expected_close_date ? '✅' : '❌', apiData.expected_close_date);
      console.log(' - source:', apiData.source ? '✅' : '❌', apiData.source);
      
      const response = await apiClient.post('/api/opportunities/', apiData);
      return adaptOpportunityFromApi(response.data);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('📛 Détails de l\'erreur API:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Afficher le contenu complet de l'erreur
        console.error('📛 Message d\'erreur complet:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw error;
    }
  },

  // Mettre à jour une opportunité existante
  updateOpportunity: async (id: string, data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: PATCH /api/opportunities/${id}/ avec données:`, data);
      const apiData = adaptOpportunityToApi(data);
      const response = await apiClient.patch(`/api/opportunities/${id}/`, apiData);
      return adaptOpportunityFromApi(response.data);
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une opportunité
  deleteOpportunity: async (id: string): Promise<void> => {
    try {
      console.log(`📞 Appel API: DELETE /api/opportunities/${id}/`);
      await apiClient.delete(`/api/opportunities/${id}/`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une opportunité
  updateOpportunityStage: async (id: string, stage: string): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: PATCH /api/opportunities/${id}/update_stage/ avec stage:`, stage);
      const response = await apiClient.patch(`/api/opportunities/${id}/update_stage/`, { stage });
      return adaptOpportunityFromApi(response.data);
    } catch (error) {
      console.error(`Error updating opportunity ${id} stage:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme gagnée
  markAsWon: async (id: string, data?: { project_id?: string }): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: POST /api/opportunities/${id}/mark_won/ avec données:`, data || {});
      const response = await apiClient.post(`/api/opportunities/${id}/mark_won/`, data || {});
      return adaptOpportunityFromApi(response.data.opportunity || response.data);
    } catch (error) {
      console.error(`Error marking opportunity ${id} as won:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme perdue
  markAsLost: async (id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: POST /api/opportunities/${id}/mark_lost/ avec données:`, data);
      const response = await apiClient.post(`/api/opportunities/${id}/mark_lost/`, data);
      return adaptOpportunityFromApi(response.data.opportunity || response.data);
    } catch (error) {
      console.error(`Error marking opportunity ${id} as lost:`, error);
      throw error;
    }
  },

  // Obtenir les données Kanban
  getKanbanData: async (): Promise<any> => {
    try {
      console.log('📞 Appel API: GET /api/opportunities/kanban/');
      const response = await apiClient.get('/api/opportunities/kanban/');
      return response.data;
    } catch (error) {
      console.error('Error fetching kanban data:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des opportunités
  getOpportunityStats: async (): Promise<any> => {
    try {
      console.log('📞 Appel API: GET /api/opportunities/stats/');
      const response = await apiClient.get('/api/opportunities/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity stats:', error);
      throw error;
    }
  },
};

export default opportunitiesApi;
