import React from 'react';
import { cn } from '@/lib/utils';
import { PaymentMethodCard } from './PaymentMethodCard';
import type { PaymentMethod } from '../api/paymentMethods';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  title?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  style?: 'modern' | 'classic' | 'minimal';
  className?: string;
}

export const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = React.memo(({
  paymentMethods,
  title = 'Moyens de paiement',
  layout = 'horizontal',
  style = 'modern',
  className
}) => {
  if (!paymentMethods || paymentMethods.length === 0) {
    return null;
  }

  const activePaymentMethods = paymentMethods.filter(pm => pm.is_active);
  
  if (activePaymentMethods.length === 0) {
    return null;
  }

  const layoutStyles = {
    horizontal: "flex flex-wrap gap-4",
    vertical: "space-y-4",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4"
  };

  return (
    <div className={cn("mt-6", className)}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {title}
      </h3>
      
      <div className={layoutStyles[layout]}>
        {activePaymentMethods.map((paymentMethod) => (
          <PaymentMethodCard
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            style={style}
            className={layout === 'horizontal' ? 'flex-1 min-w-[200px]' : ''}
          />
        ))}
      </div>
    </div>
  );
});