import { useState, useEffect } from "react";
import { Check, AlertCircle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoiceItem } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface DiscountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: InvoiceItem) => void;
  item?: Partial<InvoiceItem>;
  isEditing?: boolean;
  invoiceTotal: number;
}

export function DiscountForm({
  open,
  onOpenChange,
  onSubmit,
  item,
  isEditing = false,
  invoiceTotal,
}: DiscountFormProps) {
  const [formData, setFormData] = useState<{
    designation: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  }>({
    designation: "Remise globale",
    discountType: "percentage",
    discountValue: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  
  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (item && isEditing) {
        // Pour l'édition, extraire les valeurs du discount existant
        const isPercentage = item.designation?.includes('%');
        const value = isPercentage 
          ? parseFloat(item.designation?.split('(')[1]?.split('%')[0] || "0") 
          : Math.abs(item.totalHT || 0);
        
        setFormData({
          designation: item.designation || "Remise globale",
          discountType: isPercentage ? "percentage" : "fixed",
          discountValue: value,
        });
      } else {
        setFormData({
          designation: "Remise globale",
          discountType: "percentage",
          discountValue: 0,
        });
      }
      setErrors({});
    }
  }, [open, item, isEditing]);
  
  // Calculer le montant de la remise
  useEffect(() => {
    if (formData.discountType === "percentage") {
      setCalculatedAmount(invoiceTotal * (formData.discountValue / 100));
    } else {
      setCalculatedAmount(formData.discountValue);
    }
  }, [formData.discountType, formData.discountValue, invoiceTotal]);
  
  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.designation) {
      newErrors.designation = "La désignation est requise";
    }
    
    if (formData.discountValue < 0) {
      newErrors.discountValue = "La valeur doit être positive";
    }
    
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      newErrors.discountValue = "Le pourcentage ne peut pas dépasser 100%";
    }
    
    if (formData.discountType === "fixed" && formData.discountValue > invoiceTotal) {
      newErrors.discountValue = "La remise ne peut pas dépasser le montant total";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      // Créer la désignation avec le pourcentage si nécessaire
      const designation = formData.discountType === "percentage"
        ? `${formData.designation} (${formData.discountValue}%)`
        : formData.designation;
      
      // Créer l'élément de remise avec des montants négatifs
      const newItem: InvoiceItem = {
        id: item?.id || `discount-${Date.now()}`,
        type: "discount",
        position: item?.position || 0,
        designation,
        quantity: 1,
        unitPrice: -calculatedAmount, // Montant négatif
        vatRate: 20, // Même taux que le reste de la facture
        totalHT: -calculatedAmount, // Montant négatif
        totalTTC: -calculatedAmount * 1.2, // Montant négatif avec TVA
      };
      
      onSubmit(newItem);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Modifier la remise" : "Ajouter une remise globale"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les paramètres de cette remise" 
              : "Appliquez une remise sur le montant total de la facture"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designation" className={errors.designation ? "text-red-500" : ""}>
                Libellé <span className="text-red-500">*</span>
              </Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                className={`benaya-input ${errors.designation ? "border-red-500" : ""}`}
                placeholder="Remise globale"
              />
              {errors.designation && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.designation}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Type de remise</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(value: "percentage" | "fixed") => handleInputChange("discountType", value)}
                >
                  <SelectTrigger className="benaya-input">
                    <SelectValue placeholder="Type de remise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (MAD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountValue" className={errors.discountValue ? "text-red-500" : ""}>
                  Valeur <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange("discountValue", parseFloat(e.target.value))}
                    className={`benaya-input ${errors.discountValue ? "border-red-500" : ""} ${formData.discountType === "percentage" ? "pr-8" : ""}`}
                  />
                  {formData.discountType === "percentage" && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Percent className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>
                {errors.discountValue && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.discountValue}
                  </p>
                )}
              </div>
            </div>
            
            {/* Aperçu du montant */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex justify-between font-semibold">
                <span>Montant de la remise:</span>
                <span className="text-red-600 dark:text-red-400">
                  -{formatCurrency(calculatedAmount)} MAD
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Total avant remise:</span>
                <span>{formatCurrency(invoiceTotal)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total après remise:</span>
                <span>{formatCurrency(invoiceTotal - calculatedAmount)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            {isEditing ? "Mettre à jour" : "Appliquer la remise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}