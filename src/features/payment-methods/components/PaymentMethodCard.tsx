import React from 'react';
import { cn } from '@/lib/utils';
import { CreditCard, Building, Receipt, DollarSign } from 'lucide-react';
import type { PaymentMethod } from '../api/paymentMethods';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  style?: 'modern' | 'classic' | 'minimal';
  className?: string;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'building-bank':
      return Building;
    case 'credit-card':
      return CreditCard;
    case 'receipt':
      return Receipt;
    case 'banknotes':
      return DollarSign;
    default:
      return CreditCard;
  }
};

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = React.memo(({
  paymentMethod,
  style = 'modern',
  className
}) => {
  const Icon = getIcon(paymentMethod.icon_name);
  
  const baseStyles = "p-4 rounded-lg transition-all";
  
  const styleVariants = {
    modern: "shadow-md hover:shadow-lg border-0",
    classic: "border-2 shadow-sm hover:shadow-md",
    minimal: "border-0 shadow-none hover:shadow-sm"
  };

  return (
    <div 
      className={cn(
        baseStyles,
        styleVariants[style],
        className
      )}
      style={{
        backgroundColor: paymentMethod.background_color,
        color: paymentMethod.text_color,
        borderColor: style !== 'minimal' ? paymentMethod.border_color : 'transparent'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            {paymentMethod.label}
          </h3>
          {paymentMethod.description && (
            <p className="text-xs opacity-80 mb-2">
              {paymentMethod.description}
            </p>
          )}
          
          {/* Affichage des détails selon le type */}
          {paymentMethod.method_type === 'bank_transfer' && paymentMethod.formatted_details && (
            <div className="space-y-1 text-xs">
              {paymentMethod.formatted_details.iban && (
                <div>
                  <span className="font-medium">IBAN:</span> {paymentMethod.formatted_details.iban}
                </div>
              )}
              {paymentMethod.formatted_details.bic && (
                <div>
                  <span className="font-medium">BIC:</span> {paymentMethod.formatted_details.bic}
                </div>
              )}
              {paymentMethod.formatted_details.bank_name && (
                <div>
                  <span className="font-medium">Banque:</span> {paymentMethod.formatted_details.bank_name}
                </div>
              )}
            </div>
          )}
          
          {paymentMethod.method_type === 'check' && paymentMethod.formatted_details && (
            <div className="space-y-1 text-xs">
              {paymentMethod.formatted_details.payable_to && (
                <div>
                  <span className="font-medium">À l'ordre de:</span> {paymentMethod.formatted_details.payable_to}
                </div>
              )}
              {paymentMethod.formatted_details.address && (
                <div>
                  <span className="font-medium">Adresse:</span> {paymentMethod.formatted_details.address}
                </div>
              )}
              {paymentMethod.formatted_details.instructions && (
                <div className="mt-2 text-xs opacity-90">
                  {paymentMethod.formatted_details.instructions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});