import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  currency?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function MetricCard({
  title,
  value,
  currency,
  change,
  changeType = "neutral",
  icon: Icon,
  trend = "stable",
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6",
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
        "hover:shadow-xl hover:shadow-slate-500/10 dark:hover:shadow-slate-900/30",
        "transition-all duration-300 hover:scale-[1.02]",
        className,
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl",
              "bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20",
              "border border-blue-200/50 dark:border-blue-700/50",
              "group-hover:scale-110 transition-transform duration-300",
            )}
          >
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg",
              "bg-slate-100/50 dark:bg-slate-800/50",
              changeType === "positive" &&
                "bg-green-100/50 dark:bg-green-900/50",
              changeType === "negative" && "bg-red-100/50 dark:bg-red-900/50",
            )}
          >
            <TrendIcon
              className={cn(
                "w-4 h-4",
                changeType === "positive" &&
                  "text-green-600 dark:text-green-400",
                changeType === "negative" && "text-red-600 dark:text-red-400",
                changeType === "neutral" &&
                  "text-slate-500 dark:text-slate-400",
              )}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
        </div>

        {/* Value */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </span>
            {currency && (
              <span className="text-sm sm:text-base md:text-lg font-medium text-slate-600 dark:text-slate-400">
                {currency}
              </span>
            )}
          </div>

          {/* Change */}
          {change && (
            <p
              className={cn(
                "text-xs sm:text-sm font-medium truncate",
                changeType === "positive" &&
                  "text-green-600 dark:text-green-400",
                changeType === "negative" && "text-red-600 dark:text-red-400",
                changeType === "neutral" &&
                  "text-slate-600 dark:text-slate-400",
              )}
            >
              {change}
            </p>
          )}
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}
