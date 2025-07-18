/**
 * Composant d'aperçu d'un devis pour l'affichage dans les formulaires et paramètres
 */
import React from 'react';
import { formatCurrency, formatDate } from '../../lib/utils/formatters';

// Type pour les props du composant
interface QuotePreviewProps {
  quote: {
    id: string;
    number: string;
    status: string;
    clientName: string;
    clientAddress?: string;
    projectName?: string;
    projectAddress?: string;
    issueDate: string;
    expiryDate?: string;
    items?: {
      id: string;
      type: string;
      parentId?: string;
      position: number;
      reference?: string;
      designation: string;
      description?: string;
      unit?: string;
      quantity: number;
      unitPrice: number;
      vatRate: number;
      totalHT: number;
      totalTTC: number;
    }[];
    notes?: string;
    termsAndConditions?: string;
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
  };
}

/**
 * Composant d'aperçu d'un devis
 * Utilisé pour afficher un aperçu dans les paramètres d'apparence des documents
 */
export const QuotePreview: React.FC<QuotePreviewProps> = ({ quote }) => {
  return (
    <div className="p-6 text-sm">
      {/* En-tête du document */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">DEVIS</h1>
          <p className="text-gray-600">N° {quote.number}</p>
          <p className="text-gray-600">Date: {formatDate(quote.issueDate)}</p>
          {quote.expiryDate && (
            <p className="text-gray-600">Validité: {formatDate(quote.expiryDate)}</p>
          )}
        </div>
        
        <div className="text-right">
          <p className="font-bold">Votre entreprise</p>
          <p>123 Rue de l'Exemple</p>
          <p>75000 Paris</p>
          <p>contact@votre-entreprise.com</p>
          <p>01 23 45 67 89</p>
        </div>
      </div>
      
      {/* Informations client */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border p-3 rounded">
          <h2 className="font-bold mb-1 text-xs">Client</h2>
          <p>{quote.clientName}</p>
          {quote.clientAddress && <p>{quote.clientAddress}</p>}
        </div>
        
        {(quote.projectName || quote.projectAddress) && (
          <div className="border p-3 rounded">
            <h2 className="font-bold mb-1 text-xs">Projet</h2>
            {quote.projectName && <p>{quote.projectName}</p>}
            {quote.projectAddress && <p>{quote.projectAddress}</p>}
          </div>
        )}
      </div>
      
      {/* Tableau des éléments */}
      <table className="w-full mb-6 text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Qté</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">PU HT</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">TVA</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {quote.items?.map((item) => (
            <tr key={item.id} className={item.type === 'chapter' ? 'font-bold bg-gray-50' : ''}>
              <td className="px-2 py-1 whitespace-normal">
                <div className="font-medium">{item.designation}</div>
                {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
              </td>
              <td className="px-2 py-1 text-right">{item.quantity} {item.unit}</td>
              <td className="px-2 py-1 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="px-2 py-1 text-right">{item.vatRate}%</td>
              <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.totalHT)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Totaux */}
      <div className="flex justify-end mb-6">
        <div className="w-48">
          <div className="flex justify-between py-1 text-xs">
            <span>Total HT</span>
            <span className="font-medium">{formatCurrency(quote.totalHT)}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span>TVA</span>
            <span className="font-medium">{formatCurrency(quote.totalVAT)}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-200 font-bold text-xs">
            <span>Total TTC</span>
            <span>{formatCurrency(quote.totalTTC)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes et conditions */}
      {quote.notes && (
        <div className="mb-4 text-xs">
          <h3 className="font-bold mb-1">Notes</h3>
          <p className="text-gray-700">{quote.notes}</p>
        </div>
      )}
      
      {quote.termsAndConditions && (
        <div className="mb-4 text-xs">
          <h3 className="font-bold mb-1">Conditions générales</h3>
          <p className="text-gray-700">{quote.termsAndConditions}</p>
        </div>
      )}
      
      {/* Signature */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
        <div className="border-t pt-2">
          <p className="font-bold">Signature client</p>
          <p className="text-xs text-gray-500">Bon pour accord</p>
        </div>
        
        <div className="border-t pt-2">
          <p className="font-bold">Signature prestataire</p>
          <p className="text-xs text-gray-500">Date: {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;
