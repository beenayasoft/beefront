import { useState } from "react";
import {
  Clock,
  FileText,
  ShoppingCart,
  Building,
  CheckCircle,
  AlertCircle,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "quote",
    title: "Devis créé",
    description: "Devis D202500001 pour renovation appartement",
    client: "Jean Dupont",
    time: "Il y a 2 heures",
    icon: FileText,
    status: "created",
    amount: "15,500 MAD",
  },
  {
    id: 2,
    type: "order",
    title: "Bon de commande",
    description: "Commande de matériaux pour chantier Villa Moderne",
    client: "Fournisseur ABC",
    time: "Il y a 4 heures",
    icon: ShoppingCart,
    status: "pending",
    amount: "8,200 MAD",
  },
  {
    id: 3,
    type: "project",
    title: "Chantier démarré",
    description: "Début des travaux Villa Moderne",
    client: "Marie Lambert",
    time: "Hier",
    icon: Building,
    status: "in_progress",
    amount: null,
  },
  {
    id: 4,
    type: "payment",
    title: "Paiement reçu",
    description: "Facture F202500012 réglée",
    client: "Pierre Martin",
    time: "Hier",
    icon: CheckCircle,
    status: "completed",
    amount: "12,300 MAD",
  },
  {
    id: 5,
    type: "client",
    title: "Nouveau client",
    description: "Sophie Dubois ajoutée au portefeuille",
    client: "Sophie Dubois",
    time: "Il y a 2 jours",
    icon: Users,
    status: "created",
    amount: null,
  },
];

export function RecentActivity() {
  const [filter, setFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100/50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
      case "pending":
        return "bg-orange-100/50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
      case "in_progress":
        return "bg-blue-100/50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
      default:
        return "bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "pending":
        return "En attente";
      case "in_progress":
        return "En cours";
      case "created":
        return "Créé";
      default:
        return "Nouveau";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
      )}
    >
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  "bg-gradient-to-br from-green-500 to-emerald-600",
                  "shadow-lg shadow-green-500/25",
                )}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Activité récente
              </h3>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
          >
            Voir tout
          </Button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className={cn(
                  "group relative flex items-start gap-4 p-4 rounded-xl",
                  "bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm",
                  "border border-white/20 dark:border-slate-700/30",
                  "hover:bg-white/60 dark:hover:bg-slate-800/60",
                  "transition-all duration-200 hover:scale-[1.01]",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl",
                    "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800",
                    "border border-slate-200 dark:border-slate-600",
                    "group-hover:scale-110 transition-transform duration-200",
                  )}
                >
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {activity.client} • {activity.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                      {activity.amount && (
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-9 top-16 w-px h-6 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
