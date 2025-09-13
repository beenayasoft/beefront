/**
 * Sélecteur intelligent de taux de TVA tenant-specific
 * Phase 2 : Utilise les APIs dynamiques au lieu des taux hardcodés
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
import { useVatRates } from '../hooks/useVatRates';
import { cn } from '@/lib/utils';

interface VatRateSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const VatRateSelector: React.FC<VatRateSelectorProps> = ({
  value,
  onValueChange,
  label = 'Taux de TVA',
  placeholder = 'Sélectionner un taux',
  required = false,
  disabled = false,
  className
}) => {
  const {
    vatRates,
    defaultVatRate,
    loading,
    error,
    formatVatRate,
    isReady
  } = useVatRates();

  const currentValue = value || (defaultVatRate?.code);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Utilisation des taux par défaut.
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
            vatRates.map((rate) => (
              <SelectItem key={rate.id} value={rate.code}>
                <div className="flex justify-between w-full">
                  <span className="font-medium">{rate.name}</span>
                  <span className="text-slate-500 ml-4">
                    {rate.rate_display || formatVatRate(rate.code)}
                  </span>
                  {rate.is_default && (
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
            const selectedRate = vatRates.find(r => r.code === currentValue);
            return selectedRate?.description || `Taux de ${formatVatRate(currentValue)}`;
          })()}
        </div>
      )}
    </div>
  );
};

export default VatRateSelector;