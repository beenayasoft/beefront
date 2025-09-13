import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Loader2,
  Home, 
  MapPin, 
  Building2,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addressesApi, type CreateAddressRequest, type UpdateAddressRequest } from "../../api/addresses";


// Validation spécialisée pour les adresses françaises
const addressFormSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé est requis")
    .max(100, "Le libellé ne peut pas dépasser 100 caractères"),
  
  rue: z.string()
    .min(1, "L'adresse est requise")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères"),
  
  code_postal: z.string()
    .regex(/^\d{5}$/, "Le code postal doit contenir exactement 5 chiffres")
    .min(5, "Le code postal est requis")
    .max(5, "Le code postal doit contenir exactement 5 chiffres"),
  
  ville: z.string()
    .min(1, "La ville est requise")
    .max(100, "La ville ne peut pas dépasser 100 caractères")
    .regex(/^[\p{L}\s'-]+$/u, "La ville ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  
  pays: z.string()
    .min(1, "Le pays est requis")
    .max(100, "Le pays ne peut pas dépasser 100 caractères")
    .default("France"),
  
  is_facturation: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface Address {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  is_facturation: boolean;
  tier: string;
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  address?: Address; // Optionnel pour la création
  tierId: string;
  tierName: string;
  tierType?: string; // 'entreprise' | 'particulier'
  mode?: 'create' | 'edit';
}

// Suggestions de libellés selon le type d'entité
const getLibelleSuggestions = (tierType?: string) => {
  if (tierType === 'entreprise') {
    return [
      { value: "Siège social", icon: Building2, color: "text-blue-600" },
      { value: "Agence", icon: Building2, color: "text-purple-600" },
      { value: "Entrepôt", icon: Building2, color: "text-orange-600" },
      { value: "Filiale", icon: Building2, color: "text-green-600" },
      { value: "Bureau", icon: Building2, color: "text-cyan-600" }
    ];
  } else {
    return [
      { value: "Domicile", icon: Home, color: "text-green-600" },
      { value: "Résidence secondaire", icon: Home, color: "text-blue-600" },
      { value: "Travail", icon: Building2, color: "text-purple-600" },
      { value: "Famille", icon: Home, color: "text-pink-600" },
      { value: "Autre", icon: MapPin, color: "text-gray-600" }
    ];
  }
};

export function AddressFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  address,
  tierId,
  tierName,
  tierType,
  mode = address ? 'edit' : 'create'
}: AddressFormDialogProps) {
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      libelle: "",
      rue: "",
      code_postal: "",
      ville: "",
      pays: "France",
      is_facturation: false,
    },
  });

  const { handleSubmit, formState: { isSubmitting }, reset } = form;
  
  // Suggestions de libellés selon le type d'entité
  const libelleSuggestions = getLibelleSuggestions(tierType);

  // Configuration selon le mode
  const isEditing = mode === 'edit';
  const dialogConfig = {
    title: isEditing ? "Modifier l'adresse" : "Nouvelle adresse",
    description: isEditing 
      ? `Adresse de ${tierName}` 
      : `Ajouter une adresse à ${tierName}`,
    submitText: isEditing ? "Sauvegarder" : "Créer l'adresse",
    loadingText: isEditing ? "Sauvegarde..." : "Création...",
    successTitle: isEditing ? "✅ Adresse modifiée avec succès" : "✅ Adresse créée avec succès",
    errorTitle: isEditing ? "❌ Erreur lors de la modification" : "❌ Erreur lors de la création",
    errorDescription: isEditing 
      ? "Une erreur est survenue lors de la modification de l'adresse. Veuillez réessayer."
      : "Une erreur est survenue lors de la création de l'adresse. Veuillez réessayer."
  };

  // Initialiser le formulaire avec les données de l'adresse (mode édition)
  useEffect(() => {
    if (open) {
      if (isEditing && address) {
        reset({
          libelle: address.libelle || "",
          rue: address.rue || "",
          code_postal: address.code_postal || "",
          ville: address.ville || "",
          pays: address.pays || "France",
          is_facturation: address.is_facturation || false,
        });
      } else {
        // Mode création - formulaire vide avec valeurs par défaut
        reset({
          libelle: "",
          rue: "",
          code_postal: "",
          ville: "",
          pays: "France",
          is_facturation: false,
        });
      }
    }
  }, [open, address, reset, isEditing]);

  const onSubmit = async (values: AddressFormValues) => {
    try {
      console.log(`🔄 ${isEditing ? 'Modification' : 'Création'} de l'adresse via API:`, {
        addressId: address?.id,
        tierId,
        values,
        mode
      });

      // Nettoyer et valider les données avant l'envoi
      const cleanData = {
        libelle: values.libelle.trim(),
        rue: values.rue.trim(),
        code_postal: values.code_postal.trim(),
        ville: values.ville.trim(),
        pays: values.pays.trim(),
        is_facturation: values.is_facturation,
      };

      if (isEditing && address) {
        // Mode édition
        const updateData: UpdateAddressRequest = cleanData;
        await addressesApi.updateAddress(address.id, updateData);
      } else {
        // Mode création
        const createData: CreateAddressRequest = {
          ...cleanData,
          tier: tierId // Requis pour la création
        };
        await addressesApi.createAddress(createData);
      }

      const displayName = values.libelle || `${values.rue}, ${values.ville}`;
      
      toast({
        title: dialogConfig.successTitle,
        description: isEditing 
          ? `L'adresse "${displayName}" a été mise à jour.`
          : `L'adresse "${displayName}" a été ajoutée à ${tierName}.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(`❌ Erreur lors de la ${isEditing ? 'modification' : 'création'} de l'adresse:`, err);
      toast({
        variant: "destructive",
        title: dialogConfig.errorTitle,
        description: dialogConfig.errorDescription,
      });
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleLibelleSuggestionClick = (suggestion: string) => {
    form.setValue('libelle', suggestion, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogConfig.title}</DialogTitle>
          <DialogDescription>
            {dialogConfig.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="libelle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Libellé <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Siège social, Domicile..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Suggestions de libellés */}
            <div className="flex flex-wrap gap-2">
              {libelleSuggestions.map((suggestion) => {
                const SuggestionIcon = suggestion.icon;
                return (
                  <Button
                    key={suggestion.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLibelleSuggestionClick(suggestion.value)}
                    className="gap-1 text-xs"
                    disabled={isSubmitting}
                  >
                    <SuggestionIcon className="w-3 h-3" />
                    {suggestion.value}
                  </Button>
                );
              })}
            </div>
            
            <FormField
              control={form.control}
              name="rue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Adresse <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 rue de la République"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code_postal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Code postal <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="20000"
                        maxLength={5}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ville <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Casablanca"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Maroc"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_facturation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Adresse de facturation</FormLabel>
                    <FormDescription>
                      Utilisée pour l'envoi des factures
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {dialogConfig.loadingText}
              </>
            ) : (
              dialogConfig.submitText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}