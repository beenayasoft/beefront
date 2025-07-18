import {
  Search,
  Bell,
  Globe,
  HelpCircle,
  Gift,
  Settings,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";
import { HeaderActions } from "./HeaderActions";

export function Header() {
  return (
    <header
      className={cn(
        "relative z-10 h-16 flex items-center justify-between px-6",
        "backdrop-blur-xl bg-white/60 dark:bg-slate-900/60",
        "border-b border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>

      {/* Left Section - Breadcrumb */}
      <div className="relative z-10 flex-1">
        <HeaderBreadcrumb />
      </div>

      {/* Center Section - Search */}
      <div className="relative z-10 flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Rechercher partout..."
            className={cn(
              "pl-10 pr-4 py-2 w-full",
              "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
              "border-white/20 dark:border-slate-700/50",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            )}
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="relative z-10 flex-1 flex items-center justify-end">
        <HeaderActions />
      </div>
    </header>
  );
}
