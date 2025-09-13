import { useMemo } from 'react';
import { useAuth } from './useAuth';

export interface DashboardMetric {
  title: string;
  value: string;
  currency?: string;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

// Simulated API calls with caching
const getCachedData = (key: string, fallback: any) => {
  const cached = sessionStorage.getItem(`dashboard_${key}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const setCachedData = (key: string, data: any) => {
  try {
    sessionStorage.setItem(`dashboard_${key}`, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
};

export const useDashboardData = () => {
  const { user } = useAuth();

  // Memoize user display name
  const displayName = useMemo(() => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || user?.email?.split('@')[0] || "Utilisateur";
  }, [user]);

  // Memoize metrics with caching
  const metrics = useMemo(() => {
    const cachedMetrics = getCachedData('metrics', null);
    
    if (cachedMetrics) {
      return cachedMetrics;
    }

    // Simulate API call result
    const freshMetrics = [
      {
        title: "Chiffre d'affaires",
        value: 0,
        currency: true,
        change: "+0% ce mois",
        changeType: "neutral" as const,
      },
      {
        title: "Projets actifs",
        value: "0",
        change: "Aucun projet",
        changeType: "neutral" as const,
      },
      {
        title: "Clients",
        value: "0", 
        change: "Aucun client",
        changeType: "neutral" as const,
      },
      {
        title: "Devis en attente",
        value: "12",
        change: "+3 cette semaine",
        changeType: "positive" as const,
      },
    ];

    setCachedData('metrics', freshMetrics);
    return freshMetrics;
  }, []); // Empty deps - only calculate once

  return {
    displayName,
    metrics,
    isLoading: false, // Could be extended for real API calls
  };
};