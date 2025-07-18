import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  EntrepriseFormValues, 
  defaultEntrepriseValues,
  entrepriseFormSchema,
  validateEntreprise,
  ContactEntreprise,
  AdresseEntreprise
} from "../types/entreprise";
import { TierFormError } from "../types/errors";

interface UseEntrepriseFormOptions {
  onSubmit?: (values: EntrepriseFormValues) => Promise<void>;
  initialValues?: Partial<EntrepriseFormValues>;
  mode?: "create" | "edit";
}

export const useEntrepriseForm = (options: UseEntrepriseFormOptions = {}) => {
  const {
    onSubmit,
    initialValues = {},
    mode = "create"
  } = options;

  // États de gestion
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<TierFormError[]>([]);
  const [currentStep, setCurrentStep] = useState<"general" | "contacts" | "adresses">("general");

  // Valeurs combinées avec les valeurs par défaut
  const combinedInitialValues: EntrepriseFormValues = {
    ...defaultEntrepriseValues,
    ...initialValues,
  };

  // Configuration du formulaire React Hook Form
  const form = useForm<EntrepriseFormValues>({
    resolver: zodResolver(entrepriseFormSchema),
    defaultValues: combinedInitialValues,
    mode: "onChange",
  });

  // Validation personnalisée
  const validateForm = useCallback((values: EntrepriseFormValues): boolean => {
    const validation = validateEntreprise(values);
    
    if (!validation.isValid) {
      setErrors(validation.errors.map(msg => ({
        field: "general",
        message: msg,
        type: "validation"
      })));
      return false;
    }
    
    setErrors([]);
    return true;
  }, []);

  // Soumission du formulaire
  const handleSubmit = useCallback(async (values: EntrepriseFormValues) => {
    if (!validateForm(values)) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setErrors([{
        field: "general",
        message: "Une erreur est survenue lors de l'enregistrement",
        type: "api"
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, validateForm]);

  // Gestion des contacts
  const addContact = useCallback(() => {
    const currentContacts = form.getValues("contacts");
    const newContact: ContactEntreprise = {
      nom: "",
      prenom: "",
      fonction: "",
      email: "",
      telephone: "",
      contactPrincipalDevis: currentContacts.length === 0, // Premier contact = principal par défaut
      contactPrincipalFacture: currentContacts.length === 0,
    };
    
    form.setValue("contacts", [...currentContacts, newContact]);
  }, [form]);

  const removeContact = useCallback((index: number) => {
    const currentContacts = form.getValues("contacts");
    const updatedContacts = currentContacts.filter((_, i) => i !== index);
    form.setValue("contacts", updatedContacts);
  }, [form]);

  const updateContact = useCallback((index: number, contact: ContactEntreprise) => {
    const currentContacts = form.getValues("contacts");
    const updatedContacts = [...currentContacts];
    updatedContacts[index] = contact;
    form.setValue("contacts", updatedContacts);
  }, [form]);

  const setContactPrincipal = useCallback((index: number, type: "devis" | "facture") => {
    const currentContacts = form.getValues("contacts");
    const updatedContacts = currentContacts.map((contact, i) => ({
      ...contact,
      ...(type === "devis" 
        ? { contactPrincipalDevis: i === index }
        : { contactPrincipalFacture: i === index }
      )
    }));
    form.setValue("contacts", updatedContacts);
  }, [form]);

  // Gestion des adresses
  const addAdresse = useCallback(() => {
    const currentAdresses = form.getValues("adresses");
    const newAdresse: AdresseEntreprise = {
      libelle: currentAdresses.length === 0 ? "Siège social" : "Adresse secondaire",
      rue: "",
      ville: "",
      codePostal: "",
      pays: "France",
      facturation: currentAdresses.length === 0, // Première adresse = facturation par défaut
    };
    
    form.setValue("adresses", [...currentAdresses, newAdresse]);
  }, [form]);

  const removeAdresse = useCallback((index: number) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = currentAdresses.filter((_, i) => i !== index);
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  const updateAdresse = useCallback((index: number, adresse: AdresseEntreprise) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = [...currentAdresses];
    updatedAdresses[index] = adresse;
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  const setAdresseFacturation = useCallback((index: number) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = currentAdresses.map((adresse, i) => ({
      ...adresse,
      facturation: i === index
    }));
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  // Utilitaires
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const formError = form.formState.errors[fieldName as keyof EntrepriseFormValues];
    if (formError?.message) return formError.message;
    
    const customError = errors.find(err => err.field === fieldName);
    return customError?.message;
  }, [form.formState.errors, errors]);

  const isFieldRequired = useCallback((fieldName: string): boolean => {
    return ["raisonSociale", "flags"].includes(fieldName);
  }, []);

  const hasErrors = errors.length > 0 || Object.keys(form.formState.errors).length > 0;

  const canSubmit = form.formState.isValid && !isLoading && !hasErrors;

  // Progression du formulaire
  const getFormProgress = useCallback((): number => {
    const values = form.getValues();
    let filledFields = 0;
    let totalFields = 7; // Champs de base

    // Champs obligatoires et recommandés
    if (values.raisonSociale) filledFields++;
    if (values.flags.length > 0) filledFields++;
    if (values.siret) filledFields++;
    if (values.numeroTVA) filledFields++;
    if (values.formeJuridique) filledFields++;
    if (values.contacts.length > 0) filledFields++;
    if (values.adresses.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  }, [form]);

  return {
    // Form control
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    reset: form.reset,
    watch: form.watch,
    setValue: form.setValue,
    
    // State
    isLoading,
    errors,
    hasErrors,
    canSubmit,
    mode,
    currentStep,
    setCurrentStep,
    
    // Validation
    validateForm,
    getFieldError,
    isFieldRequired,
    getFormProgress,
    
    // Contacts management
    addContact,
    removeContact,
    updateContact,
    setContactPrincipal,
    
    // Adresses management
    addAdresse,
    removeAdresse,
    updateAdresse,
    setAdresseFacturation,
  };
}; 