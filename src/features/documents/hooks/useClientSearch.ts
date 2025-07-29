/**
 * Hook pour la recherche intelligente de clients avec création rapide
 * Optimisé avec debouncing et cache
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/features/crm/api/crm';
import { ClientOption } from '@/features/crm/types/crm.types';
import { normalizeSearchTerm, searchClients } from '@/lib/utils/searchUtils';

export interface ClientSearchState {
  // Recherche
  query: string;
  results: ClientOption[];
  isLoading: boolean;
  error: string | null;
  
  // Sélection
  selectedClient: ClientOption | null;
  
  // États UI
  isOpen: boolean;
  showCreateForm: boolean;
  
  // Métadonnées
  hasMore: boolean;
  totalCount: number;
}

export interface ClientSearchActions {
  // Recherche
  setQuery: (query: string) => void;
  search: (query: string) => void;
  clearSearch: () => void;
  
  // Sélection
  selectClient: (client: ClientOption) => void;
  clearSelection: () => void;
  
  // UI
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  showCreate: () => void;
  hideCreate: () => void;
  
  // Création rapide
  createClient: (clientData: any) => Promise<ClientOption>;
  
  // Cache
  invalidateCache: () => void;
  prefetchClient: (clientId: string) => void;
}

interface UseClientSearchOptions {
  initialQuery?: string;
  initialClient?: ClientOption | null;
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  autoFocus?: boolean;
  onClientSelect?: (client: ClientOption) => void;
  onClientCreate?: (client: ClientOption) => void;
}

export const useClientSearch = (options: UseClientSearchOptions = {}): ClientSearchState & ClientSearchActions => {
  const {
    initialQuery = '',
    initialClient = null,
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 20,
    autoFocus = false,
    onClientSelect,
    onClientCreate
  } = options;
  
  const queryClient = useQueryClient();
  
  // États locaux
  const [query, setQueryState] = useState(initialQuery);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(initialClient);
  const [isOpen, setIsOpen] = useState(autoFocus);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Debounce de la recherche
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    
    return () => clearTimeout(timeout);
  }, [query, debounceMs]);
  
  // Query pour la recherche de clients
  const shouldSearch = debouncedQuery.length >= minQueryLength;
  
  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients', 'search', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!shouldSearch) return { results: [], count: 0 };
      
      console.log('🔍 Recherche clients:', { debouncedQuery, shouldSearch, maxResults });
      
      try {
        // Normaliser la requête pour une recherche plus efficace côté serveur
        const normalizedQuery = normalizeSearchTerm(debouncedQuery);
        
        const response = await crmApi.tiers.getClients(normalizedQuery, { 
          signal,
          page_size: maxResults * 2 // Récupérer plus de résultats pour permettre le filtrage côté client
        });
        
        console.log('📝 Résultats serveur:', { response, count: response?.length });
        
        return {
          results: response || [],
          count: response?.length || 0
        };
      } catch (error) {
        // Gérer les erreurs d'annulation silencieusement
        if (error?.message === 'canceled' || signal?.aborted) {
          console.log('🔄 Recherche annulée - requête plus récente en cours');
          return { results: [], count: 0 };
        }
        
        // Propager les autres erreurs
        throw error;
      }
    },
    enabled: shouldSearch,
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Ne pas retry les requêtes annulées
      if (error?.message === 'canceled') return false;
      return failureCount < 2;
    }
  });
  
  // Résultats de recherche avec tri intelligent côté client
  const results = useMemo(() => {
    if (!shouldSearch) return [];
    
    const serverResults = searchResults?.results || [];
    
    // Appliquer la recherche intelligente côté client pour améliorer la pertinence
    const intelligentResults = searchClients(serverResults, debouncedQuery);
    
    // Limiter aux résultats demandés
    const limitedResults = intelligentResults.slice(0, maxResults);
    
    console.log('🧠 Résultats intelligents:', { 
      serverCount: serverResults.length, 
      intelligentCount: intelligentResults.length,
      finalCount: limitedResults.length 
    });
    
    return limitedResults;
  }, [searchResults, shouldSearch, debouncedQuery, maxResults]);
  
  const totalCount = searchResults?.count || 0;
  const hasMore = results.length < totalCount;
  
  // Actions de recherche
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    if (newQuery.length === 0) {
      setSelectedClient(null);
    }
  }, []);
  
  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
  }, [setQuery]);
  
  const clearSearch = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setSelectedClient(null);
    setIsOpen(false);
  }, []);
  
  // Actions de sélection
  const selectClient = useCallback((client: ClientOption) => {
    setSelectedClient(client);
    setQueryState(client.name);
    setIsOpen(false);
    onClientSelect?.(client);
  }, [onClientSelect]);
  
  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setQueryState('');
    onClientSelect?.(null);
  }, [onClientSelect]);
  
  // Actions UI
  const openDropdown = useCallback(() => setIsOpen(true), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);
  
  const showCreate = useCallback(() => {
    setShowCreateForm(true);
    setIsOpen(false);
  }, []);
  
  const hideCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);
  
  // Création rapide de client
  const createClient = useCallback(async (clientData: any): Promise<ClientOption> => {
    try {
      const newClient = await crmApi.tiers.createTier(clientData);
      
      // Invalider le cache de recherche
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      // Sélectionner automatiquement le nouveau client
      const clientOption: ClientOption = {
        id: newClient.id,
        name: newClient.nom,
        type: newClient.type,
        adressePrincipale: newClient.adresses?.[0] || null
      };
      
      selectClient(clientOption);
      hideCreate();
      onClientCreate?.(clientOption);
      
      return clientOption;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      throw error;
    }
  }, [queryClient, selectClient, hideCreate, onClientCreate]);
  
  // Actions cache
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  }, [queryClient]);
  
  const prefetchClient = useCallback((clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clients', clientId],
      queryFn: () => crmApi.tiers.getTierDetails(clientId),
      staleTime: 2 * 60 * 1000 // 2 minutes
    });
  }, [queryClient]);
  
  return {
    // État
    query,
    results,
    isLoading,
    error: error?.message || null,
    selectedClient,
    isOpen,
    showCreateForm,
    hasMore,
    totalCount,
    
    // Actions
    setQuery,
    search,
    clearSearch,
    selectClient,
    clearSelection,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    showCreate,
    hideCreate,
    createClient,
    invalidateCache,
    prefetchClient
  };
};

export type UseClientSearch = ReturnType<typeof useClientSearch>;