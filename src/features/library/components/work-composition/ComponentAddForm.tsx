import { memo } from "react";
import { Package, Clock, Hammer } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Work, Material, Labor } from "../../types/workLibrary";
import { ComponentType, NewComponentState } from "../../hooks/useWorkComposition";
import { formatCurrency } from "../../../../lib/utils";

interface ComponentAddFormProps {
  newComponent: NewComponentState;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  formDataId?: string;
  onComponentTypeChange: (value: ComponentType) => void;
  onComponentIdChange: (value: string) => void;
  onComponentQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddComponent: () => void;
}

export const ComponentAddForm = memo(function ComponentAddForm({
  newComponent,
  availableMaterials,
  availableLabor,
  availableWorks,
  formDataId,
  onComponentTypeChange,
  onComponentIdChange,
  onComponentQuantityChange,
  onAddComponent,
}: ComponentAddFormProps) {
  return (
    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 space-y-4">
      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Ajouter un élément
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="componentType" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Type
          </Label>
          <Select
            value={newComponent.componentType}
            onValueChange={onComponentTypeChange as (value: string) => void}
          >
            <SelectTrigger className="Beenaya-input">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="material">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Matériau
                </div>
              </SelectItem>
              <SelectItem value="labor">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Main d'œuvre
                </div>
              </SelectItem>
              <SelectItem value="work">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-green-600" />
                  Ouvrage
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="componentId" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Élément
          </Label>
          <Select value={newComponent.id} onValueChange={onComponentIdChange}>
            <SelectTrigger className="Beenaya-input">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {newComponent.componentType === "material" &&
                availableMaterials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{material.name}</span>
                      <span className="text-xs text-neutral-500 ml-2">
                        {formatCurrency(material.unitPrice)}/{material.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              {newComponent.componentType === "labor" &&
                availableLabor.map((labor) => (
                  <SelectItem key={labor.id} value={labor.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{labor.name}</span>
                      <span className="text-xs text-neutral-500 ml-2">
                        {formatCurrency(labor.unitPrice)}/{labor.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              {newComponent.componentType === "work" &&
                availableWorks
                  .filter((w) => w.id !== formDataId)
                  .map((work) => (
                    <SelectItem key={work.id} value={work.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{work.name}</span>
                        <span className="text-xs text-neutral-500 ml-2">
                          {formatCurrency(work.recommendedPrice)}/{work.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="componentQuantity" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Quantité
          </Label>
          <Input
            id="componentQuantity"
            type="number"
            step="0.01"
            min="0.01"
            value={newComponent.quantity}
            onChange={onComponentQuantityChange}
            placeholder="1"
            className="Beenaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-transparent">Action</Label>
          <Button
            type="button"
            onClick={onAddComponent}
            disabled={!newComponent.id || newComponent.quantity <= 0}
            className="w-full Beenaya-button"
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
});