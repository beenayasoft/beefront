import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Material } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface MaterialGeneralInfoProps {
  material: Material;
}

export function MaterialGeneralInfo({ material }: MaterialGeneralInfoProps) {
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
                  <span className="font-medium">{material.name}</span>
                </div>
                {material.reference && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Référence</span>
                    <span className="font-mono text-sm">{material.reference}</span>
                  </div>
                )}
                {material.category && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Catégorie</span>
                    <span>{material.category}</span>
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
                  <span className="text-neutral-600">Prix unitaire HT</span>
                  <span className="font-semibold">{formatCurrency(material.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Unité</span>
                  <span>{material.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Taux TVA</span>
                  <span>{material.vatRate}%</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span className="text-neutral-600">Prix TTC</span>
                  <span>{formatCurrency(material.unitPrice * (1 + material.vatRate / 100))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {material.description && (
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
            <p className="text-neutral-700 leading-relaxed">{material.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}