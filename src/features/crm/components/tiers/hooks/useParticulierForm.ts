import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  ParticulierFormValues, 
  defaultParticulierValues,
  particulierFormSchema,
  validateParticulier,
  AdresseParticulier,
  getFullName,
  getAdressePrincipale
} from "../types/particulier";
import { TierFormError } from "../types/errors";

interface UseParticulierFormOptions {
  onSubmit?: (values: ParticulierFormValues) => Promise<void>;
  initialValues?: Partial<ParticulierFormValues>;
  mode?: "create" | "edit";
}

export const useParticulierForm = (options: UseParticulierFormOptions = {}) => {
  const {
    onSubmit,
    initialValues = {},
    mode = "create"
  } = options;

  // États de gestion
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<TierFormError[]>([]);
  const [currentStep, setCurrentStep] = useState<"general" | "adresses" | "notes">("general");

  // Valeurs combinées avec les valeurs par défaut
  const combinedInitialValues: ParticulierFormValues = {
    ...defaultParticulierValues,
    ...initialValues,
  };

  // Configuration du formulaire React Hook Form
  const form = useForm<ParticulierFormValues>({
    resolver: zodResolver(particulierFormSchema),
    defaultValues: combinedInitialValues,
    mode: "onChange",
  });

  // Validation personnalisée
  const validateForm = useCallback((values: ParticulierFormValues): boolean => {
    const validation = validateParticulier(values);
    
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
  const handleSubmit = useCallback(async (values: ParticulierFormValues) => {
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

  // Gestion des adresses (simplifiée pour particulier)
  const addAdresse = useCallback(() => {
    const currentAdresses = form.getValues("adresses");
    const newAdresse: AdresseParticulier = {
      libelle: currentAdresses.length === 0 ? "Domicile" : "Résidence secondaire",
      rue: "",
      ville: "",
      codePostal: "",
      pays: "France",
      principale: currentAdresses.length === 0, // Première adresse = principale par défaut
    };
    
    form.setValue("adresses", [...currentAdresses, newAdresse]);
  }, [form]);

  const removeAdresse = useCallback((index: number) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = currentAdresses.filter((_, i) => i !== index);
    
    // Si on supprime l'adresse principale, faire de la première restante la principale
    if (updatedAdresses.length > 0 && !updatedAdresses.some(addr => addr.principale)) {
      updatedAdresses[0].principale = true;
    }
    
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  const updateAdresse = useCallback((index: number, adresse: AdresseParticulier) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = [...currentAdresses];
    updatedAdresses[index] = adresse;
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  const setAdressePrincipale = useCallback((index: number) => {
    const currentAdresses = form.getValues("adresses");
    const updatedAdresses = currentAdresses.map((adresse, i) => ({
      ...adresse,
      principale: i === index
    }));
    form.setValue("adresses", updatedAdresses);
  }, [form]);

  // Utilitaires spécifiques aux particuliers
  const getDisplayName = useCallback((): string => {
    const values = form.getValues();
    return getFullName(values);
  }, [form]);

  const getMainAddress = useCallback((): AdresseParticulier | null => {
    const values = form.getValues();
    return getAdressePrincipale(values);
  }, [form]);

  // Suggestion de profession basée sur l'input
  const suggestProfession = useCallback((input: string): string[] => {
    if (!input || input.length < 2) return [];
    
    const professionsCommunes = [
      "Artisan", "Commerçant", "Profession libérale", "Cadre", 
      "Employé", "Fonctionnaire", "Retraité", "Étudiant", 
      "Sans emploi", "Chef d'entreprise", "Agriculteur"
    ];
    
    return professionsCommunes.filter(profession => 
      profession.toLowerCase().includes(input.toLowerCase())
    );
  }, []);

  // Auto-complétion d'adresse simplifiée
  const formatAdresseForDisplay = useCallback((adresse: AdresseParticulier): string => {
    const parts = [adresse.rue, adresse.codePostal, adresse.ville].filter(Boolean);
    return parts.join(', ');
  }, []);

  // Utilitaires de validation
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const formError = form.formState.errors[fieldName as keyof ParticulierFormValues];
    if (formError?.message) return formError.message;
    
    const customError = errors.find(err => err.field === fieldName);
    return customError?.message;
  }, [form.formState.errors, errors]);

  const isFieldRequired = useCallback((fieldName: string): boolean => {
    return ["nom", "relation"].includes(fieldName);
  }, []);

  const hasErrors = errors.length > 0 || Object.keys(form.formState.errors).length > 0;

  const canSubmit = form.formState.isValid && !isLoading && !hasErrors;

  // Progression du formulaire (simplifiée pour particulier)
  const getFormProgress = useCallback((): number => {
    const values = form.getValues();
    let filledFields = 0;
    let totalFields = 5; // Champs de base pour particulier

    // Champs obligatoires et recommandés
    if (values.nom) filledFields++;
    if (values.relation.length > 0) filledFields++;
    if (values.prenom) filledFields++;
    if (values.email) filledFields++;
    if (values.telephone) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  }, [form]);

  // Validation spécifique du contact (particulier = son propre contact)
  const validateContactInfo = useCallback((): boolean => {
    const values = form.getValues();
    
    // Pour un particulier, au moins un moyen de contact est recommandé
    if (!values.email && !values.telephone) {
      setErrors([{
        field: "contact",
        message: "Il est recommandé de renseigner au moins un email ou un téléphone",
        type: "warning"
      }]);
      return false;
    }
    
    return true;
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
    validateContactInfo,
    getFieldError,
    isFieldRequired,
    getFormProgress,
    
    // Adresses management (simplifiée)
    addAdresse,
    removeAdresse,
    updateAdresse,
    setAdressePrincipale,
    
    // Utilitaires particulier
    getDisplayName,
    getMainAddress,
    suggestProfession,
    formatAdresseForDisplay,
  };
}; 