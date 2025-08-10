/**
 * Hook pour récupérer les statistiques de la sidebar de manière dynamique
 */
import { useState, useEffect } from 'react';
import { crmApi } from '@/features/crm/api';

export interface SidebarStats {
  opportunities?: number;
  tiers?: number;
  // Autres statistiques pourront être ajoutées ici plus tard
  agenda?: number;
  chantiers?: number;
  devis?: number;
  factures?: number;
  interventions?: number;
}

interface UseSidebarStatsResult {
  stats: SidebarStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSidebarStats(): UseSidebarStatsResult {
  const [stats, setStats] = useState<SidebarStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques en parallèle
      const [opportunityStatsResult, tiersStatsResult] = await Promise.allSettled([
        crmApi.opportunities.getOpportunityStats(),
        crmApi.tiers.getStats()
      ]);

      const newStats: SidebarStats = {};

      // Traiter les résultats des opportunités
      if (opportunityStatsResult.status === 'fulfilled') {
        const opportunityData = opportunityStatsResult.value;
        console.log('📊 Statistiques opportunités récupérées:', opportunityData);
        
        // Adapter selon la structure de réponse de votre API
        if (typeof opportunityData.total === 'number') {
          newStats.opportunities = opportunityData.total;
        } else if (typeof opportunityData.count === 'number') {
          newStats.opportunities = opportunityData.count;
        } else if (Array.isArray(opportunityData)) {
          newStats.opportunities = opportunityData.length;
        }
      } else {
        console.warn('⚠️ Erreur récupération stats opportunités:', opportunityStatsResult.reason);
      }

      // Traiter les résultats des tiers
      if (tiersStatsResult.status === 'fulfilled') {
        const tiersData = tiersStatsResult.value;
        console.log('📊 Statistiques tiers récupérées:', tiersData);
        
        // Adapter selon la structure de réponse de votre API
        if (typeof tiersData.total === 'number') {
          newStats.tiers = tiersData.total;
        } else if (typeof tiersData.count === 'number') {
          newStats.tiers = tiersData.count;
        } else if (Array.isArray(tiersData)) {
          newStats.tiers = tiersData.length;
        }
      } else {
        console.warn('⚠️ Erreur récupération stats tiers:', tiersStatsResult.reason);
      }

      setStats(newStats);
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des statistiques sidebar:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch
  };
}