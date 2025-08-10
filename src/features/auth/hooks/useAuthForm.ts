import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from './useAuth';

/**
 * Fonction de validation de mot de passe côté frontend
 * Applique les mêmes règles que Django pour éviter les aller-retours serveur
 */
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Minimum 8 caractères
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  // Pas uniquement numérique
  if (/^\d+$/.test(password)) {
    errors.push('Le mot de passe ne peut pas être entièrement numérique');
  }
  
  // Pas trop simple (patterns communs)
  const commonPatterns = [
    'password', '123456', 'azerty', 'qwerty', 'admin', 'user', 'guest'
  ];
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Le mot de passe est trop courant');
  }
  
  // Au moins une lettre et un chiffre (optionnel mais recommandé)
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre et un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Fonction de validation complète pour tous les champs du formulaire
 */
const validateField = (field: keyof AuthFormState, value: string | boolean, mode: AuthMode): string | null => {
  if (typeof value !== 'string') value = String(value);
  
  switch (field) {
    case 'email':
      if (!value.trim()) return 'L\'email est obligatoire';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Format d\'email invalide';
      return null;
      
    case 'first_name':
      if (mode === 'signup') {
        if (!value.trim()) return 'Le prénom est obligatoire';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return 'Le prénom ne peut contenir que des lettres';
      }
      return null;
      
    case 'last_name':
      if (mode === 'signup') {
        if (!value.trim()) return 'Le nom est obligatoire';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return 'Le nom ne peut contenir que des lettres';
      }
      return null;
      
    case 'company':
      if (mode === 'signup') {
        if (!value.trim()) return 'Le nom de l\'entreprise est obligatoire';
        if (value.trim().length < 2) return 'Le nom de l\'entreprise doit contenir au moins 2 caractères';
        if (value.trim().length > 100) return 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères';
      }
      return null;
      
    case 'password':
      if (!value.trim()) return 'Le mot de passe est obligatoire';
      if (mode === 'signup') {
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          return passwordValidation.errors[0]; // Retourner la première erreur
        }
      }
      return null;
      
    case 'password2':
      if (mode === 'signup' && !value.trim()) {
        return 'La confirmation du mot de passe est obligatoire';
      }
      return null;
      
    default:
      return null;
  }
};

/**
 * Hook that centralises all authentication form state & logic.
 * Keeps `Auth.tsx` lean and improves maintainability.
 */
export interface AuthFormState {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  username: string;
  company: string;
  acceptTerms: boolean;
}

export type AuthMode = 'login' | 'signup';

export interface UseAuthFormReturn {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  formData: AuthFormState;
  handleInputChange: (field: keyof AuthFormState, value: string | boolean) => void;
  isSubmitting: boolean;
  showPassword: boolean;
  toggleShowPassword: () => void;
  formError: string | null;
  fieldErrors: Record<string, string>;
  submit: (e: React.FormEvent) => Promise<void>;
  backendError: string | null;
}

const getFriendlyErrorMessage = (error: any): string => {
  if (error.response) {
    const { data } = error.response;

    if (data.detail) {
      return `Erreur : ${data.detail}`;
    }

    // Gérer le format d'erreur du backend: { errors: {...}, message: "..." }
    const errorsToProcess = data.errors || data;

    if (typeof errorsToProcess === 'object' && errorsToProcess !== null) {
      const errorMessages = Object.entries(errorsToProcess)
        .map(([field, messages]) => {
          const fieldName = {
            email: 'Email',
            password: 'Mot de passe',
            password2: 'Confirmation du mot de passe',
            username: "Nom d'utilisateur",
            first_name: 'Prénom',
            last_name: 'Nom',
            company: 'Entreprise',
          }[field] || field;
          
          // Gérer les ErrorDetail Django: extraire le string si c'est un objet
          let messageText = messages;
          if (Array.isArray(messages)) {
            messageText = messages.map(msg => {
              if (typeof msg === 'object' && msg.string) {
                return msg.string;
              }
              return typeof msg === 'string' ? msg : String(msg);
            }).join(', ');
          } else if (typeof messages === 'object' && messages.string) {
            messageText = messages.string;
          } else if (typeof messages !== 'string') {
            messageText = String(messages);
          }
          
          return `${fieldName}: ${messageText}`;
        });
      
      if (errorMessages.length > 0) {
        return errorMessages.join('\n');
      }
    }
  } else if (error.request) {
    return "Erreur réseau : Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
  } else {
    return `Une erreur inattendue est survenue : ${error.message}`;
  }

  return "Une erreur inattendue est survenue. Veuillez réessayer.";
};

