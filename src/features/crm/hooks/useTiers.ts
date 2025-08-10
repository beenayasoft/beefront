/**
 * Hook React Query pour la gestion des tiers
 * Remplace la gestion manuelle d'état et résout les problèmes de freeze
 * Intègre le cache sessionStorage pour performance optimale
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiersApi, TiersFilters, PaginatedTiersResponse, TiersGlobalStats } from '../api';
import { Tier } from '../types';
import { getCrmCachedData, setCrmCachedData, invalidateCrmCache, invalidateCrmCacheKey } from '../utils/cacheUtils';

// Clés de requête standardisées
export const tiersQueryKeys = {
  all: ['tiers'] as const,
  lists: () => [...tiersQueryKeys.all, 'list'] as const,
  list: (filters: TiersFilters, page: number, pageSize: number) => 
    [...tiersQueryKeys.lists(), { filters, page, pageSize }] as const,
  details: () => [...tiersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tiersQueryKeys.details(), id] as const,
  stats: () => [...tiersQueryKeys.all, 'stats'] as const,
  globalStats: (search: string) => [...tiersQueryKeys.stats(), { search }] as const,
};

// Interface pour les paramètres de requête
interface UseTiersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  enabled?: boolean;
}

/**
 * Hook pour récupérer la liste paginée des tiers avec cache hybride
 */
export function useTiers({
  page = 1,
  pageSize = 10,
  search = '',
  type = 'tous',
  enabled = true
}: UseTiersParams = {}) {
  const filters: TiersFilters = {
    search: search || undefined,
    type: type !== 'tous' ? [type] : undefined,
  };

  const cacheKey = `tiers_${JSON.stringify(filters)}_${page}_${pageSize}`;

  return useQuery({
    queryKey: tiersQueryKeys.list(filters, page, pageSize),
    queryFn: async () => {
      // Vérifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log('🔄 [TIERS API] Chargement depuis l\'API...');
      const result = await tiersApi.getTiers(page, pageSize, filters);
      
      // Mettre en cache le résultat
      setCrmCachedData(cacheKey, result);
      
      return result;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes pour microservices
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    // Optimisation pour les microservices avec latence
    retry: (failureCount, error: any) => {
      // Retry seulement sur erreurs réseau, pas sur 400/404
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer les statistiques globales avec cache
 */
export function useTiersStats(search: string = '') {
  const cacheKey = `tiers_stats_${search}`;

  return useQuery({
    queryKey: tiersQueryKeys.globalStats(search),
    queryFn: async () => {
      // Vérifier le cache sessionStorage d'abord
      const cachedData = getCrmCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Sinon, appeler l'API
      console.log('🔄 [TIERS STATS] Chargement depuis l\'API...');
      const result = await tiersApi.getStats(search);
      
      // Mettre en cache le résultat
      setCrmCachedData(cacheKey, result);
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // Stats moins volatiles
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer les détails d'un tier
 */
export function useTierDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: tiersQueryKeys.detail(id),
    queryFn: () => tiersApi.getTierDetail(id),
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour les mutations avec invalidation de cache hybride
 */
export function useTierMutations() {
  const queryClient = useQueryClient();

  const updateTier = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tiersApi.updateTier(id, data),
    onSuccess: (_, variables) => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('mise à jour tier');
      
      // Invalider et refetch les requêtes React Query
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.detail(variables.id) });
      
      console.log('✅ Tier mis à jour avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la mise à jour du tier:', error);
    },
  });

  const deleteTier = useMutation({
    mutationFn: (id: string) => tiersApi.deleteTier(id),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('suppression tier');
      
      // Invalider toutes les listes et stats après suppression
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.stats() });
      
      console.log('✅ Tier supprimé avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la suppression du tier:', error);
    },
  });

  const createTier = useMutation({
    mutationFn: (data: any) => tiersApi.createTier(data),
    onSuccess: () => {
      // Invalider le cache sessionStorage
      invalidateCrmCache('création tier');
      
      // Invalider les listes et stats après création
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tiersQueryKeys.stats() });
      
      console.log('✅ Tier créé avec succès - cache hybride invalidé');
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la création du tier:', error);
    },
  });

  return {
    updateTier,
    deleteTier,
    createTier,
  };
}

/**
 * Hook combiné pour la page Tiers
 * Simplifie l'usage et évite les re-renders
 */
export function useTiersPage() {
  const queryClient = useQueryClient();

  // Méthode pour forcer le rechargement de toutes les données
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: tiersQueryKeys.all });
  };

  // Méthode pour précharger les détails d'un tier (optimisation UX)
  const prefetchTierDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: tiersQueryKeys.detail(id),
      queryFn: () => tiersApi.getTierDetail(id),
      staleTime: 60 * 1000,
    });
  };

  return {
    refreshAll,
    prefetchTierDetail,
    mutations: useTierMutations(),
  };
}