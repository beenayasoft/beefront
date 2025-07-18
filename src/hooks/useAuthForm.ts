import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  submit: (e: React.FormEvent) => Promise<void>;
  backendError: string | null;
}

const getFriendlyErrorMessage = (error: any): string => {
  if (error.response) {
    const { data } = error.response;

    if (data.detail) {
      return `Erreur : ${data.detail}`;
    }

    if (typeof data === 'object' && data !== null) {
      const errorMessages = Object.entries(data)
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
          
          const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
          return `${fieldName}: ${messageText}`;
        });
      
      if (errorMessages.length > 0) {
        return `Erreur de validation : ${errorMessages.join('; ')}`;
      }
    }
  } else if (error.request) {
    return "Erreur réseau : Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
  } else {
    return `Une erreur inattendue est survenue : ${error.message}`;
  }

  return "Une erreur inattendue est survenue. Veuillez réessayer.";
};

export const useAuthForm = (initialMode: AuthMode = 'login'): UseAuthFormReturn => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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

  const { login, register, error: backendError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleInputChange = (field: keyof AuthFormState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const toggleShowPassword = () => setShowPassword(p => !p);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        toast({ title: 'Connexion réussie', description: 'Bienvenue sur votre espace Benaya' });
        navigate(from);
      } else {
        if (formData.password !== formData.password2) {
          setFormError('Les mots de passe ne correspondent pas');
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
      setFormError("L'opération a échoué. Analyse de l'erreur...");

      setTimeout(() => {
        const specificError = getFriendlyErrorMessage(err);
        setFormError(specificError);
      }, 700);
    } finally {
      if (isSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  return {
    mode,
    setMode,
    formData,
    handleInputChange,
    isSubmitting,
    showPassword,
    toggleShowPassword,
    formError,
    submit,
    backendError,
  };
};
