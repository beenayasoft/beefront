import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Labor } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface LaborGeneralInfoProps {
  labor: Labor;
}

export function LaborGeneralInfo({ labor }: LaborGeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-Beenaya-600" />
          Informations générales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Identification</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Nom</span>
                  <span className="font-medium">{labor.name}</span>
                </div>
                {labor.category && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Catégorie</span>
                    <span>{labor.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Tarification</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Coût horaire</span>
                  <span className="font-semibold">{formatCurrency(labor.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Unité</span>
                  <span>{labor.unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {labor.description && (
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
            <p className="text-neutral-700 leading-relaxed">{labor.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}