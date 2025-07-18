import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntrepriseForm } from "./EntrepriseForm";
import { EntrepriseFormValues } from "./types/entreprise";
import { useState } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { transformEntrepriseToTier, validateBeforeTransform } from "./utils/adaptateurs";

interface TierEntrepriseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TierEntrepriseDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: TierEntrepriseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: EntrepriseFormValues) => {
    console.log("Creating enterprise with values:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'entreprise');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformEntrepriseToTier(values);
      
      // Créer le tier via l'API
      await tiersApi.createTier(tierData);
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error creating enterprise:", err);
      
      let errorMessage = "Une erreur est survenue lors de la création de l'entreprise";
      if (err instanceof Error) {
        if (err.message.includes('SIRET')) {
          errorMessage = "Erreur avec le numéro SIRET. Vérifiez qu'il soit valide et unique.";
        } else if (err.message.includes('raison sociale')) {
          errorMessage = "Cette raison sociale existe déjà. Choisissez un nom différent.";
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
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            🏢 Nouvelle entreprise
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle entreprise (société, SARL, SAS, association...)
          </DialogDescription>
        </DialogHeader>
        
        <EntrepriseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
} 