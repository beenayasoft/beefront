import { useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { contactsApi, type UpdateContactRequest } from "../../api/contacts";

// Schema de validation Zod unifié
const contactFormSchema = z.object({
  nom: z.string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[\p{L}\s'-]+$/u, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  
  prenom: z.string()
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .regex(/^[\p{L}\s'-]*$/u, "Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets")
    .optional()
    .or(z.literal("")),
  
  email: z.string()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal("")),
  
  telephone: z.string()
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères")
    .regex(/^$|^\+?[0-9]{10,15}$/, "Le téléphone doit contenir uniquement des chiffres (10-15 caractères), avec un + optionnel au début")
    .optional()
    .or(z.literal("")),
  
  fonction: z.string()
    .max(150, "La fonction ne peut pas dépasser 150 caractères")
    .optional()
    .or(z.literal("")),
  
  is_contact_principal_devis: z.boolean().default(false),
  is_contact_principal_facture: z.boolean().default(false),
}).refine(
  (data) => data.nom.trim() || data.prenom?.trim(),
  {
    message: "Au moins le nom ou le prénom doit être renseigné",
    path: ["nom"],
  }
).refine(
  (data) => !data.email || data.email.includes("@"),
  {
    message: "L'email doit contenir un '@' si renseigné",
    path: ["email"],
  }
);

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  is_contact_principal_devis?: boolean;
  contact_principal_devis?: boolean;
  is_contact_principal_facture?: boolean;
  contact_principal_facture?: boolean;
}

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  contact?: Contact; // Optionnel pour la création
  tierId: string;
  tierName: string;
  mode?: 'create' | 'edit';
}

export function ContactFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  contact,
  tierId,
  tierName,
  mode = contact ? 'edit' : 'create'
}: ContactFormDialogProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      fonction: "",
      is_contact_principal_devis: false,
      is_contact_principal_facture: false,
    },
  });

  const { handleSubmit, formState: { isSubmitting }, reset } = form;

  // Configuration selon le mode
  const isEditing = mode === 'edit';
  const dialogConfig = {
    title: isEditing ? "Modifier le contact" : "Nouveau contact",
    description: isEditing 
      ? `Contact de ${tierName}` 
      : `Ajouter un contact à ${tierName}`,
    submitText: isEditing ? "Sauvegarder" : "Créer le contact",
    loadingText: isEditing ? "Sauvegarde..." : "Création...",
    successTitle: isEditing ? "✅ Contact modifié avec succès" : "✅ Contact créé avec succès",
    errorTitle: isEditing ? "❌ Erreur lors de la modification" : "❌ Erreur lors de la création",
    errorDescription: isEditing 
      ? "Une erreur est survenue lors de la modification du contact. Veuillez réessayer."
      : "Une erreur est survenue lors de la création du contact. Veuillez réessayer."
  };

  // Initialiser le formulaire avec les données du contact (mode édition)
  useEffect(() => {
    if (open) {
      if (isEditing && contact) {
        reset({
          nom: contact.nom || "",
          prenom: contact.prenom || "",
          email: contact.email || "",
          telephone: contact.telephone || "",
          fonction: contact.fonction || "",
          is_contact_principal_devis: contact.is_contact_principal_devis || contact.contact_principal_devis || false,
          is_contact_principal_facture: contact.is_contact_principal_facture || contact.contact_principal_facture || false,
        });
      } else {
        // Mode création - formulaire vide
        reset({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          fonction: "",
          is_contact_principal_devis: false,
          is_contact_principal_facture: false,
        });
      }
    }
  }, [open, contact, reset, isEditing]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      console.log(`🔄 ${isEditing ? 'Modification' : 'Création'} du contact via API:`, {
        contactId: contact?.id,
        tierId,
        values,
        mode
      });

      // Nettoyer et valider les données avant l'envoi
      const cleanData = {
        nom: values.nom.trim(),
        prenom: values.prenom?.trim() || undefined,
        email: values.email?.trim() || undefined,
        telephone: values.telephone?.trim() || undefined,
        fonction: values.fonction?.trim() || undefined,
        is_contact_principal_devis: values.is_contact_principal_devis,
        is_contact_principal_facture: values.is_contact_principal_facture,
      };

      // Enlever les champs undefined pour éviter les erreurs de sérialisation
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData];
        }
      });

      const requestData: UpdateContactRequest & { tier?: string } = cleanData;

      if (isEditing && contact) {
        // Mode édition
        await contactsApi.updateContact(contact.id, requestData);
      } else {
        // Mode création
        await contactsApi.createContact({
          ...requestData,
          tier: tierId // Requis pour la création
        });
      }

      const displayName = [values.prenom, values.nom].filter(Boolean).join(" ");
      
      toast({
        title: dialogConfig.successTitle,
        description: isEditing 
          ? `Les informations de ${displayName} ont été mises à jour.`
          : `${displayName} a été ajouté comme contact de ${tierName}.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(`❌ Erreur lors de la ${isEditing ? 'modification' : 'création'} du contact:`, err);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Prénom du contact"
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
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nom <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom du contact"
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
              name="fonction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isEditing 
                        ? "Directeur, Manager, Technicien..." 
                        : "Conjoint(e), Personne de confiance, Conseiller..."
                      }
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@exemple.com"
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
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+212 6 XX XX XX XX"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="is_contact_principal_devis"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Contact devis</FormLabel>
                      <FormDescription>
                        Reçoit les devis et estimations
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

              <FormField
                control={form.control}
                name="is_contact_principal_facture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Contact facturation</FormLabel>
                      <FormDescription>
                        Reçoit les factures et relances
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
            </div>
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