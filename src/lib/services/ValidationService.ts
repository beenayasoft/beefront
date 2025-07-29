/**
 * Service de validation côté frontend
 * Fournit des validations en temps réel pour les formulaires et données
 */

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'custom';
  message: string;
  validator?: (value: any, context?: any) => boolean;
  async?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  fieldErrors: Record<string, string>;
}

export interface ValidationContext {
  documentType?: 'quote' | 'invoice';
  mode?: 'create' | 'edit' | 'validate';
  currentUser?: any;
  permissions?: string[];
}

class ValidationServiceClass {
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  private readonly URL_REGEX = /^https?:\/\/.+\..+/;
  private readonly SIRET_REGEX = /^\d{14}$/;

  /**
   * Valide un formulaire selon les règles définies
   */
  validateForm(
    data: Record<string, any>,
    rules: ValidationRule[],
    context?: ValidationContext
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};
    const fieldErrors: Record<string, string> = {};

    rules.forEach(rule => {
      const value = this.getNestedValue(data, rule.field);
      const validation = this.validateField(value, rule, data, context);

      if (!validation.isValid) {
        if (!errors[rule.field]) errors[rule.field] = [];
        errors[rule.field].push(validation.message);
        if (!fieldErrors[rule.field]) {
          fieldErrors[rule.field] = validation.message;
        }
      }

      if (validation.warning) {
        if (!warnings[rule.field]) warnings[rule.field] = [];
        warnings[rule.field].push(validation.warning);
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      fieldErrors
    };
  }

  /**
   * Valide un champ individuel
   */
  private validateField(
    value: any,
    rule: ValidationRule,
    context: Record<string, any>,
    validationContext?: ValidationContext
  ): { isValid: boolean; message: string; warning?: string } {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule.message);
      
      case 'email':
        return this.validateEmail(value, rule.message);
      
      case 'phone':
        return this.validatePhone(value, rule.message);
      
      case 'url':
        return this.validateUrl(value, rule.message);
      
      case 'number':
        return this.validateNumber(value, rule.message);
      
      case 'date':
        return this.validateDate(value, rule.message);
      
      case 'custom':
        if (rule.validator) {
          return {
            isValid: rule.validator(value, context),
            message: rule.message
          };
        }
        return { isValid: true, message: '' };
      
      default:
        return { isValid: true, message: '' };
    }
  }

  /**
   * Validation champ requis
   */
  private validateRequired(value: any, message: string): { isValid: boolean; message: string } {
    const isValid = value !== null && value !== undefined && value !== '' && 
                   (Array.isArray(value) ? value.length > 0 : true);
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Validation email
   */
  private validateEmail(value: any, message: string): { isValid: boolean; message: string } {
    if (!value) return { isValid: true, message: '' }; // Optionnel si pas requis
    const isValid = typeof value === 'string' && this.EMAIL_REGEX.test(value);
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Validation téléphone français
   */
  private validatePhone(value: any, message: string): { isValid: boolean; message: string } {
    if (!value) return { isValid: true, message: '' };
    const isValid = typeof value === 'string' && this.PHONE_REGEX.test(value);
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Validation URL
   */
  private validateUrl(value: any, message: string): { isValid: boolean; message: string } {
    if (!value) return { isValid: true, message: '' };
    const isValid = typeof value === 'string' && this.URL_REGEX.test(value);
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Validation nombre
   */
  private validateNumber(value: any, message: string): { isValid: boolean; message: string } {
    if (!value && value !== 0) return { isValid: true, message: '' };
    const isValid = !isNaN(Number(value)) && isFinite(Number(value));
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Validation date
   */
  private validateDate(value: any, message: string): { isValid: boolean; message: string } {
    if (!value) return { isValid: true, message: '' };
    const date = new Date(value);
    const isValid = !isNaN(date.getTime());
    return { isValid, message: isValid ? '' : message };
  }

  /**
   * Règles de validation pour les devis
   */
  getQuoteValidationRules(): ValidationRule[] {
    return [
      {
        field: 'title',
        type: 'required',
        message: 'Le titre du devis est obligatoire'
      },
      {
        field: 'client_id',
        type: 'required',
        message: 'Le client est obligatoire'
      },
      {
        field: 'client.email',
        type: 'email',
        message: 'L\'email du client doit être valide'
      },
      {
        field: 'client.phone',
        type: 'phone',
        message: 'Le téléphone doit être un numéro français valide'
      },
      {
        field: 'valid_until',
        type: 'date',
        message: 'La date de validité doit être valide'
      },
      {
        field: 'valid_until',
        type: 'custom',
        message: 'La date de validité doit être dans le futur',
        validator: (value) => {
          if (!value) return true;
          return new Date(value) > new Date();
        }
      },
      {
        field: 'items',
        type: 'custom',
        message: 'Le devis doit contenir au moins un élément',
        validator: (value) => Array.isArray(value) && value.length > 0
      },
      {
        field: 'total_amount',
        type: 'custom',
        message: 'Le montant total doit être positif',
        validator: (value) => Number(value) > 0
      }
    ];
  }

  /**
   * Règles de validation pour les factures
   */
  getInvoiceValidationRules(): ValidationRule[] {
    return [
      {
        field: 'title',
        type: 'required',
        message: 'Le titre de la facture est obligatoire'
      },
      {
        field: 'client_id',
        type: 'required',
        message: 'Le client est obligatoire'
      },
      {
        field: 'client.email',
        type: 'email',
        message: 'L\'email du client doit être valide'
      },
      {
        field: 'due_date',
        type: 'required',
        message: 'La date d\'échéance est obligatoire'
      },
      {
        field: 'due_date',
        type: 'date',
        message: 'La date d\'échéance doit être valide'
      },
      {
        field: 'due_date',
        type: 'custom',
        message: 'La date d\'échéance doit être dans le futur',
        validator: (value) => {
          if (!value) return true;
          return new Date(value) > new Date();
        }
      },
      {
        field: 'items',
        type: 'custom',
        message: 'La facture doit contenir au moins un élément',
        validator: (value) => Array.isArray(value) && value.length > 0
      }
    ];
  }

  /**
   * Règles de validation pour les éléments de document
   */
  getItemValidationRules(): ValidationRule[] {
    return [
      {
        field: 'description',
        type: 'required',
        message: 'La description est obligatoire'
      },
      {
        field: 'quantity',
        type: 'number',
        message: 'La quantité doit être un nombre'
      },
      {
        field: 'quantity',
        type: 'custom',
        message: 'La quantité doit être positive',
        validator: (value) => Number(value) > 0
      },
      {
        field: 'unit_price',
        type: 'number',
        message: 'Le prix unitaire doit être un nombre'
      },
      {
        field: 'unit_price',
        type: 'custom',
        message: 'Le prix unitaire doit être positif ou nul',
        validator: (value) => Number(value) >= 0
      },
      {
        field: 'discount_percentage',
        type: 'custom',
        message: 'La remise doit être entre 0 et 100%',
        validator: (value) => {
          if (!value) return true;
          const num = Number(value);
          return num >= 0 && num <= 100;
        }
      },
      {
        field: 'vat_rate',
        type: 'custom',
        message: 'Le taux de TVA doit être positif',
        validator: (value) => {
          if (!value) return true;
          return Number(value) >= 0;
        }
      }
    ];
  }

  /**
   * Règles de validation pour les clients
   */
  getClientValidationRules(): ValidationRule[] {
    return [
      {
        field: 'name',
        type: 'required',
        message: 'Le nom du client est obligatoire'
      },
      {
        field: 'email',
        type: 'email',
        message: 'L\'email doit être valide'
      },
      {
        field: 'phone',
        type: 'phone',
        message: 'Le téléphone doit être un numéro français valide'
      },
      {
        field: 'siret',
        type: 'custom',
        message: 'Le SIRET doit contenir 14 chiffres',
        validator: (value) => {
          if (!value) return true;
          return this.SIRET_REGEX.test(value);
        }
      },
      {
        field: 'address.postal_code',
        type: 'custom',
        message: 'Le code postal doit être valide',
        validator: (value) => {
          if (!value) return true;
          return /^\d{5}$/.test(value);
        }
      }
    ];
  }

  /**
   * Validation en temps réel pour un champ
   */
  validateRealTime(
    fieldName: string,
    value: any,
    rules: ValidationRule[],
    context?: Record<string, any>
  ): { isValid: boolean; message: string; warning?: string } {
    const rule = rules.find(r => r.field === fieldName);
    if (!rule) return { isValid: true, message: '' };

    return this.validateField(value, rule, context || {});
  }

  /**
   * Validation de sécurité (XSS, injection)
   */
  validateSecurity(value: string): { isSafe: boolean; sanitized: string; warnings: string[] } {
    const warnings: string[] = [];
    let sanitized = value;

    // Détecter les scripts
    if (/<script|javascript:|on\w+=/i.test(value)) {
      warnings.push('Contenu potentiellement dangereux détecté');
      sanitized = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }

    // Détecter les injections SQL
    if (/('|(\\')|(;)|(\|)|(\*)|(%)|(<)|(>)|(\{)|(\})|(\[)|(\])/i.test(value)) {
      warnings.push('Caractères suspects détectés');
    }

    return {
      isSafe: warnings.length === 0,
      sanitized,
      warnings
    };
  }

  /**
   * Obtient une valeur imbriquée dans un objet
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Formate les erreurs pour l'affichage
   */
  formatErrors(errors: Record<string, string[]>): Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }> {
    const formattedErrors: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        formattedErrors.push({
          field,
          message,
          severity: 'error'
        });
      });
    });

    return formattedErrors;
  }

  /**
   * Validation asynchrone (pour vérifications serveur)
   */
  async validateAsync(
    field: string,
    value: any,
    endpoint: string
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      // Simule une vérification serveur
      // Dans un vrai projet, ceci ferait un appel API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Exemple: vérification d'unicité
      if (field === 'quote_number' && value === 'DEV-2024-001') {
        return {
          isValid: false,
          message: 'Ce numéro de devis existe déjà'
        };
      }

      return { isValid: true, message: '' };
    } catch (error) {
      return {
        isValid: false,
        message: 'Erreur lors de la validation'
      };
    }
  }
}

export const ValidationService = new ValidationServiceClass();
export default ValidationService;