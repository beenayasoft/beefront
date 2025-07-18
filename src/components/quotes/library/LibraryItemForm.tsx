import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Material, Labor } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";

interface LibraryItemFormProps {
  item?: Material | Labor;
  type: "material" | "labor";
  onSave: (item: Material | Labor) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LibraryItemForm({
  item,
  type,
  onSave,
  onCancel,
  isLoading = false,
}: LibraryItemFormProps) {
  const isEditing = !!item;
  const [formData, setFormData] = useState<Partial<Material | Labor>>(
    item || {
      id: "",
      name: "",
      description: "",
      unit: type === "material" ? "unité" : "h",
      unitPrice: 0,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        unit: type === "material" ? "unité" : "h",
        unitPrice: 0,
      });
    }
  }, [item, type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitPrice" ? parseFloat(value) || 0 : value,
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Le nom est obligatoire";
    }

    if (!formData.unit) {
      newErrors.unit = "L'unité est obligatoire";
    }

    if (formData.unitPrice === undefined || formData.unitPrice < 0) {
      newErrors.unitPrice = "Le prix unitaire doit être un nombre positif";
    }

    if (type === "material") {
      const materialData = formData as Partial<Material>;
      if (!materialData.vatRate && materialData.vatRate !== 0) {
        newErrors.vatRate = "Le taux de TVA est obligatoire";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      if (type === "material") {
        const materialData = {
          ...formData,
          id: formData.id || `material-${Date.now()}`,
          vatRate: (formData as Partial<Material>).vatRate || 20,
        } as Material;
        onSave(materialData);
      } else {
        const laborData = {
          ...formData,
          id: formData.id || `labor-${Date.now()}`,
        } as Labor;
        onSave(laborData);
      }
    }
  };

  const getIcon = () => {
    return type === "material" ? (
      <Package className="w-5 h-5 text-blue-600" />
    ) : (
      <Clock className="w-5 h-5 text-amber-600" />
    );
  };

  const getTypeLabel = () => {
    return type === "material" ? "Matériau" : "Main d'œuvre";
  };

  const getTypeBadge = () => {
    return type === "material" ? (
      <Badge className="benaya-badge-primary gap-1">
        <Package className="w-3 h-3" />
        Matériau
      </Badge>
    ) : (
      <Badge className="benaya-badge-warning gap-1">
        <Clock className="w-3 h-3" />
        Main d'œuvre
      </Badge>
    );
  };

  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? `Modifier ${getTypeLabel().toLowerCase()}` : `Ajouter ${getTypeLabel().toLowerCase()}`}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 mt-1">
              {isEditing 
                ? `Modifiez les informations de ce ${getTypeLabel().toLowerCase()}`
                : `Créez un nouveau ${getTypeLabel().toLowerCase()} dans votre bibliothèque`
              }
            </DialogDescription>
          </div>
          {getTypeBadge()}
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={`text-sm font-medium ${errors.name ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder={`Nom du ${getTypeLabel().toLowerCase()}`}
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
                <Label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder={`Description détaillée du ${getTypeLabel().toLowerCase()}`}
                  rows={3}
                  className="benaya-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              Informations techniques
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit" className={`text-sm font-medium ${errors.unit ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Unité <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit || ""}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                >
                  <SelectTrigger className={`benaya-input ${errors.unit ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "material" ? (
                      <>
                        <SelectItem value="unité">unité</SelectItem>
                        <SelectItem value="m²">m²</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="tonne">tonne</SelectItem>
                        <SelectItem value="litre">litre</SelectItem>
                        <SelectItem value="sac">sac</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="h">heure</SelectItem>
                        <SelectItem value="jour">jour</SelectItem>
                        <SelectItem value="forfait">forfait</SelectItem>
                      </>
                    )}
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
                <Label htmlFor="unitPrice" className={`text-sm font-medium ${errors.unitPrice ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Prix unitaire <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`benaya-input pr-12 ${errors.unitPrice ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 text-sm">
                    MAD
                  </div>
                </div>
                {errors.unitPrice && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.unitPrice}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations spécifiques aux matériaux */}
          {type === "material" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                Informations fiscales
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatRate" className={`text-sm font-medium ${errors.vatRate ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                    Taux de TVA <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={((formData as Partial<Material>).vatRate || 20).toString()}
                    onValueChange={(value) => handleSelectChange("vatRate", value)}
                  >
                    <SelectTrigger className={`benaya-input ${errors.vatRate ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Taux de TVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Exonéré)</SelectItem>
                      <SelectItem value="7">7% (Taux réduit)</SelectItem>
                      <SelectItem value="10">10% (Taux intermédiaire)</SelectItem>
                      <SelectItem value="14">14% (Taux spécial)</SelectItem>
                      <SelectItem value="20">20% (Taux normal)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vatRate && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.vatRate}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Fournisseur
                  </Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    value={(formData as Partial<Material>).supplier || ""}
                    onChange={handleChange}
                    placeholder="Nom du fournisseur"
                    className="benaya-input"
                  />
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
            disabled={isLoading}
            className="w-full sm:w-auto benaya-button"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
} 