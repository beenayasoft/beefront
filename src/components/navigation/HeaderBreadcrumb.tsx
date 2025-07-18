import { useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/agenda": "Agenda",
  "/chantiers": "Chantiers",
  "/devis": "Devis",
  "/factures": "Factures",
  "/clients": "Clients",
  "/bibliotheque": "Bibliothèque",
  "/bons-commande": "Bons de commande",
  "/factures-achats": "Factures d'achats",
  "/fournisseurs": "Fournisseurs",
  "/transactions": "Transactions",
  "/reglages": "Réglages",
  "/parrainage": "Parrainage",
  "/aide": "Aide",
};

export function HeaderBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const currentPageName = routeNames[location.pathname] || "Page";

  return (
    <div className="flex items-center space-x-2">
      {/* Home Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg",
          "bg-blue-500/10 dark:bg-blue-500/20",
          "text-blue-600 dark:text-blue-400",
        )}
      >
        <Home className="w-4 h-4" />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Benaya ERP</span>

        {pathSegments.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-900 dark:text-white">
              {currentPageName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
