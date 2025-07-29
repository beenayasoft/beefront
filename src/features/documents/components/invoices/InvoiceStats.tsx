import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency } from "@/lib/utils";

interface InvoiceStatsProps {
  stats: {
    total: number;
    draft: number;
    sent: number;
    overdue: number;
    partially_paid: number;
    paid: number;
    cancelled: number;
    totalAmount: number;
    overdueAmount: number;
    paidAmount: number;
    remainingAmount: number;
  };
}

export function InvoiceStats({ stats }: InvoiceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total factures"
        value={stats.total.toString()}
        change={`${stats.draft} brouillons`}
        changeType="neutral"
        icon={FileText}
        trend="stable"
      />
      <MetricCard
        title="En attente"
        value={stats.sent.toString()}
        change={formatCurrency(stats.remainingAmount - stats.overdueAmount) + " MAD"}
        changeType="neutral"
        icon={Clock}
        trend="stable"
      />
      <MetricCard
        title="En retard"
        value={stats.overdue.toString()}
        change={formatCurrency(stats.overdueAmount) + " MAD"}
        changeType="negative"
        icon={AlertTriangle}
        trend="up"
      />
      <MetricCard
        title="Montant encaissé"
        value={formatCurrency(stats.paidAmount)}
        currency="MAD"
        change={`${stats.paid} factures payées`}
        changeType="positive"
        icon={DollarSign}
        trend="up"
      />
    </div>
  );
}