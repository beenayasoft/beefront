import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  contentClassName
}: DashboardCardProps) {
  return (
    <Card className={cn("", className)}>
      {(title || description || icon) && (
        <CardHeader className={cn("", headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
