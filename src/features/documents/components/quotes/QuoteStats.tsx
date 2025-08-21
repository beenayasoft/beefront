/**
 * Composant d'affichage des statistiques des devis
 */
import React from 'react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { formatCurrency } from '@/lib/utils';

/**
 * Interface pour les props du composant QuoteStats
 */
interface QuoteStatsProps {
  // ✅ Statuts alignés avec le backend document-service
  stats: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    cancelled: number;
    totalAmount: number;
    pendingAmount: number;
    acceptedAmount: number;
    averageValue: number;
  };
}

/**
 * Composant d'affichage des statistiques des devis
 */
const QuoteStats: React.FC<QuoteStatsProps> = ({ stats }) => {
  const acceptanceRate = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total devis"
        value={stats.total.toString()}
        change={`${stats.draft} brouillons`}
        changeType="neutral"
        icon={<FileText className="h-5 w-5 text-Beenaya-600" />}
      />
      <MetricCard
        title="En attente"
        value={stats.sent.toString()}
        change={formatCurrency(stats.pendingAmount, 2, true)}
        changeType="neutral"
        icon={<AlertTriangle className="h-5 w-5 text-Beenaya-600" />}
      />
      <MetricCard
        title="Taux d'acceptation"
        value={`${acceptanceRate.toFixed(1)}%`}
        change={`${stats.accepted} acceptés sur ${stats.total}`}
        changeType="positive"
        icon={<Target className="h-5 w-5 text-Beenaya-600" />}
      />
      <MetricCard
        title="Valeur totale"
        value={formatCurrency(stats.totalAmount, 2, true)}
        change={`${stats.accepted} devis acceptés`}
        changeType="positive"
        icon={<DollarSign className="h-5 w-5 text-Beenaya-600" />}
      />
    </div>
  );
};

export { QuoteStats };
