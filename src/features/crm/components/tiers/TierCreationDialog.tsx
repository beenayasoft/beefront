import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntrepriseForm } from "./EntrepriseForm";
import { ParticulierForm } from "./ParticulierForm";
import { ModalTypeSelector } from "./ModalTypeSelector";
import { EntityType } from "./types";
import { EntrepriseFormValues } from "./types/entreprise";
import { ParticulierFormValues } from "./types/particulier";
import { useState, useEffect } from "react";
import { tiersApi } from "@/features/crm/api";
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
  entityType?: EntityType;
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
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const config = entityTypeConfig[selectedEntityType || entityType || 'entreprise'] || entityTypeConfig.entreprise;

  // Surveiller les changements de la prop open
  useEffect(() => {
    // Si la modale est fermée, réinitialiser tous les états
    if (!open) {
      setSelectedEntityType(null);
      setShowForm(false);
      setError(null);
    }
  }, [open]);

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Réinitialiser immédiatement tous les états lorsque la modale est fermée
      setSelectedEntityType(null);
      setShowForm(false);
      setError(null);
    }
    onOpenChange(open);
  };

  const handleTypeSelect = (type: EntityType) => {
    setSelectedEntityType(type);
    setShowForm(true);
  };

  const handleBackToTypeSelector = () => {
    setShowForm(false);
    setError(null);
  };

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
    
    // Gestion des erreurs Axios
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as any;
      
      if (axiosError.response?.status === 400 && axiosError.response?.data) {
        // Erreurs de validation du serveur
        const data = axiosError.response.data;
        
        if (data.nom && Array.isArray(data.nom)) {
          errorMessage = data.nom[0];
        } else if (data.siret && Array.isArray(data.siret)) {
          errorMessage = `SIRET: ${data.siret[0]}`;
        } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors[0];
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else {
          errorMessage = "Erreur de validation. Vérifiez les informations saisies.";
        }
      } else if (axiosError.response?.status === 500) {
        errorMessage = "Erreur interne du serveur. Le tier a peut-être été créé malgré l'erreur. Veuillez actualiser la page.";
      }
    } else if (err instanceof Error) {
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
      // Réinitialiser les états et fermer la modale
      setError(null);
      setSelectedEntityType(null);
      setShowForm(false);
      onOpenChange(false);
    }
  };

  // Si aucun type n'est sélectionné et qu'on n'affiche pas le formulaire, afficher le sélecteur
  // Ignorer entityType passé en prop pour toujours afficher le sélecteur d'abord
  if (!showForm && !selectedEntityType) {
    return (
      <ModalTypeSelector
        open={open}
        onSelect={handleTypeSelect}
        onOpenChange={handleOpenChange}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <div className={`w-2 h-2 rounded-full animate-pulse ${(selectedEntityType || entityType) === 'entreprise' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <span className={(selectedEntityType || entityType) === 'entreprise' ? 'text-blue-700' : 'text-green-700'}>
                    Informations {(selectedEntityType || entityType) === 'entreprise' ? 'entreprise' : 'particulier'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        {/* Rendu conditionnel des formulaires spécialisés */}
        {(selectedEntityType || entityType) === 'entreprise' ? (
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