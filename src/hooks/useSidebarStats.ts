/**
 * Hook pour récupérer les statistiques de la sidebar de manière dynamique
 */
import { useState, useEffect } from 'react';
import { crmApi } from '@/features/crm/api';
import { quotesApi } from '@/features/documents/api/quotes';
import { invoicesApi } from '@/features/documents/api/invoices';

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

      console.log('🔄 Début récupération stats sidebar');

      // Récupérer les statistiques en parallèle
      const [opportunityStatsResult, tiersStatsResult, quotesStatsResult, invoicesStatsResult] = await Promise.allSettled([
        crmApi.opportunities.getOpportunityStats(),
        crmApi.tiers.getStats(),
        quotesApi.getStats(),
        invoicesApi.getInvoiceStats()
      ]);

      console.log('📊 Résultats stats sidebar:', {
        opportunities: opportunityStatsResult,
        tiers: tiersStatsResult,
        quotes: quotesStatsResult,
        invoices: invoicesStatsResult
      });

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

      // Traiter les résultats des devis
      if (quotesStatsResult.status === 'fulfilled') {
        const quotesData = quotesStatsResult.value;
        console.log('📊 Statistiques devis récupérées:', quotesData);
        
        // Adapter selon la structure de réponse de l'API devis
        if (typeof quotesData.total_count === 'number') {
          newStats.devis = quotesData.total_count;
        } else if (typeof quotesData.total === 'number') {
          newStats.devis = quotesData.total;
        } else if (typeof quotesData.count === 'number') {
          newStats.devis = quotesData.count;
        } else if (Array.isArray(quotesData)) {
          newStats.devis = quotesData.length;
        }
      } else {
        console.warn('⚠️ Erreur récupération stats devis:', quotesStatsResult.reason);
      }

      // Traiter les résultats des factures
      if (invoicesStatsResult.status === 'fulfilled') {
        const invoicesData = invoicesStatsResult.value;
        console.log('📊 Statistiques factures récupérées:', invoicesData);
        
        // Adapter selon la structure de réponse de l'API factures
        if (typeof invoicesData.total_count === 'number') {
          newStats.factures = invoicesData.total_count;
        } else if (typeof invoicesData.total === 'number') {
          newStats.factures = invoicesData.total;
        } else if (typeof invoicesData.count === 'number') {
          newStats.factures = invoicesData.count;
        } else if (Array.isArray(invoicesData)) {
          newStats.factures = invoicesData.length;
        }
      } else {
        console.warn('⚠️ Erreur récupération stats factures:', invoicesStatsResult.reason);
      }

      console.log('✅ Stats finales sidebar:', newStats);
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