import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";

interface SidebarSectionProps {
  title: string;
  isCollapsed: boolean;
  items: Array<{
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string | null;
  }>;
  currentPath: string;
}

export function SidebarSection({
  title,
  isCollapsed,
  items,
  currentPath,
}: SidebarSectionProps) {
  if (isCollapsed) {
    return (
      <div className="space-y-1 px-3">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={currentPath === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="px-6">
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg",
            "bg-gradient-to-r from-slate-100/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-700/50",
            "border border-slate-200/50 dark:border-slate-700/50",
          )}
        >
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-300/50 to-transparent dark:from-slate-600/50"></div>
        </div>
      </div>

      {/* Section Items */}
      <div className="space-y-1 px-3">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={currentPath === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
}
