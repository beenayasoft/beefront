import { Calendar, Settings2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";

export function WelcomeHeader() {
  const { getUserDisplayName } = useAuth();
  const currentTime = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-8",
        "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500",
        "shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/40",
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-20'
          }
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Bienvenue {getUserDisplayName()} 👋</h1>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {currentTime}
            </Badge>
          </div>
          <p className="text-blue-100 text-lg">
            Voici un aperçu de vos activités de construction
          </p>
          <p className="text-blue-200 text-sm">{currentDate}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tax Mode Toggle */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl",
              "bg-white/10 backdrop-blur-sm border border-white/20",
            )}
          >
            <span className="text-sm text-blue-100">HT</span>
            <div className="relative w-12 h-6 bg-white/20 rounded-full cursor-pointer">
              <div className="absolute right-0 top-0 w-6 h-6 bg-white rounded-full shadow-sm transition-transform"></div>
            </div>
            <span className="text-sm font-medium text-white">TTC</span>
          </div>

          {/* Date Range */}
          <Button
            variant="outline"
            className={cn(
              "bg-white/10 border-white/20 text-white backdrop-blur-sm",
              "hover:bg-white/20 gap-2",
            )}
          >
            <Calendar className="w-4 h-4" />
            01/04/2025 - 12/06/2025
          </Button>

          {/* Settings */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "bg-white/10 border-white/20 text-white backdrop-blur-sm",
              "hover:bg-white/20",
            )}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Animated Elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
    </div>
  );
}
