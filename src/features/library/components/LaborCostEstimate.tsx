import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Labor } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface LaborCostEstimateProps {
  labor: Labor;
}

export function LaborCostEstimate({ labor }: LaborCostEstimateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-benaya-600" />
          Coût estimé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center py-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(labor.unitPrice)}
              </div>
              <div className="text-sm text-blue-500">1 heure</div>
            </div>
            <div className="text-center py-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(labor.unitPrice * 8)}
              </div>
              <div className="text-sm text-green-500">1 jour</div>
            </div>
          </div>
          
          <div className="text-center py-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(labor.unitPrice * 8 * 5)}
            </div>
            <div className="text-sm text-amber-500">1 semaine (5 jours)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}