const getFieldErrors = (error: any): Record<string, string> => {
  if (error.response) {
    const { data } = error.response;
    const errorsToProcess = data.errors || data;

    if (typeof errorsToProcess === 'object' && errorsToProcess !== null) {
      const fieldErrorsMap: Record<string, string> = {};
      
      Object.entries(errorsToProcess).forEach(([field, messages]) => {
        let messageText = messages;
        if (Array.isArray(messages)) {
          messageText = messages.map(msg => {
            if (typeof msg === 'object' && msg.string) {
              return msg.string;
            }
            return typeof msg === 'string' ? msg : String(msg);
          }).join(', ');
        } else if (typeof messages === 'object' && messages.string) {
          messageText = messages.string;
        } else if (typeof messages !== 'string') {
          messageText = String(messages);
        }
        
        fieldErrorsMap[field] = messageText;
      });
      
      return fieldErrorsMap;
    }
  }
  return {};
};

export const useAuthForm = (initialMode: AuthMode = 'login'): UseAuthFormReturn => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    username: '',
    company: '',
    acceptTerms: false,
  });

  // Optimisation avec useCallback
  const setModeOptimized = useCallback((newMode: AuthMode) => {
    setMode(newMode);
  }, []);

  const { login, register, error: backendError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleInputChange = useCallback((field: keyof AuthFormState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError(null);
    
    // Validation en temps réel pour tous les champs - seulement si la valeur n'est pas vide
    const fieldError = validateField(field, value, mode);
    const shouldShowError = fieldError && (typeof value === 'string' ? value.length > 0 : true);
    
    setFieldErrors(prev => {
      // Éviter les mises à jour inutiles si l'erreur est la même
      const currentError = prev[field] || '';
      const newError = shouldShowError ? fieldError : '';
      
      if (currentError === newError) {
        return prev; // Pas de changement, éviter le re-render
      }
      
      return { ...prev, [field]: newError };
    });
    
    // Validation spéciale pour la confirmation de mot de passe
    if (field === 'password2' && mode === 'signup' && typeof value === 'string') {
      const passwordsMatch = value === formData.password;
      const hasError = !passwordsMatch && value.length > 0;
      
      setFieldErrors(prev => {
        const currentError = prev.password2 || '';
        const newError = hasError ? 'Les mots de passe ne correspondent pas' : '';
        
        if (currentError === newError) return prev;
        return { ...prev, password2: newError };
      });
    }
    
    // Si on change le mot de passe, re-valider la confirmation
    if (field === 'password' && mode === 'signup' && formData.password2.length > 0) {
      const passwordsMatch = formData.password2 === value;
      const hasError = !passwordsMatch && typeof value === 'string';
      
      setFieldErrors(prev => {
        const currentError = prev.password2 || '';
        const newError = hasError ? 'Les mots de passe ne correspondent pas' : '';
        
        if (currentError === newError) return prev;
        return { ...prev, password2: newError };
      });
    }
  }, [mode, formData.password, formData.password2]);

  const toggleShowPassword = useCallback(() => setShowPassword(p => !p), []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        toast({ title: 'Connexion réussie', description: 'Bienvenue sur votre espace Beenaya' });
        navigate(from);
      } else {
        // Validation complète de tous les champs avant soumission
        const fieldsToValidate: (keyof AuthFormState)[] = ['email', 'first_name', 'last_name', 'company', 'password', 'password2'];
        const validationErrors: Record<string, string> = {};
        
        for (const field of fieldsToValidate) {
          const error = validateField(field, formData[field], mode);
          if (error) {
            validationErrors[field] = error;
          }
        }
        
        // Validation spéciale pour la confirmation de mot de passe
        if (formData.password !== formData.password2) {
          validationErrors.password2 = 'Les mots de passe ne correspondent pas';
        }
        
        // Si il y a des erreurs de validation, les afficher et arrêter
        if (Object.keys(validationErrors).length > 0) {
          setFieldErrors(validationErrors);
          setIsSubmitting(false);
          return;
        }
        
        if (!formData.acceptTerms) {
          setFormError("Vous devez accepter les conditions d'utilisation");
          setIsSubmitting(false);
          return;
        }
        
        const username = formData.username || formData.email.split('@')[0];
        await register({
          email: formData.email,
          username,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          company: formData.company,
        });
        toast({ title: 'Inscription réussie', description: 'Votre compte a été créé avec succès' });
        navigate('/');
      }
    } catch (err: any) {
      // Extraire les erreurs par champ
      const fieldErrs = getFieldErrors(err);
      
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
      } else {
        // Si pas d'erreurs par champ, afficher l'erreur générale
        const specificError = getFriendlyErrorMessage(err);
        setFormError(specificError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, login, register, toast, navigate, from]);

  return {
    mode,
    setMode: setModeOptimized,
    formData,
    handleInputChange,
    isSubmitting,
    showPassword,
    toggleShowPassword,
    formError,
    fieldErrors,
    submit,
    backendError,
  };
};