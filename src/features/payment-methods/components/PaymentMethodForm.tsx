/**
 * Formulaire de création/modification d'un moyen de paiement
 */
import React, { useState, useEffect } from 'react';
import { CreditCard, Building, Receipt, DollarSign, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { PaymentMethod, PaymentMethodType, BankTransferDetails, CheckDetails } from '../api/paymentMethods';

interface PaymentMethodFormProps {
  paymentMethodTypes: PaymentMethodType[];
  initialData?: PaymentMethod | null;
  onSubmit: (data: Omit<PaymentMethod, 'id'> | PaymentMethod) => void;
  onCancel: () => void;
}

const getMethodTypeIcon = (methodType: string) => {
  switch (methodType) {
    case 'bank_transfer':
      return Building;
    case 'check':
      return Receipt;
    case 'cash':
      return DollarSign;
    case 'card':
    case 'paypal':
    default:
      return CreditCard;
  }
};

// Validation des champs requis selon le type
const validateMethodDetails = (methodType: string, details: Record<string, any>): string[] => {
  const errors: string[] = [];
  
  if (methodType === 'bank_transfer') {
    if (!details.iban || details.iban.trim() === '') {
      errors.push('L\'IBAN est requis pour un virement bancaire');
    }
    if (!details.account_holder || details.account_holder.trim() === '') {
      errors.push('Le titulaire du compte est requis pour un virement bancaire');
    }
  }
  
  if (methodType === 'check') {
    if (!details.payable_to || details.payable_to.trim() === '') {
      errors.push('Le bénéficiaire est requis pour un paiement par chèque');
    }
  }
  
  return errors;
};

// Validation IBAN simple (format français)
const validateIBAN = (iban: string): boolean => {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  // Format IBAN français : FR + 2 chiffres + 23 caractères alphanumériques
  const frenchIBANRegex = /^FR[0-9]{2}[0-9A-Z]{23}$/;
  return frenchIBANRegex.test(cleanIBAN);
};

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethodTypes,
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    method_type: 'bank_transfer',
    label: '',
    description: '',
    details: {},
    is_active: true,
    display_order: 1,
    icon_name: 'building-bank',
    background_color: '#1B333F',
    text_color: '#FFFFFF',
    border_color: '#1B333F',
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // S'assurer que les détails sont bien structurés
        details: initialData.details || {}
      });
    }
  }, [initialData]);

  // Mettre à jour les valeurs par défaut quand le type change
  useEffect(() => {
    if (formData.method_type) {
      const selectedType = paymentMethodTypes.find(t => t.value === formData.method_type);
      if (selectedType && !initialData) {
        // Seulement pour les nouveaux moyens de paiement
        setFormData(prev => ({
          ...prev,
          label: prev.label || selectedType.label,
          icon_name: selectedType.icon,
          background_color: prev.background_color || selectedType.default_style.background_color,
          text_color: prev.text_color || selectedType.default_style.text_color,
          border_color: prev.border_color || selectedType.default_style.border_color,
        }));
      }
    }
  }, [formData.method_type, paymentMethodTypes, initialData]);

  const handleInputChange = (field: keyof PaymentMethod, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer les erreurs lors de la saisie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
    
    // Effacer les erreurs lors de la saisie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    // Validation des champs généraux
    if (!formData.label || formData.label.trim() === '') {
      validationErrors.push('Le libellé est requis');
    }
    
    if (!formData.method_type) {
      validationErrors.push('Le type de moyen de paiement est requis');
    }
    
    // Validation des détails selon le type
    if (formData.method_type && formData.details) {
      const detailErrors = validateMethodDetails(formData.method_type, formData.details);
      validationErrors.push(...detailErrors);
      
      // Validation spécifique IBAN
      if (formData.method_type === 'bank_transfer' && formData.details.iban) {
        if (!validateIBAN(formData.details.iban)) {
          validationErrors.push('Le format de l\'IBAN n\'est pas valide');
        }
      }
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData as Omit<PaymentMethod, 'id'> | PaymentMethod);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = paymentMethodTypes.find(t => t.value === formData.method_type);
  const IconComponent = selectedType ? getMethodTypeIcon(selectedType.value) : CreditCard;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Erreurs de validation */}
      {errors.length > 0 && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-300">
            <div className="font-medium mb-2">Veuillez corriger les erreurs suivantes :</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method_type">Type de moyen de paiement *</Label>
                <Select 
                  value={formData.method_type} 
                  onValueChange={(value) => handleInputChange('method_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {React.createElement(getMethodTypeIcon(type.value), { className: "h-4 w-4" })}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="label">Libellé *</Label>
                <Input
                  id="label"
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder="Ex: Virement bancaire"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description optionnelle du moyen de paiement"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_order">Ordre d'affichage</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="1"
                  value={formData.display_order || 1}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>
          </div>

          {/* Détails spécifiques au type */}
          {formData.method_type === 'bank_transfer' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Détails du virement bancaire</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iban">IBAN *</Label>
                  <Input
                    id="iban"
                    type="text"
                    value={(formData.details as BankTransferDetails)?.iban || ''}
                    onChange={(e) => handleDetailsChange('iban', e.target.value.toUpperCase())}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bic">BIC/SWIFT</Label>
                  <Input
                    id="bic"
                    type="text"
                    value={(formData.details as BankTransferDetails)?.bic || ''}
                    onChange={(e) => handleDetailsChange('bic', e.target.value.toUpperCase())}
                    placeholder="BNPAFRPP"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_holder">Titulaire du compte *</Label>
                  <Input
                    id="account_holder"
                    type="text"
                    value={(formData.details as BankTransferDetails)?.account_holder || ''}
                    onChange={(e) => handleDetailsChange('account_holder', e.target.value)}
                    placeholder="Nom du titulaire"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bank_name">Nom de la banque</Label>
                  <Input
                    id="bank_name"
                    type="text"
                    value={(formData.details as BankTransferDetails)?.bank_name || ''}
                    onChange={(e) => handleDetailsChange('bank_name', e.target.value)}
                    placeholder="Ex: BNP Paribas"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.method_type === 'check' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Détails du paiement par chèque</h3>
              
              <div>
                <Label htmlFor="payable_to">À l'ordre de *</Label>
                <Input
                  id="payable_to"
                  type="text"
                  value={(formData.details as CheckDetails)?.payable_to || ''}
                  onChange={(e) => handleDetailsChange('payable_to', e.target.value)}
                  placeholder="Nom du bénéficiaire"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={(formData.details as CheckDetails)?.address || ''}
                  onChange={(e) => handleDetailsChange('address', e.target.value)}
                  placeholder="Adresse du bénéficiaire"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={(formData.details as CheckDetails)?.instructions || ''}
                  onChange={(e) => handleDetailsChange('instructions', e.target.value)}
                  placeholder="Instructions supplémentaires pour le paiement par chèque"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Apparence */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Apparence</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="background_color">Couleur de fond</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color || '#1B333F'}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-12 h-12 p-1 border-0 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.background_color || '#1B333F'}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="text_color">Couleur du texte</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color || '#FFFFFF'}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                    className="w-12 h-12 p-1 border-0 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.text_color || '#FFFFFF'}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="border_color">Couleur de bordure</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="border_color"
                    type="color"
                    value={formData.border_color || '#1B333F'}
                    onChange={(e) => handleInputChange('border_color', e.target.value)}
                    className="w-12 h-12 p-1 border-0 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.border_color || '#1B333F'}
                    onChange={(e) => handleInputChange('border_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Aperçu */}
            <div>
              <Label>Aperçu</Label>
              <div 
                className="mt-2 p-4 rounded-lg border-2 inline-block min-w-[200px]"
                style={{
                  backgroundColor: formData.background_color,
                  color: formData.text_color,
                  borderColor: formData.border_color
                }}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6" />
                  <div>
                    <div className="font-semibold text-sm">
                      {formData.label || 'Libellé du moyen'}
                    </div>
                    {formData.description && (
                      <div className="text-xs opacity-80">
                        {formData.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Sauvegarde...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
};