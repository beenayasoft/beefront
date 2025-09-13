import { Calendar, TrendingUp, Plus } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { Chart } from "@/components/Chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function Index() {
  const { getUserDisplayName } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-neo-gray-900 dark:text-white">
            Bienvenue {getUserDisplayName()} 👋
          </h1>
          <p className="text-neo-gray-600 dark:text-neo-gray-400">
            Voici un aperçu de vos activités de construction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-neo-gray-100 dark:bg-neo-gray-800 rounded-lg">
            <span className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
              HT
            </span>
            <div className="w-6 h-3 bg-neo-gray-300 dark:bg-neo-gray-600 rounded-full relative">
              <div className="absolute left-0 top-0 w-3 h-3 bg-white dark:bg-neo-gray-400 rounded-full shadow-sm"></div>
            </div>
            <span className="text-sm font-medium text-neo-gray-900 dark:text-white">
              TTC
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-neo-gray-100 dark:bg-neo-gray-800 rounded-lg">
            <Calendar className="w-4 h-4 text-neo-gray-600 dark:text-neo-gray-400" />
            <span className="text-sm text-neo-gray-900 dark:text-white">
              01/04/2025 - 12/06/2025
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Chart title="Chiffre d'affaires" value="0,00" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="TVA Collectée"
          value="0,00 MAD"
          icon={TrendingUp}
        />
        <DashboardCard
          title="TVA Déductible"
          value="0,00 MAD"
          icon={TrendingUp}
        />
        <DashboardCard title="TVA Due" value="0,00 MAD" icon={TrendingUp} />
        <DashboardCard
          title="Prochaine échéance"
          value="24 juin"
          icon={Calendar}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unpaid Invoices */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neo-gray-900 dark:text-white">
                Factures non réglées
              </h2>
              <Button
                variant="link"
                className="text-Beenaya-600 dark:text-Beenaya-400 p-0"
              >
                Tout voir
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="neo-badge neo-badge-orange">
                    En attente
                  </Badge>
                  <span className="text-2xl font-bold text-orange-600">0</span>
                </div>
                <p className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
                  0,00 MAD
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="neo-badge neo-badge-gray">En retard</Badge>
                  <span className="text-2xl font-bold text-neo-gray-600">
                    0
                  </span>
                </div>
                <p className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
                  0,00 MAD
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-neo-gray-50 dark:bg-neo-gray-800 rounded-lg text-center">
              <p className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
                Aucune facture en attente
              </p>
            </div>
          </div>

          {/* Quotes */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neo-gray-900 dark:text-white">
                Devis
              </h2>
              <Button
                variant="link"
                className="text-Beenaya-600 dark:text-Beenaya-400 p-0"
              >
                Tout voir
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
                  0 devis à facturer
                </span>
                <span className="text-sm font-medium">0,00 MAD</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-neo-gray-900 dark:text-white">
                      0 acceptés
                    </span>
                  </div>
                  <span className="text-sm font-medium">0,00 MAD</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-neo-gray-900 dark:text-white">
                      0 en attente
                    </span>
                  </div>
                  <span className="text-sm font-medium">0,00 MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tasks and Events */}
        <div className="space-y-6">
          {/* Tasks */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neo-gray-900 dark:text-white">
                Tâches
              </h2>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une tâche
              </Button>
            </div>

            <div className="text-center py-8">
              <p className="text-sm text-neo-gray-600 dark:text-neo-gray-400">
                Aucune tâche pour le moment
              </p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="neo-card p-6">
            <h2 className="text-lg font-semibold text-neo-gray-900 dark:text-white mb-4">
              Événements récents
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-Beenaya-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neo-gray-900 dark:text-white">
                    Bon de commande créé
                  </p>
                  <p className="text-xs text-neo-gray-500 dark:text-neo-gray-400">
                    19 mai à 13:41
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-Beenaya-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neo-gray-900 dark:text-white">
                    Bon de commande créé
                  </p>
                  <p className="text-xs text-neo-gray-500 dark:text-neo-gray-400">
                    19 mai à 12:48
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-Beenaya-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neo-gray-900 dark:text-white">
                    Intervention créée
                  </p>
                  <p className="text-xs text-neo-gray-500 dark:text-neo-gray-400">
                    BI00001
                    <br />
                    19 mai à 12:03
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-Beenaya-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neo-gray-900 dark:text-white">
                    Devis créé
                  </p>
                  <p className="text-xs text-neo-gray-500 dark:text-neo-gray-400">
                    D202500001
                    <br />
                    16 mai à 10:41
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
