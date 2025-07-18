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
import { OpportunityStats as OpportunityStatsType } from "@/lib/types/opportunity";

interface OpportunityStatsProps {
  stats: OpportunityStatsType;
}

export function OpportunityStats({ stats }: OpportunityStatsProps) {
  // Log pour débogage
  console.log('📊 OpportunityStats - Données reçues:', stats);
  
  // Protection contre les données manquantes
  if (!stats || !stats.byStage) {
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

  // Calcul des opportunités en cours
  const inProgressCount = (
    (stats.byStage.new || 0) + 
    (stats.byStage.needs_analysis || 0) + 
    (stats.byStage.negotiation || 0)
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <MetricCard
        title="Total opportunités"
        value={stats.total.toString()}
        change={`${stats.byStage.new || 0} nouvelles`}
        changeType="neutral"
        icon={FileText}
        trend="stable"
      />
      <MetricCard
        title="En cours"
        value={inProgressCount.toString()}
        change={formatCurrency(stats.weightedAmount) + " MAD"}
        changeType="neutral"
        icon={Clock}
        trend="stable"
      />
      <MetricCard
        title="Gagnées"
        value={(stats.byStage.won || 0).toString()}
        change={formatCurrency(stats.wonAmount) + " MAD"}
        changeType="positive"
        icon={CheckCircle}
        trend="up"
      />
      <MetricCard
        title="Taux de conversion"
        value={(stats.conversionRate || 0).toFixed(1) + "%"}
        change={`${stats.byStage.lost || 0} perdues`}
        changeType={stats.conversionRate > 50 ? "positive" : "negative"}
        icon={TrendingUp}
        trend={stats.conversionRate > 50 ? "up" : "down"}
      />
    </div>
  );
}