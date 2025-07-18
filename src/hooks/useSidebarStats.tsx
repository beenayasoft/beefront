import { useState, useEffect, useCallback } from 'react';
import { sidebarStatsService } from '@/lib/services/sidebarStatsService';

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

interface UseSidebarStatsReturn {
  stats: SidebarStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSidebarStats(): UseSidebarStatsReturn {
  const [stats, setStats] = useState<SidebarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newStats = await sidebarStatsService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des stats sidebar:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Fallback avec des stats par défaut
      setStats({
        devis: { total: 0, draft: 0, pending: 0 },
        opportunities: { total: 0, new: 0, inProgress: 0 },
        factures: { total: 0, pending: 0, overdue: 0 },
        lastUpdated: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await sidebarStatsService.refresh();
    await loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
} 