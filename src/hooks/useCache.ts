import { useState, useEffect, useCallback, useRef } from 'react';
import { CacheService, CacheStats } from '@/lib/services/CacheService';

/**
 * Hook pour la gestion du cache avec stratégies configurables
 */
export interface UseCacheOptions {
  ttl?: number; // Durée de vie en millisecondes
  strategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  invalidateOn?: string[]; // Patterns pour invalider le cache
  prefetch?: boolean; // Précharger les données
  background?: boolean; // Rafraîchir en arrière-plan
}

export interface CacheHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isFromCache: boolean;
  cacheKey: string;
  invalidate: () => void;
  refresh: () => Promise<void>;
  setCacheStrategy: (strategy: UseCacheOptions['strategy']) => void;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): CacheHookResult<T> {
  const {
    ttl = 30000,
    strategy = 'cache-first',
    invalidateOn = [],
    prefetch = false,
    background = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(strategy);

  const cacheKey = CacheService.generateCacheKey(key);
  const fetcherRef = useRef(fetcher);
  const backgroundTimerRef = useRef<NodeJS.Timeout>();

  fetcherRef.current = fetcher;

  // Fonction pour récupérer les données depuis le réseau
  const fetchFromNetwork = useCallback(async (): Promise<T> => {
    const result = await fetcherRef.current();
    CacheService.set(cacheKey, result, ttl, 'memory');
    return result;
  }, [cacheKey, ttl]);

  // Fonction pour récupérer les données depuis le cache
  const fetchFromCache = useCallback((): T | null => {
    return CacheService.get<T>(cacheKey);
  }, [cacheKey]);

  // Fonction principale de chargement des données
  const loadData = useCallback(async (forceNetwork = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: T | null = null;
      let fromCache = false;

      switch (currentStrategy) {
        case 'cache-first':
          if (!forceNetwork) {
            result = fetchFromCache();
            fromCache = !!result;
          }
          if (!result) {
            result = await fetchFromNetwork();
            fromCache = false;
          }
          break;

        case 'network-first':
          try {
            result = await fetchFromNetwork();
            fromCache = false;
          } catch (networkError) {
            result = fetchFromCache();
            fromCache = !!result;
            if (!result) throw networkError;
          }
          break;

        case 'cache-only':
          result = fetchFromCache();
          fromCache = !!result;
          if (!result) {
            throw new Error('Aucune donnée en cache');
          }
          break;

        case 'network-only':
          result = await fetchFromNetwork();
          fromCache = false;
          break;
      }

      setData(result);
      setIsFromCache(fromCache);

      // Planifier un rafraîchissement en arrière-plan si activé
      if (background && fromCache) {
        backgroundTimerRef.current = setTimeout(async () => {
          try {
            const freshData = await fetchFromNetwork();
            setData(freshData);
            setIsFromCache(false);
          } catch (error) {
            console.warn('Erreur lors du rafraîchissement en arrière-plan:', error);
          }
        }, 1000); // Délai de 1 seconde
      }

    } catch (err) {
      setError(err as Error);
      setData(null);
      setIsFromCache(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentStrategy, fetchFromCache, fetchFromNetwork, background]);

  // Fonction pour invalider le cache
  const invalidate = useCallback(() => {
    CacheService.invalidate(cacheKey);
    setIsFromCache(false);
  }, [cacheKey]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Fonction pour changer la stratégie de cache
  const setCacheStrategy = useCallback((newStrategy: UseCacheOptions['strategy']) => {
    setCurrentStrategy(newStrategy || 'cache-first');
  }, []);

  // Effet pour charger les données au montage
  useEffect(() => {
    if (prefetch) {
      loadData();
    }
  }, [loadData, prefetch]);

  // Effet pour invalider le cache selon les patterns
  useEffect(() => {
    if (invalidateOn.length === 0) return;

    const handleInvalidation = () => {
      invalidateOn.forEach(pattern => {
        if (cacheKey.includes(pattern)) {
          invalidate();
        }
      });
    };

    // Écouter les événements d'invalidation (peut être étendu)
    window.addEventListener('cache-invalidate', handleInvalidation);
    
    return () => {
      window.removeEventListener('cache-invalidate', handleInvalidation);
    };
  }, [invalidateOn, cacheKey, invalidate]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    cacheKey,
    invalidate,
    refresh,
    setCacheStrategy,
  };
}

/**
 * Hook pour obtenir les statistiques du cache
 */
export function useCacheStats(): {
  stats: CacheStats;
  refresh: () => void;
  clear: () => void;
} {
  const [stats, setStats] = useState<CacheStats>(() => CacheService.getStats());

  const refresh = useCallback(() => {
    setStats(CacheService.getStats());
  }, []);

  const clear = useCallback(() => {
    CacheService.clear();
    refresh();
  }, [refresh]);

  // Rafraîchir automatiquement les stats toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    stats,
    refresh,
    clear,
  };
}

/**
 * Hook pour la gestion du cache avec mutation
 */
export function useCacheWithMutation<T, TMutationData>(
  key: string,
  fetcher: () => Promise<T>,
  mutator: (data: TMutationData) => Promise<T>,
  options: UseCacheOptions = {}
) {
  const cacheResult = useCache(key, fetcher, options);
  const [isMutating, setIsMutating] = useState(false);

  const mutate = useCallback(async (mutationData: TMutationData) => {
    setIsMutating(true);
    try {
      const result = await mutator(mutationData);
      
      // Mettre à jour le cache avec le nouveau résultat
      const cacheKey = CacheService.generateCacheKey(key);
      CacheService.set(cacheKey, result, options.ttl, 'memory');
      
      // Mettre à jour l'état local
      cacheResult.refresh();
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [mutator, key, options.ttl, cacheResult]);

  return {
    ...cacheResult,
    mutate,
    isMutating,
  };
}