import { useState, useCallback } from 'react';
import { DocumentNumbering } from '@/lib/types/tenant';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

interface NumberingPreview {
  preview: string;
  format_description: string;
  config: Partial<DocumentNumbering>;
}

interface UseNumberingFormatReturn {
  generatePreview: (config: Partial<DocumentNumbering>) => Promise<string>;
  validateFormat: (config: DocumentNumbering) => { isValid: boolean; errors: string[] };
  resetCounter: (numberingId: string, newValue: number) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useNumberingFormat(): UseNumberingFormatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async (config: Partial<DocumentNumbering>): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/tenants/preview-numbering/', {
        document_type: config.document_type || 'quote',
        prefix: config.prefix || '',
        suffix: config.suffix || '',
        padding: config.padding || 3,
        next_number: config.next_number || 1,
        include_year: config.include_year ?? true,
        include_month: config.include_month ?? false,
        include_day: config.include_day ?? false,
        date_format: config.date_format || 'YYYY-MM-DD',
        separator: config.separator || '-',
        custom_format: config.custom_format || '',
        reset_yearly: config.reset_yearly ?? true,
        reset_monthly: config.reset_monthly ?? false,
      });

      return response.data.preview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      // Fallback : générer un aperçu local
      return generateLocalPreview(config);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateLocalPreview = (config: Partial<DocumentNumbering>): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const number = String(config.next_number || 1).padStart(config.padding || 3, '0');

    if (config.custom_format) {
      return config.custom_format
        .replace('{prefix}', config.prefix || '')
        .replace('{year}', String(year))
        .replace('{month}', month)
        .replace('{day}', day)
        .replace('{number}', number)
        .replace('{suffix}', config.suffix || '');
    } else {
      const parts: string[] = [];
      const separator = config.separator || '-';
      
      if (config.prefix) parts.push(config.prefix);
      
      const dateParts: string[] = [];
      if (config.include_year) dateParts.push(String(year));
      if (config.include_month) dateParts.push(month);
      if (config.include_day) dateParts.push(day);
      
      if (dateParts.length > 0) {
        parts.push(dateParts.join(separator));
      }
      
      parts.push(number);
      
      if (config.suffix) parts.push(config.suffix);
      
      return parts.join(separator);
    }
  };

  const validateFormat = useCallback((config: DocumentNumbering): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation du format personnalisé
    if (config.custom_format) {
      if (!config.custom_format.includes('{number}')) {
        errors.push('Le format personnalisé doit contenir la variable {number}');
      }
      
      // Vérifier les variables valides
      const validVariables = ['{prefix}', '{year}', '{month}', '{day}', '{number}', '{suffix}'];
      const usedVariables = config.custom_format.match(/\{[^}]+\}/g) || [];
      
      for (const variable of usedVariables) {
        if (!validVariables.includes(variable)) {
          errors.push(`Variable inconnue : ${variable}`);
        }
      }
    }

    // Validation du padding
    if (config.padding < 1 || config.padding > 10) {
      errors.push('Le nombre de chiffres doit être entre 1 et 10');
    }

    // Validation du prochain numéro
    if (config.next_number < 1) {
      errors.push('Le prochain numéro doit être supérieur à 0');
    }

    // Validation du préfixe
    if (config.prefix && config.prefix.length > 20) {
      errors.push('Le préfixe ne peut pas dépasser 20 caractères');
    }

    // Validation du suffixe
    if (config.suffix && config.suffix.length > 10) {
      errors.push('Le suffixe ne peut pas dépasser 10 caractères');
    }

    // Validation du séparateur
    if (config.separator && config.separator.length > 3) {
      errors.push('Le séparateur ne peut pas dépasser 3 caractères');
    }

    // Validation des options de réinitialisation
    if (config.reset_monthly && config.reset_yearly) {
      // Ce n'est pas une erreur, mais on peut avertir
      // La réinitialisation mensuelle prendra le pas sur l'annuelle
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const resetCounter = useCallback(async (numberingId: string, newValue: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(
        `/tenants/document_numbering/${numberingId}/reset/`,
        { new_value: newValue }
      );

      const data = response.data;
      
      toast({
        title: "Compteur réinitialisé",
        description: data.message || `Le compteur a été remis à ${newValue}`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generatePreview,
    validateFormat,
    resetCounter,
    isLoading,
    error,
  };
}