/**
 * Types d'erreur pour les formulaires de tiers
 */

export interface TierFormError {
  message: string;
  field?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface TierApiError extends TierFormError {
  status?: number;
  endpoint?: string;
}

/**
 * Codes d'erreur prédéfinis
 */
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SIRET_REQUIRED: 'SIRET_REQUIRED',
  PRENOM_REQUIRED: 'PRENOM_REQUIRED',
  NAME_REQUIRED: 'NAME_REQUIRED',
  EMAIL_REQUIRED: 'EMAIL_REQUIRED',
  EMAIL_INVALID: 'EMAIL_INVALID',
  PHONE_REQUIRED: 'PHONE_REQUIRED',
  PHONE_INVALID: 'PHONE_INVALID',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Messages d'erreur en français
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.VALIDATION_FAILED]: 'Veuillez corriger les erreurs dans le formulaire',
  [ERROR_CODES.SIRET_REQUIRED]: 'Le SIRET est obligatoire pour une entreprise',
  [ERROR_CODES.PRENOM_REQUIRED]: 'Le prénom est obligatoire pour un particulier',
  [ERROR_CODES.NAME_REQUIRED]: 'Le nom est obligatoire',
  [ERROR_CODES.EMAIL_REQUIRED]: 'L\'adresse email est obligatoire',
  [ERROR_CODES.EMAIL_INVALID]: 'L\'adresse email n\'est pas valide',
  [ERROR_CODES.PHONE_REQUIRED]: 'Le numéro de téléphone est obligatoire',
  [ERROR_CODES.PHONE_INVALID]: 'Le numéro de téléphone n\'est pas valide',
  [ERROR_CODES.API_ERROR]: 'Erreur lors de la communication avec le serveur',
  [ERROR_CODES.NETWORK_ERROR]: 'Erreur de connexion réseau',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Une erreur inattendue est survenue',
};

/**
 * Crée une erreur de formulaire standardisée
 */
export const createFormError = (
  code: ErrorCode,
  field?: string,
  customMessage?: string,
  details?: Record<string, any>
): TierFormError => ({
  code,
  message: customMessage || ERROR_MESSAGES[code],
  field,
  details,
});

/**
 * Crée une erreur API standardisée
 */
export const createApiError = (
  error: any,
  endpoint?: string,
  customMessage?: string
): TierApiError => {
  let code: ErrorCode = ERROR_CODES.UNKNOWN_ERROR;
  let message = customMessage || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  let status: number | undefined;
  
  if (error?.response) {
    // Erreur HTTP
    status = error.response.status;
    
    if (status >= 400 && status < 500) {
      code = ERROR_CODES.VALIDATION_FAILED;
      message = error.response.data?.message || ERROR_MESSAGES[ERROR_CODES.API_ERROR];
    } else if (status >= 500) {
      code = ERROR_CODES.API_ERROR;
      message = ERROR_MESSAGES[ERROR_CODES.API_ERROR];
    }
  } else if (error?.request) {
    // Erreur réseau
    code = ERROR_CODES.NETWORK_ERROR;
    message = ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  } else if (error?.message) {
    // Erreur JavaScript
    message = error.message;
  }
  
  return {
    code,
    message,
    status,
    endpoint,
    details: {
      originalError: error,
    },
  };
};

/**
 * Vérifie si une erreur est de type réseau
 */
export const isNetworkError = (error: TierFormError | TierApiError): boolean => {
  return error.code === ERROR_CODES.NETWORK_ERROR;
};

/**
 * Vérifie si une erreur est de type validation
 */
export const isValidationError = (error: TierFormError | TierApiError): boolean => {
  return error.code === ERROR_CODES.VALIDATION_FAILED;
};

/**
 * Extrait les erreurs de champ d'une réponse API
 */
export const extractFieldErrorsFromApiResponse = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    
    if (Array.isArray(errors)) {
      errors.forEach((err: any) => {
        if (err.field && err.message) {
          fieldErrors[err.field] = err.message;
        }
      });
    } else if (typeof errors === 'object') {
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          fieldErrors[field] = messages[0];
        } else if (typeof messages === 'string') {
          fieldErrors[field] = messages;
        }
      });
    }
  }
  
  return fieldErrors;
}; 