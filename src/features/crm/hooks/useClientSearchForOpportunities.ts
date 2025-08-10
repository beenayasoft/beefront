/**
 * Hook pour la recherche de clients dans le contexte des opportunités
 * Adapté de useClientSearch des documents, mais utilise directement les types CRM
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/features/crm/api/crm';
import { TierData, CreateTierRequest, CreateTierData } from '@/features/crm/types/crm.types';
import { normalizeSearchTerm } from '@/lib/utils/searchUtils';

export interface ClientSearchItem {
  id: string;
  nom: string;
  type: string;
  relation: string;
  adresse?: {
    rue: string;
    ville: string;
    code_postal: string;
  };
}

export interface ClientSearchState {
  // Recherche
  query: string;
  results: ClientSearchItem[];
  isLoading: boolean;
  error: string | null;
  
  // Sélection
  selectedClient: ClientSearchItem | null;
  
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
  selectClient: (client: ClientSearchItem) => void;
  clearSelection: () => void;
  
  // UI
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  showCreate: () => void;
  hideCreate: () => void;
  
  // Création rapide
  createClient: (clientData: any) => Promise<ClientSearchItem>;
  
  // Cache
  invalidateCache: () => void;
}

interface UseClientSearchOptions {
  initialQuery?: string;
  initialClient?: ClientSearchItem | null;
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  autoFocus?: boolean;
  onClientSelect?: (client: ClientSearchItem) => void;
  onClientCreate?: (client: ClientSearchItem) => void;
}

export const useClientSearchForOpportunities = (
  options: UseClientSearchOptions = {}
): ClientSearchState & ClientSearchActions => {
  const {
    initialQuery = '',
    initialClient = null,
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 50,
    autoFocus = false,
    onClientSelect,
    onClientCreate
  } = options;
  
  const queryClient = useQueryClient();
  
  // États locaux
  const [query, setQueryState] = useState(initialQuery);
  const [selectedClient, setSelectedClient] = useState<ClientSearchItem | null>(initialClient);
  const [isOpen, setIsOpen] = useState(autoFocus);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Debounce de la recherche avec annulation intelligente
  useEffect(() => {
    // Si la query est vide, mettre à jour immédiatement
    if (query.length === 0) {
      setDebouncedQuery('');
      return;
    }
    
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
    queryKey: ['opportunity-clients', 'search', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!shouldSearch) return { results: [], count: 0 };
      
      console.log('🔍 Recherche clients pour opportunités:', { debouncedQuery, shouldSearch, maxResults });
      
      try {
        // Utiliser directement la méthode getClients qui fonctionne 
        const clients = await crmApi.tiers.getClients(debouncedQuery, {
          signal,
          page_size: maxResults
        });
        
        console.log('🌐 Réponse brute de getClients:', { clients: clients.slice(0, 3) });
        
        // Adapter le format de retour pour être compatible avec getTiers
        const response = {
          results: clients.map(client => ({
            id: client.id,
            nom: client.name,
            type: client.type,
            relation: client.relation,
            adresses: client.adressePrincipale ? [client.adressePrincipale] : []
          })),
          count: clients.length
        };
        
        console.log('📝 Résultats serveur CRM:', { response, count: response?.count });
        
        return response;
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
      // Pas de retry pour les erreurs réseau pour éviter les duplicatas
      if (error?.code === 'NETWORK_ERROR') return false;
      return failureCount < 2;
    },
    retryDelay: 1000, // 1 seconde entre les tentatives
    refetchOnWindowFocus: false, // Éviter les refetch automatiques
  });
  
  // Transformer les résultats du CRM en format compatible
  const results = useMemo(() => {
    if (!shouldSearch) return [];
    
    const serverResults = searchResults?.results || [];
    
    // Convertir TierData en ClientSearchItem
    const convertedResults: ClientSearchItem[] = serverResults.map((tier: TierData) => ({
      id: tier.id,
      nom: tier.nom,
      type: tier.type,
      relation: tier.relation,
      adresse: tier.adresses?.[0] ? {
        rue: tier.adresses[0].rue,
        ville: tier.adresses[0].ville,
        code_postal: tier.adresses[0].code_postal
      } : undefined
    }));
    
    // Limiter aux résultats demandés
    const limitedResults = convertedResults.slice(0, maxResults);
    
    console.log('🧠 Résultats convertis pour opportunités:', { 
      serverCount: serverResults.length, 
      finalCount: limitedResults.length 
    });
    
    return limitedResults;
  }, [searchResults, shouldSearch, maxResults]);
  
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
  const selectClient = useCallback((client: ClientSearchItem) => {
    console.log('🎯 Sélection client pour opportunité:', client);
    console.log('🔄 Changement d\'état:', {
      avant: { selectedClient, query },
      après: { selectedClient: client, query: client.nom }
    });
    setSelectedClient(client);
    setQueryState(client.nom);
    setIsOpen(false);
    onClientSelect?.(client);
  }, [onClientSelect, selectedClient, query]);
  
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
  const createClient = useCallback(async (clientData: any): Promise<ClientSearchItem> => {
    try {
      console.log('🚀 Création client pour opportunité:', clientData);
      
      // Utiliser l'API CRM directement
      const newTier = await crmApi.tiers.createTier(clientData);
      
      // Invalider le cache de recherche
      queryClient.invalidateQueries({ queryKey: ['opportunity-clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      // Convertir en ClientSearchItem
      const clientItem: ClientSearchItem = {
        id: newTier.id,
        nom: newTier.nom,
        type: newTier.type,
        relation: newTier.relation,
        adresse: newTier.adresses?.[0] ? {
          rue: newTier.adresses[0].rue,
          ville: newTier.adresses[0].ville,
          code_postal: newTier.adresses[0].code_postal
        } : undefined
      };
      
      // Sélectionner automatiquement le nouveau client
      selectClient(clientItem);
      hideCreate();
      onClientCreate?.(clientItem);
      
      return clientItem;
    } catch (error) {
      console.error('❌ Erreur lors de la création du client pour opportunité:', error);
      throw error;
    }
  }, [queryClient, selectClient, hideCreate, onClientCreate]);
  
  // Actions cache
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['opportunity-clients'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
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
    invalidateCache
  };
};

export type UseClientSearchForOpportunities = ReturnType<typeof useClientSearchForOpportunities>;