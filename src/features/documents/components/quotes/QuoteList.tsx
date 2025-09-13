/**
 * Composant d'affichage de la liste des devis
 */
import React, { useState, useEffect } from 'react';
import {
  Edit,
  Send,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Quote } from '../../types/quotes.types';
import { quotesApi } from '../../api/quotes';
import { useCurrency } from '@/contexts/CurrencyContext';
// Plus besoin de settingsApi - les numéros formatés viennent du backend

/**
 * Props du composant QuoteList
 */
interface QuoteListProps {
  quotes: Quote[];
  loading: boolean;
  onView: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onSend: (quote: Quote) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
  onDownload: (quote: Quote) => void;
}

/**
 * Composant d'affichage de la liste des devis
 */
const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  loading,
  onView,
  onEdit,
  onSend,
  onConvertToInvoice,
  onDelete,
  onDownload,
}) => {
  const { formatCurrency } = useCurrency();
  // Plus besoin de state pour les numéros formatés - le backend les fournit directement

  // Plus besoin d'initialisation - les numéros formatés viennent du backend

  // Plus besoin de formatage asynchrone - les numéros arrivent déjà formatés

  // Plus besoin d'écouter les changements - les numéros formatés viendront automatiquement du backend
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge className="Beenaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case 'sent':
        return (
          <Badge className="Beenaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Envoyé
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="Beenaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Accepté
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="Beenaya-badge-error gap-1">
            <XCircle className="w-3 h-3" />
            Refusé
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="Beenaya-badge-warning gap-1">
            <AlertTriangle className="w-3 h-3" />
            Expiré
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="Beenaya-badge-neutral gap-1">
            <XCircle className="w-3 h-3" />
            Annulé
          </Badge>
        );
      default:
        return <Badge className="Beenaya-badge-neutral">—</Badge>;
    }
  };

  // Gestionnaire pour le clic sur une ligne
  const handleRowClick = (quote: Quote) => {
    if (onView) {
      onView(quote);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="Beenaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>STATUT</TableHead>
            <TableHead>NUMÉRO</TableHead>
            <TableHead>CLIENT</TableHead>
            <TableHead>DATE CRÉATION</TableHead>
            <TableHead>MONTANT TTC</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                Aucun devis trouvé
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow 
                key={quote.id}
                className={onView ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : ""}
                onClick={onView ? () => handleRowClick(quote) : undefined}
              >
                <TableCell>{getStatusBadge(quote.status)}</TableCell>
                <TableCell className="font-medium">
                  {quote.number || 'Brouillon'}
                </TableCell>
                <TableCell>
                  <Badge className="Beenaya-badge-primary text-xs">
                    {quote.clientName}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(quote.totalTtc || 0)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Actions</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="Beenaya-glass">
                      {quote.status === 'draft' && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit && onEdit(quote)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend && onSend(quote)}>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete && onDelete(quote)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {quote.status === 'sent' && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit && onEdit(quote)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend && onSend(quote)}>
                            <Send className="mr-2 h-4 w-4" />
                            Renvoyer
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {quote.status === 'accepted' && (
                        <DropdownMenuItem onClick={() => onConvertToInvoice && onConvertToInvoice(quote)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Convertir en facture
                        </DropdownMenuItem>
                      )}
                      
                      {quote.status !== 'draft' && (
                        <DropdownMenuItem onClick={() => onDownload && onDownload(quote)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </DropdownMenuItem>
                      )}
                      
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { QuoteList };
