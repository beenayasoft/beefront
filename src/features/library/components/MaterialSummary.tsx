import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Material } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface MaterialSummaryProps {
  material: Material;
}

export function MaterialSummary({ material }: MaterialSummaryProps) {
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
              {formatCurrency(material.unitPrice)}
            </div>
            <div className="text-sm text-neutral-500">Prix unitaire</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{material.vatRate}%</div>
              <div className="text-xs text-neutral-500">TVA</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-amber-600">{material.unit}</div>
              <div className="text-xs text-neutral-500">Unité</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}