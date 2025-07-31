import { memo } from "react";
import { formatCurrency } from "../../../../lib/utils";

interface CostSummaryProps {
  calculations: {
    materialCost: number;
    laborCost: number;
    subWorksCost: number;
    totalCost: number;
    margin: number;
    marginAmount: number;
    recommendedPrice: number;
  };
}

export const CostSummary = memo(function CostSummary({ calculations }: CostSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        Résumé des coûts
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Coût matériaux:</span>
            <span className="font-medium">{formatCurrency(calculations.materialCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Coût main d'œuvre:</span>
            <span className="font-medium">{formatCurrency(calculations.laborCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Coût sous-ouvrages:</span>
            <span className="font-medium">{formatCurrency(calculations.subWorksCost)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-neutral-200 dark:border-neutral-700 pt-2">
            <span className="font-medium">Coût total:</span>
            <span className="font-semibold">{formatCurrency(calculations.totalCost)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Marge ({calculations.margin}%):</span>
            <span className="font-medium text-green-600">+{formatCurrency(calculations.marginAmount)}</span>
          </div>
          <div className="flex justify-between text-lg border-t border-neutral-200 dark:border-neutral-700 pt-2">
            <span className="font-semibold">Prix recommandé:</span>
            <span className="font-bold text-green-600">{formatCurrency(calculations.recommendedPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});