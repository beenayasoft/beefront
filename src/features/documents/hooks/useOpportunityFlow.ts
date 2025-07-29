/**
 * Hook pour gérer le workflow des opportunités dans le contexte de création de devis
 * Gère la sélection et création d'opportunités liées au client
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/features/crm/api/crm';
import { OpportunityOption, ClientOption } from '@/features/crm/types/crm.types';

export interface OpportunityFlowState {
  // Données
  opportunities: OpportunityOption[];
  selectedOpportunity: OpportunityOption | null;
  
  // États
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  
  // UI
  showCreateForm: boolean;
  isCreating: boolean;
  
  // Métadonnées
  hasActiveOpportunities: boolean;
  suggestedOpportunity: OpportunityOption | null;
}

export interface OpportunityFlowActions {
  // Sélection
  selectOpportunity: (opportunity: OpportunityOption | null) => void;
  clearSelection: () => void;
  
  // Création
  createOpportunity: (opportunityData: any) => Promise<OpportunityOption>;
  showCreate: () => void;
  hideCreate: () => void;
  
  // Navigation
  openOpportunityDetails: (opportunityId: string) => void;
  
  // Cache
  refresh: () => void;
  invalidateCache: () => void;
}

interface UseOpportunityFlowOptions {
  client: ClientOption | null;
  initialOpportunity?: OpportunityOption | null;
  autoSelectSingle?: boolean;
  onOpportunitySelect?: (opportunity: OpportunityOption | null) => void;
  onOpportunityCreate?: (opportunity: OpportunityOption) => void;
}

export const useOpportunityFlow = (options: UseOpportunityFlowOptions): OpportunityFlowState & OpportunityFlowActions => {
  const {
    client,
    initialOpportunity = null,
    autoSelectSingle = false,
    onOpportunitySelect,
    onOpportunityCreate
  } = options;
  
  const queryClient = useQueryClient();
  
  // États locaux
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityOption | null>(initialOpportunity);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Query pour les opportunités du client
  const {
    data: opportunitiesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['opportunities', 'by-client', client?.id],
    queryFn: async ({ signal }) => {
      if (!client?.id) return { results: [], count: 0 };
      
      console.log('🎯 useOpportunityFlow - Recherche opportunités pour client:', client);
      
      try {
        // Récupérer les opportunités ouvertes pour ce client
        const response = await crmApi.opportunities.getOpportunitiesByClient(
          client.id,
          ['new', 'needs_analysis', 'negotiation', 'proposal'] // Statuts ouverts
        );
        
        console.log('📋 useOpportunityFlow - Opportunités trouvées:', response);
        
        return {
          results: response || [],
          count: response?.length || 0
        };
      } catch (error) {
        console.error('❌ useOpportunityFlow - Erreur lors de la récupération des opportunités:', {
          clientId: client.id,
          clientName: client.name,
          error: error?.response?.data || error?.message
        });
        
        // Gestion gracieuse des erreurs - ne pas faire planter l'interface
        if (error?.response?.status === 404 || error?.response?.status === 500) {
          console.warn('⚠️ Retour tableau vide suite à erreur serveur');
          return { results: [], count: 0 };
        }
        
        // Pour les autres erreurs, les propager
        throw error;
      }
    },
    enabled: !!client?.id,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Ne pas retry les erreurs 404 ou 500
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        return false;
      }
      return failureCount < 2;
    }
  });
  
  const opportunities = useMemo(() => {
    return opportunitiesData?.results || [];
  }, [opportunitiesData]);
  
  // Métadonnées calculées
  const isEmpty = opportunities.length === 0;
  const hasActiveOpportunities = opportunities.some(opp => 
    ['new', 'needs_analysis', 'negotiation'].includes(opp.stage)
  );
  
  // Suggestion automatique de l'opportunité la plus récente et active
  const suggestedOpportunity = useMemo(() => {
    const activeOpportunities = opportunities.filter(opp => 
      ['new', 'needs_analysis', 'negotiation'].includes(opp.stage)
    );
    
    if (activeOpportunities.length === 0) return null;
    
    // Retourner la première opportunité active (tri par ID décroissant comme proxy pour la plus récente)
    return activeOpportunities.sort((a, b) => b.id.localeCompare(a.id))[0];
  }, [opportunities]);
  
  // Auto-sélection si une seule opportunité
  useEffect(() => {
    if (autoSelectSingle && opportunities.length === 1 && !selectedOpportunity) {
      selectOpportunity(opportunities[0]);
    }
  }, [opportunities, autoSelectSingle, selectedOpportunity]);
  
  // Reset sélection si le client change
  useEffect(() => {
    if (!client) {
      setSelectedOpportunity(null);
    }
  }, [client]);
  
  // Actions de sélection
  const selectOpportunity = useCallback((opportunity: OpportunityOption | null) => {
    setSelectedOpportunity(opportunity);
    onOpportunitySelect?.(opportunity);
  }, [onOpportunitySelect]);
  
  const clearSelection = useCallback(() => {
    selectOpportunity(null);
  }, [selectOpportunity]);
  
  // Actions de création
  const createOpportunity = useCallback(async (opportunityData: any): Promise<OpportunityOption> => {
    if (!client) {
      throw new Error('Client requis pour créer une opportunité');
    }
    
    setIsCreating(true);
    
    try {
      const newOpportunity = await crmApi.opportunities.createOpportunity({
        ...opportunityData,
        tier: client.id
      });
      
      // Invalider le cache des opportunités
      queryClient.invalidateQueries({ 
        queryKey: ['opportunities', 'by-client', client.id] 
      });
      
      // Transformer en OpportunityOption
      const opportunityOption: OpportunityOption = {
        id: newOpportunity.id,
        name: newOpportunity.name,
        stage: newOpportunity.stage,
        estimatedAmount: newOpportunity.estimatedAmount || 0,
        probability: newOpportunity.probability || 0,
        tierId: newOpportunity.tier || client.id,
        tierName: client.name
      };
      
      // Sélectionner automatiquement la nouvelle opportunité
      selectOpportunity(opportunityOption);
      setShowCreateForm(false);
      onOpportunityCreate?.(opportunityOption);
      
      return opportunityOption;
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [client, queryClient, selectOpportunity, onOpportunityCreate]);
  
  const showCreate = useCallback(() => {
    setShowCreateForm(true);
  }, []);
  
  const hideCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);
  
  // Navigation
  const openOpportunityDetails = useCallback((opportunityId: string) => {
    // Cette fonction pourrait ouvrir un modal ou naviguer vers la page de détail
    // Pour l'instant, on peut simplement logger ou ouvrir dans un nouvel onglet
    window.open(`/opportunities/${opportunityId}`, '_blank');
  }, []);
  
  // Cache
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['opportunities'] 
    });
  }, [queryClient]);
  
  return {
    // État
    opportunities,
    selectedOpportunity,
    isLoading,
    error: error?.message || null,
    isEmpty,
    showCreateForm,
    isCreating,
    hasActiveOpportunities,
    suggestedOpportunity,
    
    // Actions
    selectOpportunity,
    clearSelection,
    createOpportunity,
    showCreate,
    hideCreate,
    openOpportunityDetails,
    refresh,
    invalidateCache
  };
};

export type UseOpportunityFlow = ReturnType<typeof useOpportunityFlow>;