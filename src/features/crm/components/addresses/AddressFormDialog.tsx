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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CheckCircle2, 
  AlertCircle, 
  Crown,
  Plus,
  Sparkles,
  Mail,
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

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch } = form;
  
  // Surveiller les changements pour calculer la progression
  const watchedValues = watch();
  const formProgress = calculateFormProgress(watchedValues);
  const isFacturationAddress = watchedValues.is_facturation;
  
  // Suggestions de libellés selon le type d'entité
  const libelleSuggestions = getLibelleSuggestions(tierType);

  // Configuration selon le mode
  const isEditing = mode === 'edit';
  const dialogConfig = {
    title: isEditing ? "Modifier l'adresse" : "Nouvelle adresse",
    description: isEditing 
      ? `Adresse de ${tierName}` 
      : `Ajouter une adresse à ${tierName}`,
    icon: isEditing ? MapPin : Plus,
    iconColor: isEditing ? "text-blue-600" : "text-green-600",
    iconBg: isEditing ? "bg-blue-50 dark:bg-blue-950/20" : "bg-green-50 dark:bg-green-950/20",
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

  const getAddressTypeDisplay = () => {
    if (isFacturationAddress) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 animate-pulse">
          <Mail className="w-3 h-3 mr-1" />
          Adresse de facturation
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        <Home className="w-3 h-3 mr-1" />
        Adresse standard
      </Badge>
    );
  };

  const IconComponent = dialogConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 ${dialogConfig.iconBg} rounded-full`}>
                <IconComponent className={`h-5 w-5 ${dialogConfig.iconColor}`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {dialogConfig.title}
                  {!isEditing && <Sparkles className="inline ml-2 h-4 w-4 text-yellow-500" />}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {dialogConfig.description}
                </DialogDescription>
              </div>
            </div>
            
            {/* Progression et statut */}
            <div className="flex items-center gap-3">
              {getAddressTypeDisplay()}
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      formProgress === 100 ? 'bg-green-500' : (isEditing ? 'bg-blue-600' : 'bg-green-600')
                    }`}
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground min-w-[3ch]">
                  {formProgress}%
                </span>
              </div>
            </div>
          </div>

          {/* Message contextuel pour la création */}
          {!isEditing && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/10 mt-4">
              <MapPin className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Astuce :</strong> Une adresse de facturation est automatiquement utilisée pour l'envoi des factures.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        {/* Erreurs globales */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez corriger les erreurs ci-dessous avant de continuer.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire avec scroll */}
        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
              
              {/* Section Libellé avec suggestions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Type d'adresse
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <FormField
                  control={form.control}
                  name="libelle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Libellé
                        <span className="text-red-500">*</span>
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
                        className={`gap-1 text-xs hover:border-current ${suggestion.color} hover:bg-current/5`}
                        disabled={isSubmitting}
                      >
                        <SuggestionIcon className="w-3 h-3" />
                        {suggestion.value}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Section Adresse */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Localisation
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <FormField
                  control={form.control}
                  name="rue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Adresse
                        <span className="text-red-500">*</span>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code_postal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Code postal
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="75001"
                            maxLength={5}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          5 chiffres uniquement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Ville
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Paris"
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
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        Pays
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: France, Gabon, Maroc..."
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Saisissez le nom du pays
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section Statut */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Utilisation
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_facturation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3 rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-600" />
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            Adresse de facturation
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </div>
                      <FormDescription className="text-xs text-muted-foreground">
                        Cette adresse sera utilisée pour l'envoi des factures. Une seule adresse de facturation par tier.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {isFacturationAddress && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/10">
                    <Crown className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Cette adresse sera automatiquement utilisée pour la facturation.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Actions fixes en bas */}
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {formProgress === 100 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Prêt à {isEditing ? 'sauvegarder' : 'créer'}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Informations complétées</span>
                </>
              )}
            </div>
            
            <div className="flex gap-3">
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
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className={`gap-2 min-w-[140px] ${
                  !isEditing ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {dialogConfig.loadingText}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {dialogConfig.submitText}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate form completion percentage
function calculateFormProgress(values: AddressFormValues): number {
  const requiredFields = ['libelle', 'rue', 'code_postal', 'ville'];
  const optionalFields = ['pays'];
  
  const filledRequired = requiredFields.filter(field => {
    const value = values[field as keyof AddressFormValues];
    return typeof value === 'string' && value.trim() !== '';
  });
  
  const filledOptional = optionalFields.filter(field => {
    const value = values[field as keyof AddressFormValues];
    return typeof value === 'string' && value.trim() !== '';
  });
  
  const baseProgress = (filledRequired.length / requiredFields.length) * 80;
  const optionalProgress = (filledOptional.length / optionalFields.length) * 10;
  const statusProgress = values.is_facturation ? 10 : 0;
  
  return Math.round(baseProgress + optionalProgress + statusProgress);
}