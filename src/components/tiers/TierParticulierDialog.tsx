import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParticulierForm } from "./ParticulierForm";
import { ParticulierFormValues } from "./types/particulier";
import { useState } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { transformParticulierToTier, validateBeforeTransform } from "./utils/adaptateurs";

interface TierParticulierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TierParticulierDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: TierParticulierDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ParticulierFormValues) => {
    console.log("Creating particulier with values:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'particulier');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformParticulierToTier(values);
      
      // Créer le tier via l'API
      await tiersApi.createTier(tierData);
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error creating particulier:", err);
      
      let errorMessage = "Une erreur est survenue lors de la création du particulier";
      if (err instanceof Error) {
        if (err.message.includes('email')) {
          errorMessage = "Cette adresse email est déjà utilisée par un autre tiers.";
        } else if (err.message.includes('nom')) {
          errorMessage = "Ce nom est déjà utilisé. Vérifiez les informations saisies.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            👤 Nouveau particulier
          </DialogTitle>
          <DialogDescription>
            Créer un nouveau particulier (personne physique)
          </DialogDescription>
        </DialogHeader>
        
        <ParticulierForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
} 