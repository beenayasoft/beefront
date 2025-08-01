import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  currency?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  currency,
  change,
  changeType = "neutral",
  icon,
  description,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {value}
              </span>
              {currency && (
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {currency}
                </span>
              )}
            </div>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-green-600 dark:text-green-400",
                  changeType === "negative" && "text-red-600 dark:text-red-400", 
                  changeType === "neutral" && "text-neutral-600 dark:text-neutral-400"
                )}
              >
                {change}
              </p>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-benaya-50 dark:bg-benaya-900/20">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
