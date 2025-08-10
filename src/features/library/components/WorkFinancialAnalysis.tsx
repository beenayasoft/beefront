import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Work } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface WorkFinancialAnalysisProps {
  work: Work;
}

export function WorkFinancialAnalysis({ work }: WorkFinancialAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-Beenaya-600" />
          Analyse financière
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Coût matériaux</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(work.materialCost || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Coût main d'œuvre</span>
              <span className="font-medium text-green-600">
                {formatCurrency(work.laborCost || 0)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-neutral-600">Coût total</span>
              <span className="font-semibold">
                {formatCurrency(work.totalCost || 0)}
              </span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between">
              <span className="text-neutral-600">Prix recommandé</span>
              <span className="font-bold text-green-600">
                {formatCurrency(work.recommendedPrice || 0)}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-neutral-600">Marge</span>
              <span className="font-medium text-amber-600">
                {work.margin || 0}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}