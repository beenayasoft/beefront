import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Work } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface WorkProfitabilityProps {
  work: Work;
}

export function WorkProfitability({ work }: WorkProfitabilityProps) {
  if (!work.recommendedPrice || !work.totalCost) {
    return null;
  }

  const profit = work.recommendedPrice - work.totalCost;
  const profitMargin = work.totalCost > 0 ? (profit / work.totalCost) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-Beenaya-600" />
          Rentabilité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center py-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(profit)}
            </div>
            <div className="text-sm text-green-500">Bénéfice par unité</div>
          </div>
          
          <div className="text-center py-2">
            <div className="text-lg font-semibold text-blue-600">
              {profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-neutral-500">Marge bénéficiaire</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}