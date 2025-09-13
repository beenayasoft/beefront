import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { VatRateSelector } from "../../documents/components/VatRateSelector";
import { useVatRates } from "../../documents/hooks/useVatRates";
import { SupplierSelector } from "./SupplierSelector";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Package, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Material, Labor } from "../types/workLibrary";
import { formatCurrency } from "../../../lib/utils";

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
  const { getVatRateByCode, vatRates, defaultVatRate } = useVatRates();
  const [formData, setFormData] = useState<Partial<Material | Labor>>(
    item || {
      id: "",
      name: "",
      description: "",
      unit: type === "material" ? "unité" : "h",
      unitPrice: 0,
      categoryId: "",
      code: "",
      ...(type === "material" ? {
        vatRate: 20,
        reference: "",
        wasteFactor: 0,
        isRecyclable: false,
      } : {
        skillLevel: "skilled" as const,
        productivityFactor: 1.0,
      }),
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
        categoryId: "",
        code: "",
        ...(type === "material" ? {
          vatRate: 20,
            reference: "",
          wasteFactor: 0,
          isRecyclable: false,
        } : {
          skillLevel: "skilled" as const,
          productivityFactor: 1.0,
        }),
      });
    }
  }, [item, type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    // Handle numeric fields
    if (['unitPrice', 'vatRate', 'wasteFactor', 'productivityFactor'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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
    let processedValue: any = value;
    
    // Handle numeric fields that come from selects
    if (name === 'vatRate') {
      // Le VatRateSelector retourne un code, on doit récupérer le taux numérique
      const vatRate = getVatRateByCode(value);
      processedValue = vatRate ? vatRate.rate : parseFloat(value) || 0;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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
          id: formData.id || "", // L'ID sera généré par l'API
          vatRate: (formData as Partial<Material>).vatRate || 20,
        } as Material;
        
        onSave(materialData);
      } else {
        const laborData = {
          ...formData,
          id: formData.id || "", // L'ID sera généré par l'API
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
      <Badge className="Beenaya-badge-primary gap-1">
        <Package className="w-3 h-3" />
        Matériau
      </Badge>
    ) : (
      <Badge className="Beenaya-badge-warning gap-1">
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
        <div className="space-y-8">
          {/* Informations générales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Renseignez les informations principales de l'élément
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={`text-sm ${errors.name ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder={`Nom du ${getTypeLabel().toLowerCase()}`}
                  className={`Beenaya-input ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder={`Description détaillée du ${getTypeLabel().toLowerCase()}`}
                  rows={3}
                  className="Beenaya-input resize-none"
                />
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Informations techniques
              </CardTitle>
              <CardDescription>
                Définissez le prix et l'unité de mesure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="unit" className={`text-sm ${errors.unit ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                  Unité <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit || ""}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                >
                  <SelectTrigger className={`Beenaya-input ${errors.unit ? "border-red-500" : ""}`}>
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
                <Label htmlFor="unitPrice" className={`text-sm ${errors.unitPrice ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}>
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
                    className={`Beenaya-input pr-12 ${errors.unitPrice ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-describedby="price-currency"
                    aria-invalid={!!errors.unitPrice}
                  />
                  <div 
                    id="price-currency" 
                    className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 text-sm"
                    aria-label="Devise en dirhams marocains"
                  >
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
            </CardContent>
          </Card>

          {/* Informations spécifiques aux matériaux */}
          {type === "material" && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Informations fiscales
                </CardTitle>
                <CardDescription>
                  Détails spécifiques aux matériaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <VatRateSelector
                    value={(() => {
                      const currentVatRate = (formData as Partial<Material>).vatRate || 20;
                      // Chercher le code correspondant au taux numérique
                      const matchingRate = vatRates.find(rate => rate.rate === currentVatRate);
                      return matchingRate?.code || defaultVatRate?.code || currentVatRate.toString();
                    })()}
                    onValueChange={(value) => handleSelectChange("vatRate", value)}
                    disabled={isLoading}
                    className={`${errors.vatRate ? "border-red-500" : ""}`}
                  />
                  {errors.vatRate && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.vatRate}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-neutral-700 dark:text-neutral-300">
                    Fournisseur
                  </Label>
                  <SupplierSelector
                    value={(formData as any).supplier_id || null}
                    onChange={(supplierId, supplierData) => {
                      setFormData(prev => ({
                        ...prev,
                        supplier_id: supplierId,
                        supplier: supplierData // Stocker aussi les données complètes si nécessaire
                      }));
                    }}
                    placeholder="Rechercher et sélectionner un fournisseur..."
                    className="Beenaya-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Référence
                  </Label>
                  <Input
                    id="reference"
                    name="reference"
                    value={(formData as Partial<Material>).reference || ""}
                    onChange={handleChange}
                    placeholder="Référence produit"
                    className="Beenaya-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={(formData as Partial<Material>).code || ""}
                    onChange={handleChange}
                    placeholder="Code produit"
                    className="Beenaya-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="wasteFactor" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Facteur de perte (%)
                  </Label>
                  <Input
                    id="wasteFactor"
                    name="wasteFactor"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={(formData as Partial<Material>).wasteFactor || ""}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="Beenaya-input"
                  />
                </div>
                <div className="space-y-2">
                  {/* Espace réservé pour un futur champ */}
                </div>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Informations spécifiques à la main d'œuvre */}
          {type === "labor" && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Informations professionnelles
                </CardTitle>
                <CardDescription>
                  Détails spécifiques à la main d'œuvre
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="skillLevel" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Niveau de qualification
                  </Label>
                  <Select
                    value={(formData as Partial<Labor>).skillLevel || "skilled"}
                    onValueChange={(value) => handleSelectChange("skillLevel", value)}
                  >
                    <SelectTrigger className="Beenaya-input">
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apprentice">Apprenti</SelectItem>
                      <SelectItem value="skilled">Qualifié</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="specialist">Spécialiste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productivityFactor" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Facteur de productivité
                  </Label>
                  <Input
                    id="productivityFactor"
                    name="productivityFactor"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="3.0"
                    value={(formData as Partial<Labor>).productivityFactor || 1.0}
                    onChange={handleChange}
                    placeholder="1.0"
                    className="Beenaya-input"
                  />
                </div>
              </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto Beenaya-button"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export default LibraryItemForm;