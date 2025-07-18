import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  const { getTenantName, getTenantInfo } = useAuth();
  const tenantName = getTenantName();
  const tenantInfo = getTenantInfo();
  const logoUrl = tenantInfo?.logo_url || tenantInfo?.settings?.logo_url || null;
  const firstLetter = tenantName ? tenantName.charAt(0).toUpperCase() : "B";

  return (
    <div
      className={cn(
        "flex items-center border-b border-white/10 dark:border-slate-700/50",
        "bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10",
        isCollapsed ? "px-2 py-4" : "px-6 py-4",
      )}
    >
      {/* Logo ou initiale du tenant */}
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl overflow-hidden",
            "bg-gradient-to-br from-blue-500 to-purple-600",
            "shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40",
            isCollapsed ? "w-10 h-10" : "w-12 h-12",
          )}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-sm"></div>

          {/* Logo du tenant ou initiale */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center text-white font-bold",
              isCollapsed ? "w-6 h-6 text-lg" : "w-8 h-8 text-2xl",
            )}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={tenantName}
                className={cn(
                  "object-cover w-full h-full rounded-2xl",
                  isCollapsed ? "w-6 h-6" : "w-8 h-8"
                )}
              />
            ) : (
              <span>{firstLetter}</span>
            )}
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-75 blur-md -z-10"></div>
        </div>
      </div>

      {/* Nom du tenant */}
      {!isCollapsed && (
        <div className="ml-4 flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {tenantName}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">
            ERP CONSTRUCTION
          </span>
        </div>
      )}
    </div>
  );
}
