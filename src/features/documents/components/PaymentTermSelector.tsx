/**
 * Sélecteur intelligent de conditions de paiement tenant-specific
 * Phase 2 : Utilise les APIs dynamiques
 */
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentTerms } from '../hooks/usePaymentTerms';
import { cn } from '@/lib/utils';

interface PaymentTermSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PaymentTermSelector: React.FC<PaymentTermSelectorProps> = ({
  value,
  onValueChange,
  label = 'Condition de paiement',
  placeholder = 'Sélectionner une condition',
  required = false,
  disabled = false,
  className
}) => {
  const {
    paymentTerms,
    defaultPaymentTerm,
    loading,
    error,
    isReady
  } = usePaymentTerms();

  const currentValue = value || (defaultPaymentTerm?.id);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Utilisation des conditions par défaut.
          </AlertDescription>
        </Alert>
      )}

      <Select 
        value={currentValue} 
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue 
            placeholder={
              loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Chargement...
                </div>
              ) : placeholder
            }
          />
        </SelectTrigger>
        
        <SelectContent>
          {isReady ? (
            paymentTerms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                <div className="flex justify-between w-full">
                  <span className="font-medium">{term.label}</span>
                  {term.is_default && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                      Défaut
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Chargement...
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {currentValue && isReady && (
        <div className="text-xs text-slate-600">
          {(() => {
            const selectedTerm = paymentTerms.find(t => t.id === currentValue);
            return selectedTerm?.description || `Paiement sous ${selectedTerm?.days} jours`;
          })()}
        </div>
      )}
    </div>
  );
};

export default PaymentTermSelector;