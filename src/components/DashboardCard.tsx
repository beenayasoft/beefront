import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" &&
                  "text-green-600 dark:text-green-400",
                changeType === "negative" && "text-red-600 dark:text-red-400",
                changeType === "neutral" &&
                  "text-neo-gray-600 dark:text-neo-gray-400",
              )}
            >
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-benaya-100 dark:bg-benaya-900 rounded-lg">
            <Icon className="w-6 h-6 text-benaya-600 dark:text-benaya-400" />
          </div>
        )}
      </div>
    </div>
  );
}
