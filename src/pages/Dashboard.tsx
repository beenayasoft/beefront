import { memo, lazy, Suspense, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/useDashboardData";

// Lazy load non-critical sections
const ChartSection = lazy(() => Promise.resolve({ default: ChartSectionComponent }));
const QuickActionsSection = lazy(() => Promise.resolve({ default: QuickActionsSectionComponent }));
const RecentActivitySection = lazy(() => Promise.resolve({ default: RecentActivitySectionComponent }));

// Optimized memoized metric card component
interface MetricCardProps {
  title: string;
  value: string;
  currency?: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  changeType: "positive" | "negative" | "neutral";
}

const MetricCard = memo(({
  title,
  value,
  currency,
  change,
  icon: Icon,
  changeType,
}: MetricCardProps) => {
  const changeColor = useMemo(() => {
    switch (changeType) {
      case "positive": return "text-green-600 dark:text-green-400";
      case "negative": return "text-red-600 dark:text-red-400";
      default: return "text-neutral-600 dark:text-neutral-400";
    }
  }, [changeType]);

  return (
    <div className="Beenaya-card">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {value}
            </span>
            {currency && (
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {currency}
              </span>
            )}
          </div>
          {change && (
            <p className={cn("text-sm font-medium", changeColor)}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-Beenaya-100 dark:bg-Beenaya-900/30 rounded-xl">
          <Icon className="w-6 h-6 text-Beenaya-900 dark:text-Beenaya-200" />
        </div>
      </div>
    </div>
  );
});

// Loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="Beenaya-card animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
      <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
    </div>
  </div>
));

// Chart Section Component
const ChartSectionComponent = memo(() => (
  <div className="Beenaya-card">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Chiffre d'affaires
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Évolution mensuelle
        </p>
      </div>
      <Button variant="outline" size="sm">
        Ce mois
      </Button>
    </div>

    <div className="space-y-4">
      <div className="text-3xl font-bold text-Beenaya-900 dark:text-Beenaya-200">
        0,00 MAD
      </div>

      {/* Simple chart placeholder */}
      <div className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <TrendingUp className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-500">Graphique à venir</p>
        </div>
      </div>
    </div>
  </div>
));

// Quick Actions Section Component
const QuickActionsSectionComponent = memo(() => (
  <div className="Beenaya-card">
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
      Actions rapides
    </h3>
    <div className="space-y-3">
      <Button className="w-full justify-start gap-3">
        <Plus className="w-4 h-4" />
        Nouveau devis
      </Button>
      <Button variant="outline" className="w-full justify-start gap-3">
        <Users className="w-4 h-4" />
        Ajouter client
      </Button>
      <Button variant="outline" className="w-full justify-start gap-3">
        <Building className="w-4 h-4" />
        Nouveau projet
      </Button>
    </div>
  </div>
));

// Recent Activity Section Component  
const RecentActivitySectionComponent = memo(() => (
  <div className="Beenaya-card">
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
      Activités récentes
    </h3>
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 text-center py-8">
        Aucune activité récente
      </p>
    </div>
  </div>
));

// Simple activity item
const ActivityItem = ({
  title,
  description,
  time,
  icon: Icon,
  status,
}: any) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
    <div className="p-2 bg-Beenaya-100 dark:bg-Beenaya-900/30 rounded-lg">
      <Icon className="w-4 h-4 text-Beenaya-900 dark:text-Beenaya-200" />
    </div>
    <div className="flex-1 space-y-1">
      <h4 className="font-medium text-neutral-900 dark:text-white">{title}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <p className="text-xs text-neutral-500">{time}</p>
    </div>
    <span
      className={cn(
        "Beenaya-badge text-xs",
        status === "success" && "Beenaya-badge-success",
        status === "warning" && "Beenaya-badge-warning",
        status === "primary" && "Beenaya-badge-primary",
      )}
    >
      {status === "success" && "Terminé"}
      {status === "warning" && "En cours"}
      {status === "primary" && "Nouveau"}
    </span>
  </div>
);

// Optimized Welcome Header Component
const WelcomeHeader = memo(({ displayName }: { displayName: string }) => (
  <div className="Beenaya-card Beenaya-gradient text-white">
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Bienvenue {displayName} 👋</h1>
        <p className="text-Beenaya-100 text-lg mt-2">
          Voici un aperçu de vos activités de construction
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <span className="text-sm">HT</span>
          <div className="w-10 h-5 bg-white/20 rounded-full relative">
            <div className="absolute right-0 top-0 w-5 h-5 bg-white rounded-full shadow-sm"></div>
          </div>
          <span className="text-sm font-medium">TTC</span>
        </div>
        <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <span className="text-sm">01/04/2025 - 12/06/2025</span>
        </div>
      </div>
    </div>
  </div>
));

export default function Dashboard() {
  const { displayName, metrics } = useDashboardData();

  // Map metrics with icons - memoized for performance
  const metricsWithIcons = useMemo(() => [
    { ...metrics[0], icon: DollarSign },
    { ...metrics[1], icon: Building },
    { ...metrics[2], icon: Users },
    { ...metrics[3], icon: FileText },
  ], [metrics]);

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader displayName={displayName} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsWithIcons.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            currency={metric.currency}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Two Column Layout with Lazy Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area - Lazy Loaded */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <ChartSection />
          </Suspense>
        </div>

        {/* Quick Actions - Lazy Loaded */}
        <div className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <QuickActionsSection />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentActivitySection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
