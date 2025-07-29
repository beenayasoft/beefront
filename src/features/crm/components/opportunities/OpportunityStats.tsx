import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency } from "@/lib/utils";
import { OpportunityStats as OpportunityStatsType } from "../../types/opportunity";

interface OpportunityStatsProps {
  stats: OpportunityStatsType;
}

export function OpportunityStats({ stats }: OpportunityStatsProps) {
  // Log pour débogage
  console.log('📊 OpportunityStats - Données reçues:', stats);
  
  // Protection contre les données manquantes
  if (!stats || (!stats.byStage && !stats.stage_stats)) {
    console.warn('⚠️ OpportunityStats - Données manquantes ou invalides:', stats);
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <MetricCard
            key={i}
            title="Chargement..."
            value="--"
            change="--"
            changeType="neutral"
            icon={FileText}
            trend="stable"
          />
        ))}
      </div>
    );
  }

  // Adapter les données du nouveau format backend vers le format frontend
  const adaptedStats = stats?.total_stats ? {
    total: stats.total_stats.count || 0,
    totalAmount: parseFloat(stats.total_stats.total_amount || '0'),
    weightedAmount: parseFloat(stats.weighted_pipeline?.weighted_total || '0'),
    wonAmount: 0, // À calculer depuis stage_stats
    byStage: {}
  } : stats;

  // Créer byStage depuis stage_stats si nécessaire
  if (stats?.stage_stats) {
    stats.stage_stats.forEach((stage: any) => {
      adaptedStats.byStage[stage.stage] = stage.count;
      if (stage.stage === 'won') {
        adaptedStats.wonAmount = parseFloat(stage.total_amount || '0');
      }
    });
  }

  // Calcul des opportunités en cours
  const inProgressCount = (
    (adaptedStats?.byStage?.new || 0) + 
    (adaptedStats?.byStage?.needs_analysis || 0) + 
    (adaptedStats?.byStage?.negotiation || 0)
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <MetricCard
        title="Total opportunités"
        value={adaptedStats.total?.toString() || '0'}
        change={`${adaptedStats.byStage?.new || 0} nouvelles`}
        changeType="neutral"
        icon={FileText}
        trend="stable"
      />
      <MetricCard
        title="En cours"
        value={inProgressCount.toString()}
        change={formatCurrency(adaptedStats.weightedAmount || 0) + " MAD"}
        changeType="neutral"
        icon={Clock}
        trend="stable"
      />
      <MetricCard
        title="Gagnées"
        value={(adaptedStats.byStage?.won || 0).toString()}
        change={formatCurrency(adaptedStats.wonAmount || 0) + " MAD"}
        changeType="positive"
        icon={CheckCircle}
        trend="up"
      />
      <MetricCard
        title="Taux de conversion"
        value={(adaptedStats.conversionRate || 0).toFixed(1) + "%"}
        change={`${adaptedStats.byStage?.lost || 0} perdues`}
        changeType={(adaptedStats.conversionRate || 0) > 50 ? "positive" : "negative"}
        icon={TrendingUp}
        trend={(adaptedStats.conversionRate || 0) > 50 ? "up" : "down"}
      />
    </div>
  );
}