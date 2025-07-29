/**
 * Badge de statut pour les devis
 * Utilise les nouveaux types corrigés (QuoteStatus)
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuoteStatus } from '../../types/quotes.types';
import { cn } from '@/lib/utils';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  className?: string;
}

/**
 * Configuration des statuts avec couleurs et labels
 */
const statusConfig = {
  draft: {
    label: 'Brouillon',
    className: 'bg-slate-500 text-white hover:bg-slate-600',
    icon: '📝'
  },
  sent: {
    label: 'Envoyé',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
    icon: '📤'
  },
  accepted: {
    label: 'Accepté',
    className: 'bg-green-500 text-white hover:bg-green-600',
    icon: '✅'
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-red-500 text-white hover:bg-red-600',
    icon: '❌'
  },
  expired: {
    label: 'Expiré',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
    icon: '⏰'
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
    icon: '🚫'
  }
} as const;

/**
 * Composant badge de statut
 */
export const QuoteStatusBadge: React.FC<QuoteStatusBadgeProps> = ({
  status,
  className
}) => {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge className={cn('bg-slate-500 text-white', className)}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={cn(config.className, className)}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

export default QuoteStatusBadge;