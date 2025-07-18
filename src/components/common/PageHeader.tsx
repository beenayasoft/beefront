import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-8",
        "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-800 dark:via-blue-800 dark:to-indigo-800",
        "shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/40",
        className,
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
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-blue-100 text-lg max-w-2xl">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={action.onClick}
                className={cn(
                  "bg-white/10 border-white/20 text-white backdrop-blur-sm",
                  "hover:bg-white/20",
                )}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className={cn(
                "gap-2 bg-white text-slate-900 hover:bg-white/90",
                "shadow-lg shadow-white/25",
              )}
            >
              <primaryAction.icon className="w-4 h-4" />
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Animated Elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
    </div>
  );
}
