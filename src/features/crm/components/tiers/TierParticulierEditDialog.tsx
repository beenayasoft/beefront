import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParticulierForm } from "./ParticulierForm";
import { ParticulierFormValues } from "./types/particulier";
import { useState, useEffect } from "react";
import { transformParticulierToTier, validateBeforeTransform } from "./utils/adaptateurs";
import { Tier } from "../../types/crm.types";
import { useTierMutations, useTierDetail } from "../../hooks/useTiers";

interface TierParticulierEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tier: Tier; // Tier existant à éditer
}

export function TierParticulierEditDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  tier
}: TierParticulierEditDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<ParticulierFormValues | undefined>(undefined);
  
  // ✅ Utiliser les mutations et query React Query
  const { updateTier } = useTierMutations();
  const { data: tierDetail, isLoading: loadingDetail } = useTierDetail(tier.id, open);

  // Préparer les valeurs initiales depuis les données du tier
  useEffect(() => {
    if (tierDetail && open && !loadingDetail) {
      console.log("TierParticulierEditDialog: Préparation des valeurs initiales pour:", tierDetail);
      
      try {
        const data = tierDetail;
          
          console.log("TierParticulierEditDialog: Données complètes reçues:", data);
          
          // Extraire les contacts et adresses de la structure onglets si nécessaire
          let contacts = data.contacts || [];
          let adresses = data.adresses || [];
          
          // Si les données sont dans la structure 'onglets', les extraire
          if (data.onglets) {
            console.log("Structure avec onglets détectée, extraction des données...");
            if (data.onglets.contacts) {
              contacts = data.onglets.contacts;
            }
            if (data.onglets.infos && data.onglets.infos.adresses) {
              adresses = data.onglets.infos.adresses;
            }
          }
          
          console.log("Contacts extraits:", contacts);
          console.log("Adresses extraites:", adresses);
          
          // Pour un particulier, le nom principal est dans le champ "nom"
          // Nous devons séparer nom/prénom correctement pour éviter la duplication
          const contactPrincipal = contacts.find((c: any) => c.contact_principal_devis) || contacts[0];
          
          // Récupérer la relation du tier (client, prospect, etc.)
          const relation = data.relation || tier.type?.[0] || '';
          console.log("Relation extraite:", relation);
          
          // ✅ CORRECTION : Séparer correctement nom et prénom
          let nomParticulier = '';
          let prenomParticulier = '';
          
          if (contactPrincipal) {
            // Si on a un contact principal avec prénom/nom séparés
            prenomParticulier = contactPrincipal.prenom || '';
            nomParticulier = contactPrincipal.nom || '';
            console.log("📝 Depuis contact principal:", { prenom: prenomParticulier, nom: nomParticulier });
          }
          
          // Si pas de contact ou données incomplètes, essayer de parser data.nom
          if (!prenomParticulier && !nomParticulier && data.nom) {
            const nomComplet = data.nom.trim();
            const parties = nomComplet.split(' ');
            if (parties.length >= 2) {
              prenomParticulier = parties[0];
              nomParticulier = parties.slice(1).join(' ');
            } else {
              nomParticulier = nomComplet;
            }
            console.log("📝 Depuis nom complet:", { original: data.nom, prenom: prenomParticulier, nom: nomParticulier });
          }
          
          // Transformer les données en format ParticulierFormValues
          const formValues: ParticulierFormValues = {
            nom: nomParticulier,
            prenom: prenomParticulier,
            email: contactPrincipal?.email || '',
            telephone: contactPrincipal?.telephone || '',
            relation: relation ? [relation] : [],
            status: data.is_deleted ? 'inactive' : 'active',
            
            // Transformer les adresses
            adresses: adresses.map((adresse: any) => ({
              id: adresse.id,
              libelle: adresse.libelle || '',
              rue: adresse.rue || '',
              ville: adresse.ville || '',
              codePostal: adresse.code_postal || '',
              pays: adresse.pays || 'France',
              facturation: adresse.facturation || false,
            })),
          };
          
          console.log("TierParticulierEditDialog: Valeurs transformées:", formValues);
          setInitialValues(formValues);
        } catch (err) {
          console.error("TierParticulierEditDialog: Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données du particulier");
        }
    }
  }, [tierDetail?.id, open, loadingDetail]); // ✅ Utiliser seulement l'ID pour éviter les boucles

  const handleSubmit = async (values: ParticulierFormValues) => {
    console.log("TierParticulierEditDialog: Modification particulier avec valeurs:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'particulier');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformParticulierToTier(values, tier.id);
      
      // ✅ Utiliser la mutation React Query - gère automatiquement le cache
      await updateTier.mutateAsync({ id: tier.id, data: tierData });
      console.log("TierParticulierEditDialog: Particulier modifié avec succès");
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("TierParticulierEditDialog: Erreur lors de la modification:", err);
      
      let errorMessage = "Une erreur est survenue lors de la modification du particulier";
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
    }
  };

  const handleCancel = () => {
    if (!updateTier.isPending) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            👤 Modifier le particulier
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du particulier "{tier.nom}"
          </DialogDescription>
        </DialogHeader>
        
        {loadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3">Chargement des données...</span>
          </div>
        ) : initialValues ? (
          <ParticulierForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={updateTier.isPending}
            error={error}
            initialValues={initialValues}
            isEditing={true}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-600">Erreur lors du chargement des données</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 