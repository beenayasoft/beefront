import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  FileText,
  Clock,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simple metric card component
const MetricCard = ({
  title,
  value,
  currency,
  change,
  icon: Icon,
  changeType,
}: any) => (
  <div className="benaya-card">
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
          <p
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-green-600 dark:text-green-400",
              changeType === "negative" && "text-red-600 dark:text-red-400",
              changeType === "neutral" &&
                "text-neutral-600 dark:text-neutral-400",
            )}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-benaya-100 dark:bg-benaya-900/30 rounded-xl">
        <Icon className="w-6 h-6 text-benaya-900 dark:text-benaya-200" />
      </div>
    </div>
  </div>
);

// Simple activity item
const ActivityItem = ({
  title,
  description,
  time,
  icon: Icon,
  status,
}: any) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
    <div className="p-2 bg-benaya-100 dark:bg-benaya-900/30 rounded-lg">
      <Icon className="w-4 h-4 text-benaya-900 dark:text-benaya-200" />
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
        "benaya-badge text-xs",
        status === "success" && "benaya-badge-success",
        status === "warning" && "benaya-badge-warning",
        status === "primary" && "benaya-badge-primary",
      )}
    >
      {status === "success" && "Terminé"}
      {status === "warning" && "En cours"}
      {status === "primary" && "Nouveau"}
    </span>
  </div>
);

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Bienvenue Jean 👋</h1>
            <p className="text-benaya-100 text-lg mt-2">
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Chiffre d'affaires"
          value="0,00"
          currency="MAD"
          change="+0% ce mois"
          changeType="neutral"
          icon={DollarSign}
        />
        <MetricCard
          title="Projets actifs"
          value="0"
          change="Aucun projet"
          changeType="neutral"
          icon={Building}
        />
        <MetricCard
          title="Clients"
          value="0"
          change="Aucun client"
          changeType="neutral"
          icon={Users}
        />
        <MetricCard
          title="Devis en attente"
          value="12"
          change="+3 cette semaine"
          changeType="positive"
          icon={FileText}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <div className="benaya-card">
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
              <div className="text-3xl font-bold text-benaya-900 dark:text-benaya-200">
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
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="benaya-card">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <Button className="w-full justify-start gap-3 benaya-button-primary">
                <Plus className="w-4 h-4" />
                Nouveau devis
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Users className="w-4 h-4" />
                Ajouter client
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Building className="w-4 h-4" />
                Nouveau chantier
              </Button>
            </div>
          </div>

          {/* Tasks Widget */}
          <div className="benaya-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Tâches
              </h3>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Aucune tâche</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="benaya-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Activité récente
          </h3>
          <Button variant="outline" size="sm">
            Voir tout
          </Button>
        </div>

        <div className="space-y-4">
          <ActivityItem
            title="Bon de commande créé"
            description="Commande de matériaux pour chantier Villa Moderne"
            time="Il y a 2 heures"
            icon={FileText}
            status="success"
          />
          <ActivityItem
            title="Intervention créée"
            description="BI00001 - Contrôle qualité"
            time="Il y a 4 heures"
            icon={Building}
            status="warning"
          />
          <ActivityItem
            title="Devis créé"
            description="D202500001 - Rénovation appartement"
            time="Hier"
            icon={FileText}
            status="primary"
          />
        </div>
      </div>
    </div>
  );
}
