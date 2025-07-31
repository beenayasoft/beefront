import { memo } from "react";
import { Trash2, Hammer, Package, Clock } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Work, Material, Labor } from "../../types/workLibrary";
import { ComponentWithType } from "../../hooks/useWorkComposition";
import { getComponentName, getComponentUnit, getComponentPrice } from "../../utils/componentUtils";
import { formatCurrency } from "../../../../lib/utils";

interface ComponentsListProps {
  components: ComponentWithType[];
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  onRemoveComponent: (index: number) => void;
}

export const ComponentsList = memo(function ComponentsList({
  components,
  availableMaterials,
  availableLabor,
  availableWorks,
  onRemoveComponent,
}: ComponentsListProps) {
  const getTypeBadge = (componentType: string) => {
    switch (componentType) {
      case "material":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Package className="w-3 h-3" />
            Matériau
          </Badge>
        );
      case "labor":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <Clock className="w-3 h-3" />
            Main d'œuvre
          </Badge>
        );
      case "work":
        return (
          <Badge className="benaya-badge-success gap-1">
            <Hammer className="w-3 h-3" />
            Ouvrage
          </Badge>
        );
      default:
        return null;
    }
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
        <Hammer className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
        <p>Aucun élément ajouté</p>
        <p className="text-xs">Cliquez sur "Ajouter" pour commencer</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Élément</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component, index) => {
            const price = getComponentPrice(component, availableMaterials, availableLabor, availableWorks);
            return (
              <TableRow key={index}>
                <TableCell>
                  {getTypeBadge(component.componentType)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {getComponentName(component, availableMaterials, availableLabor, availableWorks)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {getComponentUnit(component, availableMaterials, availableLabor, availableWorks)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{component.quantity}</TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(price * component.quantity)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveComponent(index)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});