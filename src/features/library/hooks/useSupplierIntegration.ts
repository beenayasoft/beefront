/**
 * React Hook pour l'intégration Library ↔ CRM Suppliers
 * Gestion d'état et logique métier pour les fournisseurs
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CRMSupplierDetails,
  CRMSupplierSummary,
  SupplierIntegrationState,
  SupplierIntegrationActions,
  SUPPLIER_QUERY_KEYS,
  SUPPLIER_DEFAULTS
} from '../types/supplier-contracts';
import { suppliersApi, supplierUtils } from '../api/suppliers';

/**
 * Hook principal pour l'intégration des fournisseurs
 */
export function useSupplierIntegration() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<CRMSupplierDetails | null>(null);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => supplierUtils.createDebouncedSearch(suppliersApi.searchSuppliers.bind(suppliersApi)),
    []
  );

  // Query pour la recherche de fournisseurs
  const {
    data: suppliers = [],
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.search(searchQuery),
    queryFn: () => debouncedSearch(searchQuery),
    enabled: searchQuery.length >= SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH,
    staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.SEARCH,
    cacheTime: SUPPLIER_DEFAULTS.CACHE_TTL.SEARCH * 2,
    retry: 2,
    retryDelay: 1000,
  });

  // Query pour les statistiques des fournisseurs - DÉSACTIVÉE temporairement à cause du timeout
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.stats(),
    queryFn: suppliersApi.getSupplierStats.bind(suppliersApi),
    enabled: false, // Désactiver temporairement
    staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.STATS,
    cacheTime: SUPPLIER_DEFAULTS.CACHE_TTL.STATS * 2,
    retry: 1,
    retryDelay: 2000,
  });

  // Mutation pour récupérer les détails d'un fournisseur via l'API CRM
  const getSupplierDetailsMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      const { getSupplierDetailsFromCRM } = await import('../utils/supplierTransformers');
      return getSupplierDetailsFromCRM(supplierId);
    },
    onSuccess: (data) => {
      if (data) {
        // Mettre en cache les détails
        queryClient.setQueryData(
          SUPPLIER_QUERY_KEYS.details(data.id),
          data
        );
      }
    },
  });

  // Actions
  const actions: SupplierIntegrationActions = {
    searchSuppliers: useCallback(async (query: string) => {
      setSearchQuery(query.trim());
      if (query.length >= SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH) {
        await refetchSearch();
      }
    }, [refetchSearch]),

    getSupplierDetails: useCallback(async (supplierId: string) => {
      // Vérifier d'abord le cache
      const cached = queryClient.getQueryData<CRMSupplierDetails>(
        SUPPLIER_QUERY_KEYS.details(supplierId)
      );
      
      if (cached) {
        return cached;
      }

      // Sinon, fetch depuis l'API
      try {
        const details = await getSupplierDetailsMutation.mutateAsync(supplierId);
        return details;
      } catch (error) {
        console.error('Failed to get supplier details:', error);
        return null;
      }
    }, [queryClient, getSupplierDetailsMutation]),

    clearSearch: useCallback(() => {
      setSearchQuery('');
      setSelectedSupplier(null);
    }, []),

    setSelectedSupplier: useCallback((supplier: CRMSupplierDetails | null) => {
      setSelectedSupplier(supplier);
    }, []),
  };

  // État consolidé
  const state: SupplierIntegrationState = {
    suppliers: suppliers || [],
    loading: searchLoading || statsLoading || getSupplierDetailsMutation.isLoading,
    error: searchError?.message || statsError?.message || getSupplierDetailsMutation.error?.message || null,
    searchQuery,
    selectedSupplier,
  };

  return {
    ...state,
    ...actions,
    stats,
    // Fonctions utilitaires exposées
    formatSupplierForSelect: supplierUtils.formatSupplierForSelect,
    sortSuppliersByRelevance: (suppliers: CRMSupplierSummary[]) => 
      supplierUtils.sortSuppliersByRelevance(suppliers, searchQuery),
  };
}

/**
 * Hook pour récupérer les détails d'un fournisseur spécifique via l'API CRM
 */
export function useSupplierDetails(supplierId: string | null | undefined) {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.details(supplierId || ''),
    queryFn: async () => {
      if (!supplierId) return null;
      
      const { getSupplierDetailsFromCRM } = await import('../utils/supplierTransformers');
      return getSupplierDetailsFromCRM(supplierId);
    },
    enabled: !!supplierId,
    staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.DETAILS,
    cacheTime: SUPPLIER_DEFAULTS.CACHE_TTL.DETAILS * 2,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook pour la validation d'existence d'un fournisseur
 */
export function useSupplierValidation() {
  return useMutation({
    mutationFn: suppliersApi.validateSupplierExists.bind(suppliersApi),
    retry: 1,
  });
}

/**
 * Hook pour les statistiques des fournisseurs uniquement
 */
export function useSupplierStats() {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.stats(),
    queryFn: suppliersApi.getSupplierStats.bind(suppliersApi),
    staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.STATS,
    cacheTime: SUPPLIER_DEFAULTS.CACHE_TTL.STATS * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour précharger les données fournisseurs (à utiliser dans les layouts)
 */
export function usePrefetchSupplierData() {
  const queryClient = useQueryClient();

  const prefetchStats = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: SUPPLIER_QUERY_KEYS.stats(),
      queryFn: suppliersApi.getSupplierStats.bind(suppliersApi),
      staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.STATS,
    });
  }, [queryClient]);

  const prefetchSupplierDetails = useCallback((supplierId: string) => {
    queryClient.prefetchQuery({
      queryKey: SUPPLIER_QUERY_KEYS.details(supplierId),
      queryFn: () => suppliersApi.getSupplierDetails(supplierId),
      staleTime: SUPPLIER_DEFAULTS.CACHE_TTL.DETAILS,
    });
  }, [queryClient]);

  return {
    prefetchStats,
    prefetchSupplierDetails,
  };
}