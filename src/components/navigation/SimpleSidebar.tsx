import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Receipt,
  Calendar,
  Wrench,
  Package,
  Building2,
  Hammer,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSidebarStats } from "@/hooks/useSidebarStats";

const getMainNavItems = (stats: any) => [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: Calendar,
    // Badge supprimé - service non disponible
  },
  {
    name: "Opportunités",
    href: "/opportunities",
    icon: BarChart3,
    badge: stats.opportunities ? stats.opportunities.toString() : undefined,
  },
  {
    name: "Chantiers",
    href: "/chantiers",
    icon: Building,
    // Badge supprimé - service non disponible
  },
  {
    name: "Devis",
    href: "/devis",
    icon: FileText,
    // Badge supprimé - service non disponible
  },
  {
    name: "Factures",
    href: "/factures",
    icon: Receipt,
    // Badge supprimé - service non disponible
  },
  {
    name: "Interventions",
    href: "/interventions",
    icon: Wrench,
    // Badge supprimé - service non disponible
  },
  {
    name: "Stock",
    href: "/stock",
    icon: Package,
  },
  {
    name: "Bibliothèque d'ouvrages",
    href: "/bibliotheque",
    icon: Hammer,
  },
  {
    name: "Tiers",
    href: "/tiers",
    icon: Building2,
    badge: stats.tiers ? stats.tiers.toString() : undefined,
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export function SimpleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState<{
    title: string;
    message: string;
    icon: React.ReactNode;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useSidebarStats();

  const isActive = (href: string) => location.pathname === href;

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Fonction pour gérer l'action nouveau devis
  const handleNewQuoteAction = () => {
    navigate('/devis/nouveau');
  };

  return (
    <div
      className={cn(
        "relative h-full transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Sidebar Container */}
      <nav className="h-full Beenaya-glass border-r border-neutral-200 dark:border-neutral-700">
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-neutral-200 dark:border-neutral-700 p-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              {/* Logo du tenant ou logo par défaut */}
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-Beenaya-900">
                {user?.tenant_info?.settings?.logo_base64 || user?.tenant_info?.settings?.logo_url ? (
                  <img 
                    src={user?.tenant_info?.settings?.logo_base64 || user?.tenant_info?.settings?.logo_url} 
                    alt={`Logo ${user?.tenant_info?.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 text-white">
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      className="w-full h-full"
                    >
                      <g fill="currentColor" opacity="0.9">
                        <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                        <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
                        <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
                        <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
                        <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
                        <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
                      </g>
                      <path
                        d="M15 20L18.5 23.5L25 17"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-Beenaya-900 dark:text-white">
                  {user?.tenant_info?.name || "Votre Entreprise"}
                </h1>
                {user?.tenant_info?.slogan ? (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {user.tenant_info.slogan}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-neutral-600 dark:text-neutral-400 hover:text-Beenaya-900 dark:hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 flex-1 overflow-y-auto Beenaya-scrollbar">
          {getMainNavItems(stats).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item group",
                  active ? "nav-item-active" : "nav-item-inactive",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all duration-200",
                    active
                      ? "bg-white/20 text-white"
                      : "text-neutral-600 dark:text-neutral-400 group-hover:text-Beenaya-900 dark:group-hover:text-white",
                    isCollapsed ? "w-8 h-8" : "w-6 h-6",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-Beenaya-100 dark:bg-Beenaya-900/30 text-Beenaya-800 dark:text-Beenaya-200",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Action */}
        {!isCollapsed && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button 
              className="w-full Beenaya-button-primary gap-2"
              onClick={handleNewQuoteAction}
            >
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Button>
          </div>
        )}

        {/* User Section */}
        <div
          className={cn(
            "p-4 border-t border-neutral-200 dark:border-neutral-700",
            "bg-neutral-50 dark:bg-neutral-800/50",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isCollapsed && "justify-center",
            )}
          >
            <div className="w-8 h-8">
              <img src="/logo.svg" alt="Beenaya logo" className="w-full h-full" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Beenaya
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  v1.0.0
                </p>
              </div>
            )}
          </div>

          {/* Déconnexion */}
          {!isCollapsed && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          )}
        </div>
      </nav>
      
      {/* Modale informative pour les actions */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              {actionModalContent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-4">
            {actionModalContent?.icon}
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {actionModalContent?.message}
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setActionModalOpen(false)}
              className="px-8"
            >
              Compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}