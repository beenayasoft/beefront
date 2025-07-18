import { Plus, FileText, Users, Building, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Nouveau devis",
    description: "Créer un devis pour un client",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    href: "/devis/nouveau",
  },
  {
    title: "Ajouter client",
    description: "Enregistrer un nouveau client",
    icon: Users,
    color: "from-green-500 to-green-600",
    href: "/clients/nouveau",
  },
  {
    title: "Nouveau chantier",
    description: "Démarrer un nouveau projet",
    icon: Building,
    color: "from-purple-500 to-purple-600",
    href: "/chantiers/nouveau",
  },
  {
    title: "Facture rapide",
    description: "Générer une facture",
    icon: Receipt,
    color: "from-orange-500 to-orange-600",
    href: "/factures/nouvelle",
  },
];

export function QuickActions() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239333ea" fill-opacity="0.1"%3E%3Cpath d="M15 0L22.5 7.5L15 15L7.5 7.5z"/%3E%3C/g%3E%3C/svg%3E\')]'
          }
        ></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-gradient-to-br from-purple-500 to-pink-600",
                "shadow-lg shadow-purple-500/25",
              )}
            >
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Actions rapides
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Raccourcis pour les tâches courantes
          </p>
        </div>

        {/* Actions Grid */}
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className={cn(
                  "w-full h-auto p-4 justify-start text-left group",
                  "hover:bg-white/60 dark:hover:bg-slate-800/60",
                  "border border-white/10 dark:border-slate-700/30",
                  "transition-all duration-200 hover:scale-[1.02]",
                )}
              >
                <div className="flex items-center gap-4 w-full">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl",
                      "bg-gradient-to-br",
                      action.color,
                      "shadow-lg group-hover:scale-110 transition-transform duration-200",
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 dark:border-slate-700/30">
          <Button
            variant="outline"
            className="w-full bg-white/30 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/50"
          >
            Voir toutes les actions
          </Button>
        </div>
      </div>
    </div>
  );
}
