import { opportunitiesApi } from '@/lib/api/opportunities';
import { quotesApi } from '@/lib/api/quotes';

// Interface pour les statistiques de la sidebar
interface SidebarStats {
  devis: {
    total: number;
    draft: number;
    pending: number;
  };
  opportunities: {
    total: number;
    new: number;
    inProgress: number;
  };
  factures: {
    total: number;
    pending: number;
    overdue: number;
  };
  lastUpdated: Date;
}

// Cache simple pour éviter trop d'appels API
interface CacheEntry {
  data: SidebarStats;
  timestamp: number;
}

class SidebarStatsService {
  private cache: CacheEntry | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private isExpired(): boolean {
    if (!this.cache) return true;
    return Date.now() - this.cache.timestamp > this.cacheTimeout;
  }

  async getStats(): Promise<SidebarStats> {
    // Retourner le cache si valide
    if (this.cache && !this.isExpired()) {
      console.log('📦 Cache hit pour les stats sidebar');
      return this.cache.data;
    }

    try {
      console.log('🔍 Récupération des stats sidebar depuis les APIs...');

      // Récupérer les statistiques en parallèle
      const [opportunityStats, quotesData] = await Promise.allSettled([
        this.getOpportunityStats(),
        this.getQuotesStats(),
      ]);

      // Construire les stats avec fallback en cas d'erreur
      const stats: SidebarStats = {
        devis: quotesData.status === 'fulfilled' ? quotesData.value : { total: 0, draft: 0, pending: 0 },
        opportunities: opportunityStats.status === 'fulfilled' ? opportunityStats.value : { total: 0, new: 0, inProgress: 0 },
        factures: { total: 0, pending: 0, overdue: 0 }, // TODO: À implémenter quand l'API factures sera prête
        lastUpdated: new Date(),
      };

      // Mettre en cache
      this.cache = {
        data: stats,
        timestamp: Date.now(),
      };

      console.log('✅ Stats sidebar récupérées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats sidebar:', error);
      
      // Retourner des stats par défaut en cas d'erreur
      const fallbackStats: SidebarStats = {
        devis: { total: 0, draft: 0, pending: 0 },
        opportunities: { total: 0, new: 0, inProgress: 0 },
        factures: { total: 0, pending: 0, overdue: 0 },
        lastUpdated: new Date(),
      };

      return fallbackStats;
    }
  }

  private async getOpportunityStats(): Promise<{ total: number; new: number; inProgress: number }> {
    try {
      const stats = await opportunitiesApi.getOpportunityStats();
      
      // Calculer les opportunités en cours
      const inProgress = (stats.by_stage?.needs_analysis?.count || 0) + 
                       (stats.by_stage?.negotiation?.count || 0);

      return {
        total: stats.total || 0,
        new: stats.by_stage?.new?.count || 0,
        inProgress: inProgress,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats opportunités:', error);
      throw error;
    }
  }

  private async getQuotesStats(): Promise<{ total: number; draft: number; pending: number }> {
    try {
      // Récupérer les stats des devis
      const quotes = await quotesApi.getStats();
      
      return {
        total: quotes.total || 0,
        draft: quotes.draft || 0,
        pending: quotes.sent || 0, // Les devis envoyés sont en attente de réponse
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats devis:', error);
      throw error;
    }
  }

  // Invalider le cache (utile après des actions de modification)
  invalidateCache(): void {
    this.cache = null;
    console.log('🗑️ Cache sidebar invalidé');
  }

  // Forcer le rechargement des stats
  async refresh(): Promise<SidebarStats> {
    this.invalidateCache();
    return this.getStats();
  }
}

// Instance singleton
export const sidebarStatsService = new SidebarStatsService(); 