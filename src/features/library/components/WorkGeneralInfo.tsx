import { FileText, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Work } from "@/features/library/types";
import { formatCurrency } from "@/lib/utils";

interface WorkGeneralInfoProps {
  work: Work;
}

export function WorkGeneralInfo({ work }: WorkGeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-benaya-600" />
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
                  <span className="font-medium">{work.name}</span>
                </div>
                {work.reference && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Référence</span>
                    <span className="font-mono text-sm">{work.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Type</span>
                  <span>{work.isCustom ? "Personnalisé" : "Standard"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Unité et mesure</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Unité</span>
                  <span className="font-medium">{work.unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {work.description && (
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
            <p className="text-neutral-700 leading-relaxed">{work.description}</p>
          </div>
        )}

        {work.components && work.components.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-3">Composants</h4>
            <div className="space-y-2">
              {work.components.map((component, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      {component.type === 'material' ? (
                        <Package className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Users className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{component.name}</div>
                      <div className="text-sm text-neutral-500">
                        {component.quantity} {component.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(component.unitPrice)}</div>
                    <div className="text-sm text-neutral-500">par {component.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}