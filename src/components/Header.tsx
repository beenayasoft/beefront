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
  LogOut,
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
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getInitials = () => {
    if (!user) return "U";
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` || user.email?.[0] || "U";
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 py-4 bg-white dark:bg-neo-gray-900 border-b border-neo-gray-200 dark:border-neo-gray-800",
        className,
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neo-gray-400" />
          <Input
            placeholder="Rechercher partout..."
            className="pl-10 bg-neo-gray-50 dark:bg-neo-gray-800 border-neo-gray-200 dark:border-neo-gray-700 focus:ring-benaya-500 focus:border-benaya-500"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neo-gray-600 hover:text-neo-gray-900 dark:text-neo-gray-400 dark:hover:text-neo-gray-100"
            >
              <Globe className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          className="text-neo-gray-600 hover:text-neo-gray-900 dark:text-neo-gray-400 dark:hover:text-neo-gray-100"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Gift/Referral */}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Gift className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-neo-gray-600 hover:text-neo-gray-900 dark:text-neo-gray-400 dark:hover:text-neo-gray-100 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            1
          </span>
        </Button>

        {/* Starter badge */}
        <div className="px-3 py-1 bg-benaya-100 dark:bg-benaya-900 text-benaya-700 dark:text-benaya-300 text-xs font-medium rounded-full">
          Starter
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt={user?.username || "@user"} />
                <AvatarFallback className="bg-benaya-100 dark:bg-benaya-900 text-benaya-700 dark:text-benaya-300">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user ? `${user.first_name} ${user.last_name}` : "Utilisateur"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "utilisateur@benaya.fr"}
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
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
