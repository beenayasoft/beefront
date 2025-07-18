import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, Calculator, Info, AlertCircle, Loader2, Hammer, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Work, WorkComponent, Material, Labor } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";

interface WorkCompositionFormProps {
  work?: Work;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  onSave: (work: Work) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type ComponentType = "material" | "labor" | "work";

type ComponentWithType = {
  id: string;
  quantity: number;
  componentType: ComponentType;
};

export function WorkCompositionForm({
  work,
  availableMaterials,
  availableLabor,
  availableWorks,
  onSave,
  onCancel,
  isLoading = false,
}: WorkCompositionFormProps) {
  const isEditing = !!work;
  const [formData, setFormData] = useState<Partial<Work>>(
    work || {
      id: "",
      name: "",
      description: "",
      unit: "forfait",
      components: [],
      margin: 20, // Marge par défaut de 20%
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [components, setComponents] = useState<ComponentWithType[]>([]);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState<{
    componentType: ComponentType;
    id: string;
    quantity: number;
  }>({
    componentType: "material",
    id: "",
    quantity: 1,
  });

  // Initialiser les composants avec le type
  useEffect(() => {
    if (work?.components) {
      const componentsWithType = work.components.map((comp) => {
        let componentType: ComponentType = "material";
        if (availableMaterials.find((m) => m.id === comp.id)) {
          componentType = "material";
        } else if (availableLabor.find((l) => l.id === comp.id)) {
          componentType = "labor";
        } else if (availableWorks.find((w) => w.id === comp.id)) {
          componentType = "work";
        }
        return { ...comp, componentType };
      });
      setComponents(componentsWithType);
    } else {
      setComponents([]);
    }
  }, [work, availableMaterials, availableLabor, availableWorks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === "margin") {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleComponentTypeChange = (value: ComponentType) => {
    setNewComponent((prev) => ({
      ...prev,
      componentType: value,
      id: "", // Reset ID when type changes
    }));
  };

  const handleComponentIdChange = (value: string) => {
    setNewComponent((prev) => ({
      ...prev,
      id: value,
    }));
  };

  const handleComponentQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value) || 0;
    setNewComponent((prev) => ({
      ...prev,
      quantity: quantity > 0 ? quantity : 0,
    }));
  };

  const addComponent = () => {
    if (!newComponent.id || newComponent.quantity <= 0) {
      return;
    }

    // Vérifier si le composant existe déjà
    const existingIndex = components.findIndex(
      (comp) => comp.id === newComponent.id
    );

    if (existingIndex >= 0) {
      // Mettre à jour la quantité si le composant existe déjà
      const updatedComponents = [...components];
      updatedComponents[existingIndex].quantity += newComponent.quantity;
      setComponents(updatedComponents);
    } else {
      // Ajouter un nouveau composant
      setComponents([
        ...components,
        {
          ...newComponent,
          componentType: newComponent.componentType,
        },
      ]);
    }

    // Réinitialiser le formulaire d'ajout de composant
    setNewComponent({
      componentType: "material",
      id: "",
      quantity: 1,
    });
    setShowAddComponent(false);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Calculs des coûts
  const calculations = useMemo(() => {
    let materialCost = 0;
    let laborCost = 0;
    let subWorksCost = 0;

    components.forEach((comp) => {
      if (comp.componentType === "material") {
        const material = availableMaterials.find((m) => m.id === comp.id);
        if (material) {
          materialCost += material.unitPrice * comp.quantity;
        }
      } else if (comp.componentType === "labor") {
        const labor = availableLabor.find((l) => l.id === comp.id);
        if (labor) {
          laborCost += labor.unitPrice * comp.quantity;
        }
      } else if (comp.componentType === "work") {
        const subWork = availableWorks.find((w) => w.id === comp.id);
        if (subWork) {
          subWorksCost += subWork.recommendedPrice * comp.quantity;
        }
      }
    });

    const totalCost = materialCost + laborCost + subWorksCost;
    const margin = formData.margin || 20;
    const marginAmount = (totalCost * margin) / 100;
    const recommendedPrice = totalCost + marginAmount;

    return {
      materialCost,
      laborCost,
      subWorksCost,
      totalCost,
      margin,
      marginAmount,
      recommendedPrice,
    };
  }, [components, formData.margin, availableMaterials, availableLabor, availableWorks]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Le nom est obligatoire";
    }

    if (!formData.unit) {
      newErrors.unit = "L'unité est obligatoire";
    }

    if (components.length === 0) {
      newErrors.components = "L'ouvrage doit contenir au moins un composant";
    }

    if (formData.margin === undefined || formData.margin < 0) {
      newErrors.margin = "La marge doit être un pourcentage positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const workData: Work = {
        ...formData,
        id: formData.id || `work-${Date.now()}`,
        components: components.map(({ componentType, ...rest }) => rest),
        recommendedPrice: calculations.recommendedPrice,
      } as Work;
      
      onSave(workData);
    }
  };

  const getComponentName = (component: ComponentWithType): string => {
    if (component.componentType === "material") {
      return availableMaterials.find((m) => m.id === component.id)?.name || "Inconnu";
    } else if (component.componentType === "labor") {
      return availableLabor.find((l) => l.id === component.id)?.name || "Inconnu";
    } else {
      return availableWorks.find((w) => w.id === component.id)?.name || "Inconnu";
    }
  };

  const getComponentUnit = (component: ComponentWithType): string => {
    if (component.componentType === "material") {
      return availableMaterials.find((m) => m.id === component.id)?.unit || "";
    } else if (component.componentType === "labor") {
      return availableLabor.find((l) => l.id === component.id)?.unit || "";
    } else {
      return availableWorks.find((w) => w.id === component.id)?.unit || "";
    }
  };

  const getComponentPrice = (component: ComponentWithType): number => {
    if (component.componentType === "material") {
      return availableMaterials.find((m) => m.id === component.id)?.unitPrice || 0;
    } else if (component.componentType === "labor") {
      return availableLabor.find((l) => l.id === component.id)?.unitPrice || 0;
    } else {
      return availableWorks.find((w) => w.id === component.id)?.recommendedPrice || 0;
    }
  };

  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Hammer className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Modifier l'ouvrage" : "Créer un ouvrage"}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 mt-1">
              {isEditing 
                ? "Modifiez les informations et la composition de cet ouvrage"
                : "Définissez un nouvel ouvrage composé et sa composition"
              }
            </DialogDescription>
          </div>
          <Badge className="benaya-badge-success gap-1">
            <Hammer className="w-3 h-3" />
            Ouvrage
          </Badge>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={`text-sm font-medium ${errors.name ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Nom de l'ouvrage <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Nom de l'ouvrage"
                  className={`benaya-input ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Référence
                </Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference || ""}
                  onChange={handleChange}
                  placeholder="Référence de l'ouvrage"
                  className="benaya-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Description détaillée de l'ouvrage"
                rows={3}
                className="benaya-input resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit" className={`text-sm font-medium ${errors.unit ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Unité <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className={`benaya-input ${errors.unit ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forfait">forfait</SelectItem>
                    <SelectItem value="unité">unité</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="m³">m³</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.unit}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin" className={`text-sm font-medium ${errors.margin ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Marge <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="margin"
                    name="margin"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.margin || ""}
                    onChange={handleChange}
                    placeholder="20"
                    className={`benaya-input pr-8 ${errors.margin ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 text-sm">
                    %
                  </div>
                </div>
                {errors.margin && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.margin}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Composition */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2 flex-1">
                Composition de l'ouvrage
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddComponent(!showAddComponent)}
                className="gap-2 ml-4"
              >
                {showAddComponent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddComponent ? "Annuler" : "Ajouter"}
              </Button>
            </div>

            {errors.components && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.components}
              </div>
            )}

            {showAddComponent && (
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
                      onValueChange={handleComponentTypeChange as (value: string) => void}
                    >
                      <SelectTrigger className="benaya-input">
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
                    <Select
                      value={newComponent.id}
                      onValueChange={handleComponentIdChange}
                    >
                      <SelectTrigger className="benaya-input">
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
                            .filter((w) => w.id !== formData.id)
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
                      onChange={handleComponentQuantityChange}
                      placeholder="1"
                      className="benaya-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-transparent">Action</Label>
                    <Button
                      type="button"
                      onClick={addComponent}
                      disabled={!newComponent.id || newComponent.quantity <= 0}
                      className="w-full benaya-button"
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des composants */}
            {components.length > 0 ? (
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
                    {components.map((component, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {component.componentType === "material" && (
                            <Badge className="benaya-badge-primary gap-1">
                              <Package className="w-3 h-3" />
                              Matériau
                            </Badge>
                          )}
                          {component.componentType === "labor" && (
                            <Badge className="benaya-badge-warning gap-1">
                              <Clock className="w-3 h-3" />
                              Main d'œuvre
                            </Badge>
                          )}
                          {component.componentType === "work" && (
                            <Badge className="benaya-badge-success gap-1">
                              <Hammer className="w-3 h-3" />
                              Ouvrage
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getComponentName(component)}</div>
                            <div className="text-xs text-neutral-500">
                              {getComponentUnit(component)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{component.quantity}</TableCell>
                        <TableCell>{formatCurrency(getComponentPrice(component))}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(getComponentPrice(component) * component.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeComponent(index)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
                <Hammer className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                <p>Aucun élément ajouté</p>
                <p className="text-xs">Cliquez sur "Ajouter" pour commencer</p>
              </div>
            )}
          </div>

          {/* Résumé des coûts */}
          {components.length > 0 && (
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
                    <span className="text-neutral-600">Marge ({formData.margin || 0}%):</span>
                    <span className="font-medium text-green-600">+{formatCurrency(calculations.marginAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t border-neutral-200 dark:border-neutral-700 pt-2">
                    <span className="font-semibold">Prix recommandé:</span>
                    <span className="font-bold text-green-600">{formatCurrency(calculations.recommendedPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading || components.length === 0}
            className="w-full sm:w-auto benaya-button"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer l'ouvrage"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}