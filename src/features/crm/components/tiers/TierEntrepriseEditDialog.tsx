import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntrepriseForm } from "./EntrepriseForm";
import { EntrepriseFormValues } from "./types/entreprise";
import { useState, useEffect } from "react";
import { transformEntrepriseToTier, validateBeforeTransform } from "./utils/adaptateurs";
import { Tier } from "./types";
import { useTierMutations, useTierDetail } from "../../hooks/useTiers";

interface TierEntrepriseEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tier: Tier; // Tier existant à éditer
}

export function TierEntrepriseEditDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  tier
}: TierEntrepriseEditDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<EntrepriseFormValues | undefined>(undefined);
  
  // ✅ Utiliser les mutations et query React Query
  const { updateTier } = useTierMutations();
  const { data: tierDetail, isLoading: loadingDetail } = useTierDetail(tier.id, open);

  // Préparer les valeurs initiales depuis les données React Query
  useEffect(() => {
    if (tierDetail && open && !loadingDetail) {
      console.log("TierEntrepriseEditDialog: Préparation des valeurs initiales pour:", tierDetail);
      
      try {
        const data = tierDetail;
          console.log("TierEntrepriseEditDialog: Données complètes reçues:", data);
          console.log("🔍 Analyse des champs entreprise:", {
            nom: data.nom,
            siret: data.siret,
            tva: data.tva,
            flags: data.flags,
            is_deleted: data.is_deleted,
            hasOnglets: !!data.onglets
          });
          
          // Extraire les contacts et adresses de la structure onglets si nécessaire
          let contacts = data.contacts || [];
          let adresses = data.adresses || [];
          
          // Si les données sont dans la structure 'onglets', les extraire
          if (data.onglets) {
            console.log("Structure avec onglets détectée, extraction des données...");
            console.log("🔍 Structure complète data.onglets:", data.onglets);
            
            if (data.onglets.contacts) {
              contacts = data.onglets.contacts;
              console.log("📋 Contacts depuis onglets:", contacts);
            }
            if (data.onglets.infos && data.onglets.infos.adresses) {
              adresses = data.onglets.infos.adresses;
              console.log("🏠 Adresses depuis onglets.infos.adresses:", adresses);
            }
            
            // ✅ CORRECTION : Vérifier aussi dans onglets.adresses au cas où
            if (data.onglets.adresses && data.onglets.adresses.length > 0) {
              adresses = data.onglets.adresses;
              console.log("🏠 Adresses depuis onglets.adresses:", adresses);
            }
            
            // ✅ Vérifier si les infos entreprise sont dans onglets
            if (data.onglets.infos) {
              console.log("🏢 Infos entreprise dans onglets:", data.onglets.infos);
            }
          }
          
          console.log("Contacts extraits:", contacts);
          console.log("Adresses extraites:", adresses);
          
          // ✅ CORRECTION : Récupérer les données d'entreprise depuis onglets si disponibles
          let siretEntreprise = data.siret || '';
          let tvaEntreprise = data.tva || '';
          
          // ✅ CORRECTION : Récupérer la relation et la convertir en flags
          const relationEntreprise = data.relation || '';
          const flagsEntreprise = relationEntreprise ? [relationEntreprise] : [];
          
          console.log("🏢 Mapping relation -> flags:", {
            relation: relationEntreprise,
            flags: flagsEntreprise
          });
          
          // Vérifier si les infos sont dans onglets.infos
          if (data.onglets && data.onglets.infos) {
            const infos = data.onglets.infos;
            siretEntreprise = infos.siret || siretEntreprise;
            tvaEntreprise = infos.tva || infos.numeroTVA || tvaEntreprise;
            console.log("🔧 Données entreprise depuis onglets:", {
              siret: siretEntreprise,
              tva: tvaEntreprise
            });
          }
          
          // Transformer les données en format EntrepriseFormValues
          const formValues: EntrepriseFormValues = {
            nom: data.nom || '', // ✅ CORRECTION : 'nom' pas 'raisonSociale'
            siret: siretEntreprise,
            tva: tvaEntreprise,
            flags: flagsEntreprise, // ✅ CORRECTION : Utiliser la relation convertie
            status: data.is_deleted ? 'inactive' : 'active',
            
            // Transformer les contacts
            contacts: contacts.map((contact: any) => ({
              id: contact.id,
              prenom: contact.prenom || '',
              nom: contact.nom || '',
              fonction: contact.fonction || '',
              email: contact.email || '',
              telephone: contact.telephone || '',
              contactPrincipalDevis: contact.contact_principal_devis || false,
              contactPrincipalFacture: contact.contact_principal_facture || false,
            })),
            
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
          
          console.log("TierEntrepriseEditDialog: Valeurs transformées:", formValues);
          setInitialValues(formValues);
        } catch (err) {
          console.error("TierEntrepriseEditDialog: Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données de l'entreprise");
        }
    }
  }, [tierDetail?.id, open, loadingDetail]); // ✅ Utiliser seulement l'ID pour éviter les boucles

  const handleSubmit = async (values: EntrepriseFormValues) => {
    console.log("TierEntrepriseEditDialog: Modification entreprise avec valeurs:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'entreprise');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformEntrepriseToTier(values, tier.id);
      
      // ✅ Utiliser la mutation React Query - gère automatiquement le cache
      await updateTier.mutateAsync({ id: tier.id, data: tierData });
      console.log("TierEntrepriseEditDialog: Entreprise modifiée avec succès");
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("TierEntrepriseEditDialog: Erreur lors de la modification:", err);
      
      let errorMessage = "Une erreur est survenue lors de la modification de l'entreprise";
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
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            🏢 Modifier l'entreprise
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'entreprise "{tier.nom}"
          </DialogDescription>
        </DialogHeader>
        
        {loadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Chargement des données...</span>
          </div>
        ) : initialValues ? (
          <EntrepriseForm
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
