import {
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HeaderActions() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getInitials = () => {
    if (!user) return "U";
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` || user.email?.[0] || "U";
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-9 h-9 rounded-lg",
              "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
              "border border-white/20 dark:border-slate-700/50",
              "hover:bg-white/80 dark:hover:bg-slate-800/80",
              "text-slate-600 dark:text-slate-400",
            )}
          >
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Langue</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
          <DropdownMenuItem>🇺🇸 English</DropdownMenuItem>
          <DropdownMenuItem>🇪🇸 Español</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-9 h-9 rounded-lg",
          "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
          "border border-white/20 dark:border-slate-700/50",
          "hover:bg-white/80 dark:hover:bg-slate-800/80",
          "text-slate-600 dark:text-slate-400",
        )}
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {/* Referral */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-9 h-9 rounded-lg",
          "bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20",
          "border border-red-200 dark:border-red-700/50",
          "hover:from-red-500/20 hover:to-pink-500/20 dark:hover:from-red-500/30 dark:hover:to-pink-500/30",
          "text-red-600 dark:text-red-400",
        )}
      >
        <Gift className="w-4 h-4" />
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-9 h-9 rounded-lg relative",
          "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
          "border border-white/20 dark:border-slate-700/50",
          "hover:bg-white/80 dark:hover:bg-slate-800/80",
          "text-slate-600 dark:text-slate-400",
        )}
      >
        <Bell className="w-4 h-4" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">3</span>
        </div>
      </Button>

      {/* Plan Badge */}
      <Badge
        className={cn(
          "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20",
          "text-blue-700 dark:text-blue-300",
          "border-blue-200 dark:border-blue-700/50",
          "font-medium",
        )}
      >
        Starter
      </Badge>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-lg p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || ""} alt={user?.username || "@user"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || "Utilisateur"
                }
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Monitor className="mr-2 h-4 w-4" />
              <span>Thème</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Clair</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Sombre</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>Système</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
