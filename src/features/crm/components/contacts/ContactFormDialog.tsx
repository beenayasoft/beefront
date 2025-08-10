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
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Crown,
  FileText,
  UserPlus,
  Sparkles
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

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch } = form;
  
  // Surveiller les changements pour calculer la progression
  const watchedValues = watch();
  const formProgress = calculateFormProgress(watchedValues);
  const hasImportantRole = watchedValues.is_contact_principal_devis || watchedValues.is_contact_principal_facture;

  // Configuration selon le mode
  const isEditing = mode === 'edit';
  const dialogConfig = {
    title: isEditing ? "Modifier le contact" : "Nouveau contact",
    description: isEditing 
      ? `Contact de ${tierName}` 
      : `Ajouter un contact à ${tierName}`,
    icon: isEditing ? User : UserPlus,
    iconColor: isEditing ? "text-blue-600" : "text-green-600",
    iconBg: isEditing ? "bg-blue-50 dark:bg-blue-950/20" : "bg-green-50 dark:bg-green-950/20",
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

  const getContactTypeDisplay = () => {
    if (watchedValues.is_contact_principal_devis && watchedValues.is_contact_principal_facture) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200 animate-pulse">
          <Crown className="w-3 h-3 mr-1" />
          Contact principal
        </Badge>
      );
    }
    if (watchedValues.is_contact_principal_devis) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          <FileText className="w-3 h-3 mr-1" />
          Devis
        </Badge>
      );
    }
    if (watchedValues.is_contact_principal_facture) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <FileText className="w-3 h-3 mr-1" />
          Facturation
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        <User className="w-3 h-3 mr-1" />
        Contact standard
      </Badge>
    );
  };

  const IconComponent = dialogConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-hidden flex flex-col">
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
              {getContactTypeDisplay()}
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
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/10 mt-4">
              <UserPlus className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Astuce :</strong> Un particulier peut avoir plusieurs contacts (conjoint, personne de confiance, conseiller...).
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
              
              {/* Section Identité */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Identité
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormLabel className="flex items-center gap-1">
                          Nom
                          <span className="text-red-500">*</span>
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
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Fonction
                      </FormLabel>
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
                      <FormDescription className="text-xs">
                        {isEditing 
                          ? "Poste ou rôle occupé dans l'entreprise"
                          : "Relation ou rôle de cette personne"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Informations de contact
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
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
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+33123456789 ou 0123456789"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section Rôles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Rôles et responsabilités
                  </h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="is_contact_principal_devis"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-3 rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              Contact devis
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
                          Reçoit les communications relatives aux devis et estimations
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_contact_principal_facture"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-3 rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              Contact facturation
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
                          Reçoit les factures et communications financières
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {hasImportantRole && (
                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/10">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800 dark:text-purple-200">
                      Ce contact aura des responsabilités importantes dans la relation commerciale.
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
                  <span>Informations de base {isEditing ? 'modifiées' : 'saisies'}</span>
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
                      <UserPlus className="w-4 h-4" />
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
function calculateFormProgress(values: ContactFormValues): number {
  const fields = ['nom', 'prenom', 'email', 'telephone', 'fonction'];
  const filledFields = fields.filter(field => {
    const value = values[field as keyof ContactFormValues];
    return typeof value === 'string' && value.trim() !== '';
  });
  
  const baseProgress = (filledFields.length / fields.length) * 80;
  const roleProgress = (values.is_contact_principal_devis || values.is_contact_principal_facture) ? 20 : 0;
  
  return Math.round(baseProgress + roleProgress);
}