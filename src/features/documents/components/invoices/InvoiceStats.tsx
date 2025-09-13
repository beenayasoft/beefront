import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InvoiceStatsProps {
  stats?: {
    total?: number;
    draft?: number;
    sent?: number;
    overdue?: number;
    partially_paid?: number;
    paid?: number;
    cancelled?: number;
    totalAmount?: number;
    overdueAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
  };
}

export function InvoiceStats({ stats }: InvoiceStatsProps) {
  const { formatCurrency } = useCurrency();
  
  // Valeurs par défaut sécurisées pour éviter les erreurs undefined
  const safeStats = {
    total: stats?.total ?? 0,
    draft: stats?.draft ?? 0,
    sent: stats?.sent ?? 0,
    overdue: stats?.overdue ?? 0,
    partially_paid: stats?.partially_paid ?? 0,
    paid: stats?.paid ?? 0,
    cancelled: stats?.cancelled ?? 0,
    totalAmount: stats?.totalAmount ?? 0,
    overdueAmount: stats?.overdueAmount ?? 0,
    paidAmount: stats?.paidAmount ?? 0,
    remainingAmount: stats?.remainingAmount ?? 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total factures"
        value={safeStats.total.toString()}
        change={`${safeStats.draft} brouillons`}
        changeType="neutral"
        icon={<FileText className="h-5 w-5 text-Beenaya-600" />}
      />
      <MetricCard
        title="En attente"
        value={safeStats.sent.toString()}
        change={formatCurrency(Math.max(0, safeStats.remainingAmount - safeStats.overdueAmount))}
        changeType="neutral"
        icon={<Clock className="h-5 w-5 text-Beenaya-600" />}
      />
      <MetricCard
        title="En retard"
        value={safeStats.overdue.toString()}
        change={formatCurrency(safeStats.overdueAmount)}
        changeType="negative"
        icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
      />
      <MetricCard
        title="Montant encaissé"
        value={formatCurrency(safeStats.paidAmount)}
        change={`${safeStats.paid} factures payées`}
        changeType="positive"
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
      />
    </div>
  );
}