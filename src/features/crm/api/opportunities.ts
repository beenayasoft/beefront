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
    assignedToName: opportunityApi.assigned_to_name || 
                    opportunityApi.assignedToName || 
                    opportunityApi.assigned_to_display || 
                    opportunityApi.creator_name || 
                    opportunityApi.created_by_name ||
                    null,
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
  // 🔧 CORRECTIF : Gérer les arrays qui arrivent parfois du formulaire
  console.log('🔍 Debug adaptOpportunityToApi - données reçues:', opportunity);
  console.log('🔍 Propriétés disponibles:', Object.keys(opportunity));
  console.log('🔍 Formats détectés:', {
    estimatedAmount: opportunity.estimatedAmount,
    estimated_amount: (opportunity as any).estimated_amount,
    expectedCloseDate: opportunity.expectedCloseDate,
    expected_close_date: (opportunity as any).expected_close_date
  });
  
  // Helper pour extraire une valeur d'un array si nécessaire
  const extractValue = (value: any) => {
    if (Array.isArray(value)) {
      console.log('⚠️ Valeur en array détectée:', value, '-> extraction de:', value[0]);
      return value[0];
    }
    return value;
  };
  
  // S'assurer que les valeurs numériques sont des nombres et non des chaînes
  // Gérer les deux formats: camelCase (estimatedAmount) et snake_case (estimated_amount)
  const rawEstimatedAmount = extractValue(opportunity.estimatedAmount || opportunity.estimated_amount);
  const estimatedAmount = typeof rawEstimatedAmount === 'string' 
    ? parseFloat(rawEstimatedAmount) 
    : rawEstimatedAmount || 1; // Le backend exige un montant > 0
  
  // S'assurer que la probabilité est un nombre
  const rawProbability = extractValue(opportunity.probability);
  const probability = typeof rawProbability === 'string'
    ? parseInt(rawProbability, 10)
    : rawProbability || 0;
  
  // Vérifier si assigned_to est un UUID valide ou "none"
  const rawAssignedTo = extractValue(opportunity.assignedTo);
  let assignedTo = null;
  if (rawAssignedTo && rawAssignedTo !== "" && rawAssignedTo !== "none") {
    // Regex pour valider un UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(rawAssignedTo)) {
      assignedTo = rawAssignedTo;
    } else {
      console.warn('⚠️ assigned_to n\'est pas un UUID valide, il sera défini à null');
    }
  }
  
  // S'assurer que la date est au bon format
  // Gérer les deux formats: camelCase (expectedCloseDate) et snake_case (expected_close_date)
  const rawExpectedCloseDate = extractValue(opportunity.expectedCloseDate || opportunity.expected_close_date);
  const expectedCloseDate = rawExpectedCloseDate || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Construire l'objet à envoyer au backend (le serializer Django attend camelCase)
  const apiData = {
    name: extractValue(opportunity.name),
    tierId: extractValue(opportunity.tierId || opportunity.tier), // Le serializer Django attend 'tierId'
    stage: extractValue(opportunity.stage),
    estimatedAmount: estimatedAmount, // Le serializer Django attend 'estimatedAmount'
    probability: probability,
    expectedCloseDate: expectedCloseDate, // Le serializer Django attend 'expectedCloseDate'
    source: extractValue(opportunity.source) || 'website', // Valeur par défaut si non fournie
    description: extractValue(opportunity.description) || '',
    assignedTo: assignedTo, // Le serializer Django attend 'assignedTo'
    lossReason: extractValue(opportunity.lossReason) || null,
    lossDescription: extractValue(opportunity.lossDescription) || '',
    projectId: extractValue(opportunity.projectId) || null
  };
  
  // Filtrer les valeurs null/undefined pour éviter les erreurs de validation
  // MAIS garder les champs obligatoires même s'ils sont vides
  const cleanedData = Object.fromEntries(
    Object.entries(apiData).filter(([key, value]) => {
      // Toujours garder les champs obligatoires (noms en camelCase pour le serializer Django)
      const requiredFields = ['name', 'tierId', 'stage', 'estimatedAmount', 'expectedCloseDate', 'source'];
      if (requiredFields.includes(key)) {
        return true;
      }
      return value !== undefined && value !== null && value !== '';
    })
  );
  
  console.log('✅ Données finales envoyées à l\'API:', cleanedData);
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
      console.log('📞 Appel API: GET /opportunities/ avec filtres:', filters);
      
      const response = await apiClient.get('/opportunities/', { params: filters });
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
      console.log(`📞 Appel API: GET /opportunities/${id}/`);
      const response = await apiClient.get(`/opportunities/${id}/`);
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
      console.log('📞 Appel API: POST /opportunities/ avec données:', data);
      console.log('📦 Données adaptées pour API:', apiData);
      console.log('🔍 Vérification des champs obligatoires:');
      console.log(' - name:', apiData.name ? '✅' : '❌', apiData.name);
      console.log(' - tierId:', apiData.tierId ? '✅' : '❌', apiData.tierId);
      console.log(' - stage:', apiData.stage ? '✅' : '❌', apiData.stage);
      console.log(' - estimatedAmount:', apiData.estimatedAmount ? '✅' : '❌', apiData.estimatedAmount);
      console.log(' - expectedCloseDate:', apiData.expectedCloseDate ? '✅' : '❌', apiData.expectedCloseDate);
      console.log(' - source:', apiData.source ? '✅' : '❌', apiData.source);
      
      console.log('🔍 DERNIÈRE VÉRIFICATION - Données exactes envoyées à apiClient.post:');
      console.log('JSON.stringify(apiData):', JSON.stringify(apiData, null, 2));
      console.log('Type check apiData:', typeof apiData, Array.isArray(apiData) ? 'ARRAY!' : 'OBJECT');
      Object.entries(apiData).forEach(([key, value]) => {
        console.log(`   apiData.${key}:`, typeof value, Array.isArray(value) ? 'ARRAY!' : '', value);
      });
      
      const response = await apiClient.post('/opportunities/', apiData);
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
      console.log(`📞 Appel API: PATCH /opportunities/${id}/ avec données:`, data);
      const apiData = adaptOpportunityToApi(data);
      const response = await apiClient.patch(`/opportunities/${id}/`, apiData);
      return adaptOpportunityFromApi(response.data);
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une opportunité
  deleteOpportunity: async (id: string): Promise<void> => {
    try {
      console.log(`📞 Appel API: DELETE /opportunities/${id}/`);
      await apiClient.delete(`/opportunities/${id}/`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une opportunité
  updateOpportunityStage: async (id: string, stage: string): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: PATCH /opportunities/${id}/update_stage/ avec stage:`, stage);
      const response = await apiClient.patch(`/opportunities/${id}/update_stage/`, { stage });
      return adaptOpportunityFromApi(response.data);
    } catch (error: any) {
      console.log(`🔍 Erreur interceptée dans updateOpportunityStage:`, {
        status: error?.response?.status,
        code: error?.response?.data?.code,
        detail: error?.response?.data?.detail
      });
      
      // Si l'erreur indique qu'il faut créer un devis pour passer en négociation
      if (error?.response?.status === 400 && error?.response?.data?.code === 'QUOTE_REQUIRED_FOR_NEGOTIATION') {
        console.log(`💡 Suggestion: créer un devis avant de passer en négociation pour l'opportunité ${id}`);
        // On laisse l'erreur d'origine remonter telle quelle pour préserver toutes les propriétés
        throw error;
      }
      
      console.error(`❌ Erreur lors de la mise à jour du stage pour l'opportunité ${id}:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme gagnée
  markAsWon: async (id: string, data?: { project_id?: string }): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: POST /opportunities/${id}/mark_won/ avec données:`, data || {});
      const response = await apiClient.post(`/opportunities/${id}/mark_won/`, data || {});
      return adaptOpportunityFromApi(response.data.opportunity || response.data);
    } catch (error: any) {
      console.log(`🔍 Erreur interceptée dans markAsWon:`, {
        status: error?.response?.status,
        code: error?.response?.data?.code,
        detail: error?.response?.data?.detail
      });
      
      // Si l'erreur indique qu'il faut passer par négociation, on fait le workflow automatique
      if (error?.response?.status === 400 && error?.response?.data?.code === 'NEGOTIATION_REQUIRED_FOR_WON') {
        console.log(`🔄 DÉMARRAGE du workflow automatique: passage par négociation puis marquage gagnée pour ${id}`);
        try {
          // Étape 1: Forcer le passage en négociation
          console.log(`📞 Étape 1: PATCH /opportunities/${id}/update_stage/ avec force:true`);
          await apiClient.patch(`/opportunities/${id}/update_stage/`, { 
            stage: 'negotiation', 
            force: true 
          });
          console.log(`✅ Étape 1 réussie: opportunité ${id} passée en négociation`);
          
          // Étape 2: Marquer comme gagnée
          console.log(`📞 Étape 2: POST /opportunities/${id}/mark_won/`);
          const wonResponse = await apiClient.post(`/opportunities/${id}/mark_won/`, data || {});
          console.log(`✅ Workflow automatique réussi pour ${id}!`);
          return adaptOpportunityFromApi(wonResponse.data.opportunity || wonResponse.data);
        } catch (workflowError) {
          console.error(`❌ Erreur dans le workflow automatique pour ${id}:`, workflowError);
          throw workflowError;
        }
      }
      
      console.error(`❌ Erreur non gérée par le workflow pour ${id}:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme perdue
  markAsLost: async (id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> => {
    try {
      console.log(`📞 Appel API: POST /opportunities/${id}/mark_lost/ avec données:`, data);
      const response = await apiClient.post(`/opportunities/${id}/mark_lost/`, data);
      return adaptOpportunityFromApi(response.data.opportunity || response.data);
    } catch (error) {
      console.error(`Error marking opportunity ${id} as lost:`, error);
      throw error;
    }
  },

  // Obtenir les données Kanban
  getKanbanData: async (): Promise<any> => {
    try {
      console.log('📞 Appel API: GET /opportunities/kanban/');
      const response = await apiClient.get('/opportunities/kanban/');
      return response.data;
    } catch (error) {
      console.error('Error fetching kanban data:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des opportunités
  getOpportunityStats: async (): Promise<any> => {
    try {
      console.log('📞 Appel API: GET /opportunities/stats/');
      const response = await apiClient.get('/opportunities/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity stats:', error);
      throw error;
    }
  },
};

export default opportunitiesApi;
