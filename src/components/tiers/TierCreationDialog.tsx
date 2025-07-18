import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntrepriseForm } from "./EntrepriseForm";
import { ParticulierForm } from "./ParticulierForm";
import { EntityType } from "./types";
import { EntrepriseFormValues } from "./types/entreprise";
import { ParticulierFormValues } from "./types/particulier";
import { useState } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { 
  transformEntrepriseToTier, 
  transformParticulierToTier,
  validateBeforeTransform 
} from "./utils/adaptateurs";
import { Building2, User } from "lucide-react";

interface TierCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdTierId?: string) => void;
  entityType: EntityType;
}

const entityTypeConfig = {
  entreprise: {
    icon: Building2,
    title: "🏢 Nouvelle entreprise",
    description: "Créer une nouvelle entreprise (société, SARL, SAS, association...)",
    successMessage: "L'entreprise a été créée avec succès !",
    errorMessage: "Une erreur est survenue lors de la création de l'entreprise",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  particulier: {
    icon: User,
    title: "👤 Nouveau particulier",
    description: "Créer un nouveau particulier (personne physique)",
    successMessage: "Le particulier a été créé avec succès !",
    errorMessage: "Une erreur est survenue lors de la création du particulier",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

export function TierCreationDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  entityType
}: TierCreationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = entityTypeConfig[entityType];

  const handleEntrepriseSubmit = async (values: EntrepriseFormValues) => {
    console.log(`Creating entreprise with values:`, values);
    
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
      const newTier = await tiersApi.createTier(tierData);
      console.log(`Entreprise created successfully:`, newTier);
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.(newTier.id);
    } catch (err) {
      console.error(`Error creating entreprise:`, err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParticulierSubmit = async (values: ParticulierFormValues) => {
    console.log(`Creating particulier with values:`, values);
    
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
      const newTier = await tiersApi.createTier(tierData);
      console.log(`Particulier created successfully:`, newTier);
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.(newTier.id);
    } catch (err) {
      console.error(`Error creating particulier:`, err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err: unknown) => {
    let errorMessage = config.errorMessage;
    
    if (err instanceof Error) {
      // Messages d'erreur personnalisés selon le type
      if (err.message.includes('SIRET')) {
        errorMessage = "Erreur avec le numéro SIRET. Vérifiez qu'il soit valide et unique.";
      } else if (err.message.includes('email')) {
        errorMessage = "Cette adresse email est déjà utilisée par un autre tiers.";
      } else if (err.message.includes('network') || err.message.includes('Network')) {
        errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
      } else if (err.message.includes('raison sociale')) {
        errorMessage = "Cette raison sociale existe déjà. Choisissez un nom différent.";
      } else if (err.message.includes('nom')) {
        errorMessage = "Ce nom est déjà utilisé. Vérifiez les informations saisies.";
      } else {
        errorMessage = err.message;
      }
    }
    
    setError(errorMessage);
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
        <DialogHeader className="pb-4">
          <DialogTitle className={`flex items-center gap-2 text-xl ${config.color}`}>
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.description}
          </DialogDescription>
          
          {/* Barre de progression visuelle modernisée */}
          <div className={`mt-4 p-3 rounded-lg ${config.bgColor} border`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Étape 2 sur 2</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">Type sélectionné</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${entityType === 'entreprise' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <span className={entityType === 'entreprise' ? 'text-blue-700' : 'text-green-700'}>
                    Informations {entityType === 'entreprise' ? 'entreprise' : 'particulier'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        {/* Rendu conditionnel des formulaires spécialisés */}
        {entityType === 'entreprise' ? (
          <EntrepriseForm
            onSubmit={handleEntrepriseSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
          />
        ) : (
          <ParticulierForm
            onSubmit={handleParticulierSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 