/**
 * Composant d'aperçu d'une facture pour l'affichage dans les formulaires et paramètres
 * Format unifié avec QuotePreview
 */
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { formatDate } from '@/lib/utils/formatters';

// Type pour les props du composant
interface InvoicePreviewProps {
  invoice: {
    id: string;
    number: string;
    status: string;
    clientName: string;
    clientAddress?: string;
    projectName?: string;
    projectAddress?: string;
    issueDate: string;
    dueDate?: string;
    paymentTerms?: number;
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
    // Informations d'entreprise
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companySiret?: string;
    companyIce?: string;
  };
  appearanceSettings?: {
    documentTemplate?: "modern" | "classic" | "minimal";
    primaryColor?: string;
    showLogo?: boolean;
    showCompanyName?: boolean;
    showCompanyAddress?: boolean;
    showCompanyEmail?: boolean;
    showCompanyPhone?: boolean;
    showCompanyWebsite?: boolean;
    showCompanySiret?: boolean;
    showCompanyIce?: boolean;
    showClientAddress?: boolean;
    showProjectInfo?: boolean;
    showNotes?: boolean;
    showPaymentTerms?: boolean;
    showBankDetails?: boolean;
    showSignatureArea?: boolean;
    tableHeaderColor?: string;
    tableAlternateColor?: string;
  };
}

/**
 * Composant d'aperçu d'une facture
 * Utilisé pour afficher un aperçu dans les paramètres d'apparence des documents
 */
export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  appearanceSettings = {
    documentTemplate: "modern",
    primaryColor: "#1B333F",
    showLogo: true,
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyEmail: true,
    showCompanyPhone: true,
    showCompanyWebsite: true,
    showCompanySiret: true,
    showCompanyIce: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: false, // Les factures n'ont généralement pas de zone de signature
    tableHeaderColor: "#f8f9fa",
    tableAlternateColor: "#f2f2f2",
  }
}) => {
  return (
    <div className="w-[210mm] bg-white shadow-lg mx-auto border border-gray-200">
      <div className="p-[20mm] text-[11px] leading-tight min-h-[297mm]">
      {/* En-tête du document */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 
            className="text-xl font-bold"
            style={{ color: appearanceSettings.primaryColor }}
          >
            FACTURE
          </h1>
          <p className="text-gray-600">N° {invoice.number}</p>
          <p className="text-gray-600">Date: {formatDate(invoice.issueDate)}</p>
          {invoice.dueDate && (
            <p className="text-gray-600">Échéance: {formatDate(invoice.dueDate)}</p>
          )}
        </div>
        
        <div className="text-right space-y-2">
          {/* Logo de l'entreprise */}
          {appearanceSettings.showLogo && (
            <div className="mb-3">
              {(invoice as any).companyLogo ? (
                <img 
                  src={(invoice as any).companyLogo} 
                  alt={invoice.companyName || "Logo entreprise"}
                  className="h-16 w-auto ml-auto object-contain"
                />
              ) : (
                <div 
                  className="h-16 w-32 ml-auto border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 rounded"
                >
                  Logo entreprise
                </div>
              )}
            </div>
          )}
          
          {/* Informations de l'entreprise */}
          <div>
            {appearanceSettings.showCompanyName && (
              <p className="font-bold">{invoice.companyName || "Votre entreprise"}</p>
            )}
            {appearanceSettings.showCompanyAddress && (invoice.companyAddress || "123 Rue de l'Exemple\n75000 Paris").split('\n').map((line: string, index: number) => (
              <p key={index}>{line}</p>
            ))}
            {appearanceSettings.showCompanyEmail && (
              <p>{invoice.companyEmail || "contact@votre-entreprise.com"}</p>
            )}
            {appearanceSettings.showCompanyPhone && (
              <p>{invoice.companyPhone || "01 23 45 67 89"}</p>
            )}
            {appearanceSettings.showCompanyWebsite && invoice.companyWebsite && (
              <p className="text-xs text-gray-500">{invoice.companyWebsite}</p>
            )}
            {appearanceSettings.showCompanySiret && invoice.companySiret && (
              <p className="text-xs text-gray-500">SIRET: {invoice.companySiret}</p>
            )}
            {appearanceSettings.showCompanyIce && invoice.companyIce && (
              <p className="text-xs text-gray-500">ICE: {invoice.companyIce}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Informations client */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {appearanceSettings.showClientAddress && (
          <div className="border p-3 rounded">
            <h2 
              className="font-bold mb-1 text-xs"
              style={{ color: appearanceSettings.primaryColor }}
            >
              Client
            </h2>
            <p>{invoice.clientName}</p>
            {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
          </div>
        )}
        
        {appearanceSettings.showProjectInfo && (invoice.projectName || invoice.projectAddress) && (
          <div className="border p-3 rounded">
            <h2 
              className="font-bold mb-1 text-xs"
              style={{ color: appearanceSettings.primaryColor }}
            >
              Projet
            </h2>
            {invoice.projectName && <p>{invoice.projectName}</p>}
            {invoice.projectAddress && <p>{invoice.projectAddress}</p>}
          </div>
        )}
      </div>
      
      {/* Tableau des éléments */}
      <table className="w-full mb-6 text-xs">
        <thead style={{ backgroundColor: appearanceSettings.tableHeaderColor }}>
          <tr>
            <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Qté</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">PU HT</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">TVA</th>
            <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoice.items?.map((item, index) => (
            <tr 
              key={item.id} 
              className={item.type === 'chapter' ? 'font-bold' : ''}
              style={{
                backgroundColor: item.type === 'chapter' 
                  ? appearanceSettings.tableHeaderColor 
                  : index % 2 === 1 
                    ? appearanceSettings.tableAlternateColor 
                    : 'transparent'
              }}
            >
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
            <span className="font-medium">{formatCurrency(invoice.totalHT)}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span>TVA</span>
            <span className="font-medium">{formatCurrency(invoice.totalVAT)}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-200 font-bold text-xs">
            <span>Total TTC</span>
            <span>{formatCurrency(invoice.totalTTC)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes et conditions */}
      {appearanceSettings.showNotes && invoice.notes && (
        <div className="mb-4 text-xs">
          <h3 
            className="font-bold mb-1"
            style={{ color: appearanceSettings.primaryColor }}
          >
            Notes
          </h3>
          <p className="text-gray-700">{invoice.notes}</p>
        </div>
      )}
      
      {appearanceSettings.showPaymentTerms && invoice.termsAndConditions && (
        <div className="mb-4 text-xs">
          <h3 
            className="font-bold mb-1"
            style={{ color: appearanceSettings.primaryColor }}
          >
            Conditions de paiement
          </h3>
          <p className="text-gray-700">{invoice.termsAndConditions}</p>
        </div>
      )}

      {/* Informations de paiement */}
      {appearanceSettings.showBankDetails && (
        <div className="mb-4 text-xs">
          <h3 
            className="font-bold mb-1"
            style={{ color: appearanceSettings.primaryColor }}
          >
            Informations bancaires
          </h3>
          <p className="text-gray-700">
            IBAN: FR76 1234 5678 9012 3456 7890 123<br/>
            BIC: EXAMPLEFR<br/>
            Banque: Exemple Banque France
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default InvoicePreview;