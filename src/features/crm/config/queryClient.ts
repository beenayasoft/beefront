/**
 * Configuration du QueryClient pour le module CRM
 * Optimisé pour les besoins spécifiques du CRM (cache, retry, etc.)
 */
import { QueryClient } from '@tanstack/react-query';

export const crmQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache plus long pour les données CRM (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache même si le composant est démonté
      gcTime: 10 * 60 * 1000,
      // Retry sur erreur réseau
      retry: 2,
      // Pas de refetch automatique à la focale
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry les mutations échouées une fois
      retry: 1,
    },
  },
});