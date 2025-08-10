/**
 * Composant d'aperçu d'un devis pour l'affichage dans les formulaires et paramètres
 */
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { formatDate } from '@/lib/utils/formatters';

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
      totalTtc: number;
    }[];
    notes?: string;
    termsAndConditions?: string;
    totalHT: number;
    totalVAT: number;
    totalTtc: number;
  };
  appearanceSettings?: {
    documentTemplate?: "modern" | "classic" | "minimal";
    primaryColor?: string;
    showLogo?: boolean;
    // Nouveaux champs pour le logo
    logoData?: string;
    logoSize?: number;
    logoPositionType?: 'left' | 'top' | 'header';
    logoCenterInHeader?: boolean;
    // Champs existants
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
    // Nouveaux champs pour les styles de tableaux
    tableBorderStyle?: 'straight' | 'rounded';
    tableBorderHorizontal?: boolean;
    tableBorderVertical?: boolean;
    tableBorderWidth?: number;
    tableBorderColor?: string;
    sectionContrast?: boolean;
    sectionContrastColor?: string;
    showSectionSubtotals?: boolean;
    tableRowPadding?: number;
    tableColumnSpacing?: number;
    // Nouveaux champs pour les moyens de paiement
    showPaymentMethods?: boolean;
    paymentMethodsTitle?: string;
    paymentMethodsLayout?: 'horizontal' | 'vertical' | 'grid';
    paymentMethodsStyle?: 'modern' | 'classic' | 'minimal';
  };
  paymentMethods?: any[];
}

/**
 * Composant d'aperçu d'un devis
 * Utilisé pour afficher un aperçu dans les paramètres d'apparence des documents
 */
export const QuotePreview: React.FC<QuotePreviewProps> = ({ 
  quote, 
  paymentMethods = [],
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
    showSignatureArea: true,
    tableHeaderColor: "#f8f9fa",
    tableAlternateColor: "#f2f2f2",
    // Configuration par défaut des moyens de paiement
    showPaymentMethods: true,
    paymentMethodsTitle: "Moyens de paiement",
    paymentMethodsLayout: "horizontal",
    paymentMethodsStyle: "modern",
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
            DEVIS
          </h1>
          <p className="text-gray-600">N° {quote.number}</p>
          <p className="text-gray-600">Date: {formatDate(quote.issueDate)}</p>
          {quote.expiryDate && (
            <p className="text-gray-600">Validité: {formatDate(quote.expiryDate)}</p>
          )}
        </div>
        
        <div className="text-right space-y-2">
          {/* Logo de l'entreprise */}
          {appearanceSettings.showLogo && (
            <div className="mb-3">
              {(quote as any).companyLogo ? (
                <img 
                  src={(quote as any).companyLogo} 
                  alt={(quote as any).companyName || "Logo entreprise"}
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
              <p className="font-bold">{(quote as any).companyName || "Votre entreprise"}</p>
            )}
            {appearanceSettings.showCompanyAddress && ((quote as any).companyAddress || "123 Rue de l'Exemple\n75000 Paris").split('\n').map((line: string, index: number) => (
              <p key={index}>{line}</p>
            ))}
            {appearanceSettings.showCompanyEmail && (
              <p>{(quote as any).companyEmail || "contact@votre-entreprise.com"}</p>
            )}
            {appearanceSettings.showCompanyPhone && (
              <p>{(quote as any).companyPhone || "01 23 45 67 89"}</p>
            )}
            {appearanceSettings.showCompanyWebsite && (quote as any).companyWebsite && (
              <p className="text-xs text-gray-500">{(quote as any).companyWebsite}</p>
            )}
            {appearanceSettings.showCompanySiret && (quote as any).companySiret && (
              <p className="text-xs text-gray-500">SIRET: {(quote as any).companySiret}</p>
            )}
            {appearanceSettings.showCompanyIce && (quote as any).companyIce && (
              <p className="text-xs text-gray-500">ICE: {(quote as any).companyIce}</p>
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
            <p>{quote.clientName}</p>
            {quote.clientAddress && <p>{quote.clientAddress}</p>}
          </div>
        )}
        
        {appearanceSettings.showProjectInfo && (quote.projectName || quote.projectAddress) && (
          <div className="border p-3 rounded">
            <h2 
              className="font-bold mb-1 text-xs"
              style={{ color: appearanceSettings.primaryColor }}
            >
              Projet
            </h2>
            {quote.projectName && <p>{quote.projectName}</p>}
            {quote.projectAddress && <p>{quote.projectAddress}</p>}
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
          {quote.items?.map((item, index) => (
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
            <span className="font-medium">{formatCurrency(quote.totalHT)}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span>TVA</span>
            <span className="font-medium">{formatCurrency(quote.totalVAT)}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-200 font-bold text-xs">
            <span>Total TTC</span>
            <span>{formatCurrency(quote.totalTtc)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes et conditions */}
      {appearanceSettings.showNotes && quote.notes && (
        <div className="mb-4 text-xs">
          <h3 
            className="font-bold mb-1"
            style={{ color: appearanceSettings.primaryColor }}
          >
            Notes
          </h3>
          <p className="text-gray-700">{quote.notes}</p>
        </div>
      )}
      
      {appearanceSettings.showPaymentTerms && quote.termsAndConditions && (
        <div className="mb-4 text-xs">
          <h3 
            className="font-bold mb-1"
            style={{ color: appearanceSettings.primaryColor }}
          >
            Conditions générales
          </h3>
          <p className="text-gray-700">{quote.termsAndConditions}</p>
        </div>
      )}

      {/* Signature */}
      {appearanceSettings.showSignatureArea && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div className="border-t pt-2">
            <p 
              className="font-bold"
              style={{ color: appearanceSettings.primaryColor }}
            >
              Signature client
            </p>
            <p className="text-xs text-gray-500">Bon pour accord</p>
          </div>
          
          <div className="border-t pt-2">
            <p 
              className="font-bold"
              style={{ color: appearanceSettings.primaryColor }}
            >
              Signature prestataire
            </p>
            <p className="text-xs text-gray-500">Date: {formatDate(new Date())}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default QuotePreview;
