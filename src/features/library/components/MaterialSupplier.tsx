import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Material } from "@/features/library/types";

interface MaterialSupplierProps {
  material: Material;
}

export function MaterialSupplier({ material }: MaterialSupplierProps) {
  if (!material.supplier_id) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="w-5 h-5 text-Beenaya-600" />
          Fournisseur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <div className="font-medium text-lg">Fournisseur CRM</div>
          <div className="text-sm text-neutral-500 mt-1">ID: {material.supplier_id}</div>
        </div>
      </CardContent>
    </Card>
  );
}