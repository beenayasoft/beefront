/**
 * Hook React Query pour la gestion des opportunités
 * Optimisé avec cache hybride pour performance maximale
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../api';
import { Opportunity, OpportunityStatus } from '../types/crm.types';
import { getCrmCachedData, setCrmCachedData, invalidateCrmCache } from '../utils/cacheUtils';

// Clés de requête standardisées pour les opportunités
export const opportunitiesQueryKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunitiesQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...opportunitiesQueryKeys.lists(), { filters }] as const,
  details: () => [...opportunitiesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunitiesQueryKeys.details(), id] as const,
  stats: () => [...opportunitiesQueryKeys.all, 'stats'] as const,
  kanban: () => [...opportunitiesQueryKeys.all, 'kanban'] as const,
};

// Interface pour les paramètres de requête des opportunités
interface UseOpportunitiesParams {
  status?: OpportunityStatus[];
  search?: string;
  enabled?: boolean;
}

/**
 * Hook pour récupérer toutes les opportunités avec cache hybride
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
      // Vérifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log('= [OPPORTUNITIES API] Chargement depuis l\'API...');
      const result = await opportunitiesApi.getOpportunities(filters);
      
      // Mettre en cache le résultat
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
 * Hook pour récupérer les statistiques des opportunités avec cache
 */
export function useOpportunitiesStats(search: string = '') {
  const cacheKey = `opportunities_stats_${search}`;

  return useQuery({
    queryKey: opportunitiesQueryKeys.stats(),
    queryFn: async () => {
      // Vérifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Calculer les stats à partir des opportunités
      console.log('= [OPPORTUNITIES STATS] Calcul des statistiques...');
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
      
      // Mettre en cache le résultat
      setCrmCachedData(cacheKey, stats);
      
      return stats;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes pour les stats
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer les détails d'une opportunité
 */
export function useOpportunityDetail(id: string, enabled: boolean = true) {
  const cacheKey = `opportunity_detail_${id}`;

  return useQuery({
    queryKey: opportunitiesQueryKeys.detail(id),
    queryFn: async () => {
      // Vérifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log(`= [OPPORTUNITY DETAIL] Chargement détail ${id}...`);
      const result = await opportunitiesApi.getOpportunityDetail(id);
      
      // Mettre en cache le résultat
      setCrmCachedData(cacheKey, result);
      
      return result;
    },
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour les mutations d'opportunités avec invalidation de cache hybride
 */
export function useOpportunityMutations() {
  const queryClient = useQueryClient();

  const createOpportunity = useMutation({
    mutationFn: (data: Partial<Opportunity>) => opportunitiesApi.createOpportunity(data),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('création opportunité');
      
      // Invalider les requêtes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      
      console.log(' Opportunité créée avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('L Erreur lors de la création de l\'opportunité:', error);
    },
  });

  const updateOpportunity = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) => 
      opportunitiesApi.updateOpportunity(id, data),
    onSuccess: (_, variables) => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('mise à jour opportunité');
      
      // Invalider les requêtes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.detail(variables.id) });
      
      console.log(' Opportunité mise à jour avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('L Erreur lors de la mise à jour de l\'opportunité:', error);
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: (id: string) => opportunitiesApi.deleteOpportunity(id),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('suppression opportunité');
      
      // Invalider les requêtes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      
      console.log(' Opportunité supprimée avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('L Erreur lors de la suppression de l\'opportunité:', error);
    },
  });

  const changeOpportunityStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: OpportunityStatus; reason?: string }) => 
      opportunitiesApi.changeStatus(id, status, reason),
    onSuccess: (_, variables) => {
      // Invalider le cache sessionStorage
      invalidateCrmCache(`changement statut opportunité vers ${variables.status}`);
      
      // Invalider les requêtes React Query
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.detail(variables.id) });
      
      console.log(` Statut opportunité changé vers ${variables.status} - cache hybride invalidé`);
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
 * Hook combiné pour la page Opportunités
 */
export function useOpportunitiesPage() {
  const queryClient = useQueryClient();

  // Méthode pour forcer le rechargement de toutes les données
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: opportunitiesQueryKeys.all });
    invalidateCrmCache('refresh opportunités');
  };

  // Méthode pour précharger les détails d'une opportunité (optimisation UX)
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