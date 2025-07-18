import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LossReason } from "@/lib/types/opportunity";

interface OpportunityLossFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { lossReason: LossReason; lossDescription?: string }) => void;
}

export function OpportunityLossForm({
  open,
  onOpenChange,
  onSubmit,
}: OpportunityLossFormProps) {
  const [lossReason, setLossReason] = useState<LossReason | "">("");
  const [lossDescription, setLossDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!lossReason) {
      newErrors.lossReason = "La raison de la perte est requise";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        lossReason: lossReason as LossReason,
        lossDescription: lossDescription || undefined,
      });
      
      // Réinitialiser le formulaire
      setLossReason("");
      setLossDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Marquer comme perdue</DialogTitle>
          <DialogDescription>
            Veuillez indiquer la raison pour laquelle cette opportunité a été perdue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lossReason" className={errors.lossReason ? "text-red-500" : ""}>
              Raison de la perte <span className="text-red-500">*</span>
            </Label>
            <Select
              value={lossReason}
              onValueChange={(value) => {
                setLossReason(value as LossReason);
                if (errors.lossReason) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.lossReason;
                    return newErrors;
                  });
                }
              }}
            >
              <SelectTrigger className={`benaya-input ${errors.lossReason ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Prix trop élevé</SelectItem>
                <SelectItem value="competitor">Concurrent choisi</SelectItem>
                <SelectItem value="timing">Mauvais timing</SelectItem>
                <SelectItem value="no_budget">Pas de budget</SelectItem>
                <SelectItem value="no_need">Pas de besoin réel</SelectItem>
                <SelectItem value="no_decision">Pas de décision prise</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.lossReason && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.lossReason}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lossDescription">
              Description (optionnelle)
            </Label>
            <Textarea
              id="lossDescription"
              value={lossDescription}
              onChange={(e) => setLossDescription(e.target.value)}
              className="benaya-input resize-none"
              placeholder="Détails supplémentaires sur la raison de la perte"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary">
            <Check className="mr-2 h-4 w-4" />
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}