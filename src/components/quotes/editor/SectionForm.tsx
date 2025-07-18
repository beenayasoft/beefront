import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
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
import { EditorQuoteItem } from "@/lib/api/quotes";

interface SectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: EditorQuoteItem) => void;
  item?: Partial<EditorQuoteItem>;
  isEditing?: boolean;
}

export function SectionForm({
  open,
  onOpenChange,
  onSubmit,
  item,
  isEditing = false,
}: SectionFormProps) {
  const [formData, setFormData] = useState<Partial<EditorQuoteItem>>({
    designation: "",
    type: "chapter",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (item && isEditing) {
        setFormData({
          ...item,
        });
      } else {
        setFormData({
          designation: "",
          type: "chapter",
        });
      }
      setErrors({});
    }
  }, [open, item, isEditing]);
  
  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string) => {
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
      newErrors.designation = "Le titre de la section est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      const newItem: EditorQuoteItem = {
        id: item?.id || `section-${Date.now()}`,
        type: formData.type as "chapter" | "section",
        position: item?.position || 0,
        designation: formData.designation || "",
        quantity: 1,
        unitPrice: 0,
        vat_rate: "20",
        discount: 0,
        totalHt: 0,
        totalTtc: 0,
        parent: formData.parent,
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
            {isEditing ? "Modifier la section" : "Ajouter une section"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations de cette section" 
              : "Ajoutez une nouvelle section au devis"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de section</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className="benaya-input">
                  <SelectValue placeholder="Type de section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chapter">Chapitre principal</SelectItem>
                  <SelectItem value="section">Sous-section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation" className={errors.designation ? "text-red-500" : ""}>
                Titre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                className={`benaya-input ${errors.designation ? "border-red-500" : ""}`}
                placeholder="Titre de la section"
              />
              {errors.designation && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.designation}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}