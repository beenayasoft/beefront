/**
 * Tableau des éléments d'un devis
 * Utilise les nouveaux types corrigés (QuoteItem avec vatRate: string)
 */
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QuoteItem } from '../../types/quotes.types';

interface QuoteItemsTableProps {
  items: QuoteItem[];
  className?: string;
}

/**
 * Formate un montant en MAD
 */
const formatAmount = (amount: number): string => {
  return `${amount.toFixed(2)} MAD`;
};

/**
 * Formate le taux de TVA pour l'affichage
 */
const formatVatRate = (vatRate: string): string => {
  return `${vatRate}%`;
};

/**
 * Retourne l'icône selon le type d'élément
 */
const getItemTypeIcon = (type: string): string => {
  switch (type) {
    case 'material': return '📦';
    case 'labor': return '👷';
    case 'work': return '🔨';
    case 'chapter': return '📋';
    case 'section': return '📂';
    case 'discount': return '💰';
    default: return '📄';
  }
};

/**
 * Composant tableau des éléments
 */
export const QuoteItemsTable: React.FC<QuoteItemsTableProps> = ({
  items,
  className
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Aucun élément dans ce devis</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead className="text-center w-20">Quantité</TableHead>
            <TableHead className="text-right w-24">Prix unitaire</TableHead>
            <TableHead className="text-center w-16">TVA</TableHead>
            <TableHead className="text-right w-24">Total HT</TableHead>
            <TableHead className="text-right w-24">Total TTC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} className="hover:bg-slate-50">
              <TableCell className="font-medium text-center">
                {index + 1}
              </TableCell>
              
              <TableCell>
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getItemTypeIcon(item.type)}</span>
                  <div>
                    <p className="font-medium">{item.designation}</p>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.reference && (
                      <p className="text-xs text-slate-500 mt-1">
                        Réf: {item.reference}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div>
                  <span className="font-medium">{item.quantity}</span>
                  {item.unit && (
                    <span className="text-sm text-slate-500 ml-1">
                      {item.unit}
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                {formatAmount(item.unitPrice)}
              </TableCell>
              
              <TableCell className="text-center">
                <span className="text-sm font-medium">
                  {formatVatRate(item.vatRate)}
                </span>
              </TableCell>
              
              <TableCell className="text-right font-medium">
                {formatAmount(item.totalHt)}
              </TableCell>
              
              <TableCell className="text-right font-medium">
                {formatAmount(item.totalTtc)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuoteItemsTable;