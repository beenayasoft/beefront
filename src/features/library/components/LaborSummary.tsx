import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Labor } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface LaborSummaryProps {
  labor: Labor;
}

export function LaborSummary({ labor }: LaborSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-benaya-600" />
          Résumé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(labor.unitPrice)}
            </div>
            <div className="text-sm text-neutral-500">Coût horaire</div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{labor.unit}</div>
              <div className="text-xs text-neutral-500">Unité de mesure</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}