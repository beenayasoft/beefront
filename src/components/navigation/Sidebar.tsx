import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Sidebar Glass Container */}
      <nav
        className={cn(
          "h-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70",
          "border-r border-white/20 dark:border-slate-700/50",
          "shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5",
          "relative z-10",
        )}
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-8 z-20 h-6 w-6 rounded-full",
            "bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-slate-700/50",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "backdrop-blur-sm",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <SidebarLogo isCollapsed={isCollapsed} />

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNavigation isCollapsed={isCollapsed} />
          </div>

          {/* Footer */}
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </nav>
    </div>
  );
}
