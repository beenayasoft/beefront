/**
 * Actions disponibles pour un devis selon son statut
 * Utilise les nouveaux types corrigés (Quote sans tierId)
 */
import React from 'react';
import { Send, Edit, Copy, Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Quote, QuoteStatus } from '../../types/quotes.types';

interface QuoteActionsProps {
  quote: Quote;
  onSend?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDownloadPdf?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
}

/**
 * Détermine les actions disponibles selon le statut
 */
const getAvailableActions = (status: QuoteStatus) => {
  switch (status) {
    case 'draft':
      return ['send', 'edit', 'duplicate', 'downloadPdf'];
    case 'sent':
      return ['edit', 'duplicate', 'downloadPdf', 'accept', 'reject'];
    case 'accepted':
      return ['duplicate', 'downloadPdf'];
    case 'rejected':
      return ['edit', 'duplicate', 'downloadPdf'];
    case 'expired':
      return ['edit', 'duplicate', 'downloadPdf'];
    case 'cancelled':
      return ['duplicate', 'downloadPdf'];
    default:
      return ['edit', 'duplicate', 'downloadPdf'];
  }
};

/**
 * Composant des actions du devis
 */
export const QuoteActions: React.FC<QuoteActionsProps> = ({
  quote,
  onSend,
  onEdit,
  onDuplicate,
  onDownloadPdf,
  onAccept,
  onReject,
  className
}) => {
  const availableActions = getAvailableActions(quote.status);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Action principale selon le statut */}
      {availableActions.includes('send') && onSend && (
        <Button 
          onClick={onSend} 
          className="w-full bg-slate-800 hover:bg-slate-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer au client
        </Button>
      )}

      {/* Actions de validation pour les devis envoyés */}
      {availableActions.includes('accept') && onAccept && (
        <Button 
          onClick={onAccept} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Marquer accepté
        </Button>
      )}

      {availableActions.includes('reject') && onReject && (
        <Button 
          onClick={onReject} 
          variant="destructive"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Marquer refusé
        </Button>
      )}

      {/* Actions secondaires */}
      <div className="space-y-2">
        {availableActions.includes('edit') && onEdit && (
          <Button 
            onClick={onEdit} 
            variant="outline" 
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}

        {availableActions.includes('duplicate') && onDuplicate && (
          <Button 
            onClick={onDuplicate} 
            variant="outline" 
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </Button>
        )}

        {availableActions.includes('downloadPdf') && onDownloadPdf && (
          <Button 
            onClick={onDownloadPdf} 
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuoteActions;