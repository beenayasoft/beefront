/**
 * Hook React Query pour la gestion des opportunit�s
 * Optimis� avec cache hybride pour performance maximale
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../api';
import { Opportunity, OpportunityStatus } from '../types/crm.types';
import { getCrmCachedData, setCrmCachedData, invalidateCrmCache } from '../utils/cacheUtils';

// Cl�s de requ�te standardis�es pour les opportunit�s
export const opportunitiesQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunitiesQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...opportunitiesQueryKeys.lists(), { filters }] as const,
  details: () => [...opportunitiesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunitiesQueryKeys.details(), id] as const,
  stats: () => [...opportunitiesQueryKeys.all, 'stats'] as const,
  kanban: () => [...opportunitiesQueryKeys.all, 'kanban'] as const,
};

// Interface pour les param�tres de requ�te des opportunit�s
interface UseOpportunitiesParams {
  status?: OpportunityStatus[];
  search?: string;
  enabled?: boolean;
}

/**
 * Hook pour r�cup�rer toutes les opportunit�s avec cache hybride
 */
export function useOpportunities({
  status,
  search = '',
  enabled = true
}: UseOpportunitiesParams = {}) {
  const filters = { status, search: search || undefined };
  const cacheKey = `opportunities_${JSON.stringify(filters)}`;

  return useQuery({
    queryKey: opportunitiesQueryKeys.list(filters),
    queryFn: async () => {
      // V�rifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log('[OPPORTUNITIES API] Chargement depuis l\'API...');
      const result = await opportunitiesApi.getOpportunities(filters);
      
      // Mettre en cache le r�sultat
      setCrmCachedData(cacheKey, result);
      
      return result;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour r�cup�rer les statistiques des opportunit�s avec cache
 */
export function useOpportunitiesStats(search: string = '') {
  const cacheKey = `opportunities_stats_${search}`;

  return useQuery({
    queryKey: opportunitiesQueryKeys.stats(),
    queryFn: async () => {
      // V�rifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Calculer les stats � partir des opportunit�s
      console.log('[OPPORTUNITIES STATS] Calcul des statistiques...');
      const opportunities = await opportunitiesApi.getOpportunities({ search: search || undefined });
      
      const stats = {
        total: opportunities.length,
        new: opportunities.filter(o => o.status === 'new').length,
        needs_analysis: opportunities.filter(o => o.status === 'needs_analysis').length,
        negotiation: opportunities.filter(o => o.status === 'negotiation').length,
        won: opportunities.filter(o => o.status === 'won').length,
        lost: opportunities.filter(o => o.status === 'lost').length,
        totalValue: opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0),
        wonValue: opportunities.filter(o => o.status === 'won').reduce((sum, o) => sum + (o.estimated_value || 0), 0),
      };
      
      // Mettre en cache le r�sultat
      setCrmCachedData(cacheKey, stats);
      
      return stats;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes pour les stats
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour r�cup�rer les d�tails d'une opportunit�
 */
export function useOpportunityDetail(id: string, enabled: boolean = true) {
  const cacheKey = `opportunity_detail_${id}`;

  return useQuery({
    queryKey: opportunitiesQueryKeys.detail(id),
    queryFn: async () => {
      // 
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log(`[OPPORTUNITY DETAIL] Chargement detail ${id}...`);
      const result = await opportunitiesApi.getOpportunityDetail(id);
      
      // Mettre en cache le r�sultat
      setCrmCachedData(cacheKey, result);
      
      return result;
    },
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour les mutations d'opportunit�s avec invalidation de cache hybride
 */
export function useOpportunityMutations() {
  const queryClient = useQueryClient();

  const createOpportunity = useMutation({
    mutationFn: (data: Partial<Opportunity>) => opportunitiesApi.createOpportunity(data),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('cr�ation opportunit�');
      
      // Invalider les requ�tes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      
      console.log('Opportunit� cr��e avec succ�s - cache hybride invalid�');
    },
    onError: (error) => {
      console.error('L Erreur lors de la cr�ation de l\'opportunit�:', error);
    },
  });

  const updateOpportunity = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) => 
      opportunitiesApi.updateOpportunity(id, data),
    onSuccess: (_, variables) => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('mise � jour opportunit�');
      
      // Invalider les requ�tes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.detail(variables.id) });
      
      console.log(' Opportunit� mise � jour avec succ�s - cache hybride invalid�');
    },
    onError: (error) => {
      console.error('L Erreur lors de la mise � jour de l\'opportunit�:', error);
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: (id: string) => opportunitiesApi.deleteOpportunity(id),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('suppression opportunit�');
      
      // Invalider les requ�tes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      
      console.log('Opportunit� supprim�e avec succ�s - cache hybride invalid�');
    },
    onError: (error) => {
      console.error('L Erreur lors de la suppression de l\'opportunit�:', error);
    },
  });

  const changeOpportunityStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: OpportunityStatus; reason?: string }) => 
      opportunitiesApi.changeStatus(id, status, reason),
    onSuccess: (_, variables) => {
      // Invalider le cache sessionStorage
      invalidateCrmCache(`changement statut opportunit� vers ${variables.status}`);
      
      // Invalider les requ�tes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.detail(variables.id) });
      
      console.log(`Statut opportunit� chang� vers ${variables.status} - cache hybride invalid�`);
    },
    onError: (error) => {
      console.error('L Erreur lors du changement de statut:', error);
    },
  });

  return {
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    changeOpportunityStatus,
  };
}

/**
 * Hook combin� pour la page Opportunit�s
 */
export function useOpportunitiesPage() {
  const queryClient = useQueryClient();

  // M�thode pour forcer le rechargement de toutes les donn�es
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.all });
    invalidateCrmCache('refresh opportunit�s');
  };

  // M�thode pour pr�charger les d�tails d'une opportunit� (optimisation UX)
  const prefetchOpportunityDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: opportunitiesQueryKeys.detail(id),
      queryFn: () => opportunitiesApi.getOpportunityDetail(id),
      staleTime: 60 * 1000,
    });
  };

  return {
    refreshAll,
    prefetchOpportunityDetail,
    mutations: useOpportunityMutations(),
  };
}