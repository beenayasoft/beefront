import { Link } from "react-router-dom";
import { Settings, Heart, HelpCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";
import { Button } from "@/components/ui/button";

interface SidebarFooterProps {
  isCollapsed: boolean;
}

const footerItems = [
  {
    name: "Réglages",
    href: "/reglages",
    icon: Settings,
    badge: null,
  },
  {
    name: "Parrainage",
    href: "/parrainage",
    icon: Heart,
    badge: null,
  },
  {
    name: "Aide",
    href: "/aide",
    icon: HelpCircle,
    badge: null,
  },
];

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-white/10 dark:border-slate-700/50 p-3 space-y-2",
        "bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50",
      )}
    >
      {/* Settings Items */}
      <div className="space-y-1">
        {footerItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={false}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Upgrade Button */}
      {!isCollapsed && (
        <div className="pt-2">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-sm font-medium",
              "bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
              "border-orange-200 dark:border-orange-700/50",
              "text-orange-700 dark:text-orange-300",
              "hover:from-orange-500/20 hover:to-red-500/20 dark:hover:from-orange-500/30 dark:hover:to-red-500/30",
              "hover:border-orange-300 dark:hover:border-orange-600",
              "transition-all duration-200",
            )}
          >
            <Zap className="w-4 h-4" />
            Plus de fonctionnalités ?
          </Button>
        </div>
      )}
    </div>
  );
}
