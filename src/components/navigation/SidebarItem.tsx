import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string | null;
  };
  isActive: boolean;
  isCollapsed: boolean;
}

export function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  const Icon = item.icon;

  const content = (
    <Link
      to={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? [
              // Active state
              "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25",
              "dark:shadow-blue-500/40",
            ]
          : [
              // Inactive state
              "text-slate-700 dark:text-slate-300",
              "hover:bg-white/60 dark:hover:bg-slate-800/60",
              "hover:text-slate-900 dark:hover:text-white",
              "hover:shadow-md hover:shadow-slate-500/10 dark:hover:shadow-slate-900/20",
            ],
        isCollapsed ? "justify-center" : "justify-start",
      )}
    >
      {/* Background Glow for Active State */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-50 blur-md -z-10 group-hover:opacity-60 transition-opacity"></div>
      )}

      {/* Icon Container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          isActive
            ? "bg-white/20 shadow-inner"
            : "group-hover:bg-slate-100/50 dark:group-hover:bg-slate-700/50",
          isCollapsed ? "w-8 h-8" : "w-8 h-8",
        )}
      >
        <Icon
          className={cn(
            "transition-all duration-200",
            isActive ? "w-4 h-4" : "w-4 h-4",
          )}
        />
      </div>

      {/* Label and Badge */}
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1">
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className={cn(
                "ml-2 text-xs font-semibold",
                isActive
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
              )}
            >
              {item.badge}
            </Badge>
          )}
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-sm"></div>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.name}
            {item.badge && (
              <Badge variant="outline" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
