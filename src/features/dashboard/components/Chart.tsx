import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Chart({ title, description, children, className }: ChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
