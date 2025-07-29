import { useState, useEffect, useCallback, useMemo } from 'react';
import { ValidationService, ValidationRule, ValidationResult, ValidationContext } from '@/lib/services/ValidationService';

/**
 * Hook pour la validation de formulaires en temps réel
 */
export function useFormValidation(
  initialData: Record<string, any>,
  rules: ValidationRule[],
  context?: ValidationContext
) {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [warnings, setWarnings] = useState<Record<string, string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Validation complète du formulaire
  const validateForm = useCallback(() => {
    setIsValidating(true);
    const validation = ValidationService.validateForm(data, rules, context);
    
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    setFieldErrors(validation.fieldErrors);
    setIsValidating(false);
    
    return validation;
  }, [data, rules, context]);

  // Validation d'un champ spécifique
  const validateField = useCallback((fieldName: string, value?: any) => {
    const fieldValue = value !== undefined ? value : getNestedValue(data, fieldName);
    const result = ValidationService.validateRealTime(fieldName, fieldValue, rules, data);
    
    if (result.isValid) {
      // Supprimer les erreurs pour ce champ
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      // Ajouter l'erreur pour ce champ
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: result.message
      }));
      setErrors(prev => ({
        ...prev,
        [fieldName]: [result.message]
      }));
    }
    
    return result;
  }, [data, rules]);

  // Mettre à jour la valeur d'un champ
  const updateField = useCallback((fieldName: string, value: any, validate: boolean = true) => {
    setData(prev => {
      const newData = { ...prev };
      setNestedValue(newData, fieldName, value);
      return newData;
    });

    setTouchedFields(prev => new Set(prev).add(fieldName));

    if (validate) {
      // Délai pour éviter la validation trop fréquente
      setTimeout(() => validateField(fieldName, value), 300);
    }
  }, [validateField]);

  // Marquer un champ comme "touché"
  const touchField = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    if (!fieldErrors[fieldName]) {
      validateField(fieldName);
    }
  }, [fieldErrors, validateField]);

  // État de validation global
  const isValid = useMemo(() => 
    Object.keys(errors).length === 0,
    [errors]
  );

  const hasWarnings = useMemo(() => 
    Object.keys(warnings).length > 0,
    [warnings]
  );

  const hasErrors = useMemo(() => 
    Object.keys(errors).length > 0,
    [errors]
  );

  // Réinitialiser la validation
  const resetValidation = useCallback(() => {
    setErrors({});
    setWarnings({});
    setFieldErrors({});
    setTouchedFields(new Set());
  }, []);

  // Réinitialiser complètement le formulaire
  const resetForm = useCallback((newData?: Record<string, any>) => {
    setData(newData || initialData);
    resetValidation();
  }, [initialData, resetValidation]);

  return {
    // Données
    data,
    setData,
    
    // État de validation
    errors,
    warnings,
    fieldErrors,
    touchedFields,
    isValid,
    hasWarnings,
    hasErrors,
    isValidating,
    
    // Actions
    updateField,
    validateField,
    validateForm,
    touchField,
    resetValidation,
    resetForm,
    
    // Utilitaires
    getFieldError: (fieldName: string) => fieldErrors[fieldName],
    isFieldTouched: (fieldName: string) => touchedFields.has(fieldName),
    isFieldValid: (fieldName: string) => !fieldErrors[fieldName],
  };
}

/**
 * Hook pour la validation asynchrone
 */
export function useAsyncValidation(endpoint: string) {
  const [pendingValidations, setPendingValidations] = useState<Set<string>>(new Set());
  const [asyncErrors, setAsyncErrors] = useState<Record<string, string>>({});

  const validateAsync = useCallback(async (field: string, value: any) => {
    if (!value) {
      setAsyncErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return { isValid: true, message: '' };
    }

    setPendingValidations(prev => new Set(prev).add(field));
    
    try {
      const result = await ValidationService.validateAsync(field, value, endpoint);
      
      if (result.isValid) {
        setAsyncErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        setAsyncErrors(prev => ({
          ...prev,
          [field]: result.message
        }));
      }
      
      return result;
    } finally {
      setPendingValidations(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, [endpoint]);

  return {
    validateAsync,
    asyncErrors,
    pendingValidations,
    isValidating: (field: string) => pendingValidations.has(field),
    hasAsyncError: (field: string) => !!asyncErrors[field],
    getAsyncError: (field: string) => asyncErrors[field]
  };
}

/**
 * Hook pour la validation de sécurité
 */
export function useSecurityValidation() {
  const [securityWarnings, setSecurityWarnings] = useState<Record<string, string[]>>({});

  const validateSecurity = useCallback((field: string, value: string) => {
    const result = ValidationService.validateSecurity(value);
    
    if (result.warnings.length > 0) {
      setSecurityWarnings(prev => ({
        ...prev,
        [field]: result.warnings
      }));
    } else {
      setSecurityWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
    }
    
    return result;
  }, []);

  const clearSecurityWarnings = useCallback((field?: string) => {
    if (field) {
      setSecurityWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
    } else {
      setSecurityWarnings({});
    }
  }, []);

  return {
    validateSecurity,
    securityWarnings,
    clearSecurityWarnings,
    hasSecurityWarnings: Object.keys(securityWarnings).length > 0
  };
}

/**
 * Hook pour les règles de validation prédéfinies
 */
export function useValidationRules(documentType?: 'quote' | 'invoice' | 'client' | 'item') {
  const rules = useMemo(() => {
    switch (documentType) {
      case 'quote':
        return ValidationService.getQuoteValidationRules();
      case 'invoice':
        return ValidationService.getInvoiceValidationRules();
      case 'client':
        return ValidationService.getClientValidationRules();
      case 'item':
        return ValidationService.getItemValidationRules();
      default:
        return [];
    }
  }, [documentType]);

  return {
    rules,
    service: ValidationService
  };
}

/**
 * Hook pour la validation conditionnelle
 */
export function useConditionalValidation(
  condition: (data: Record<string, any>) => boolean,
  rules: ValidationRule[],
  data: Record<string, any>
) {
  const activeRules = useMemo(() => {
    return condition(data) ? rules : [];
  }, [condition, rules, data]);

  const isConditionMet = useMemo(() => 
    condition(data),
    [condition, data]
  );

  return {
    activeRules,
    isConditionMet
  };
}

// Fonctions utilitaires
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return;

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}