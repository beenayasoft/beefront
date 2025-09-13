/**
 * Composant d'aperçu unifié pour tous les documents (devis, factures, etc.)
 * Assure une apparence cohérente avec styles inline pour PDF parfait
 */
import React, { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/utils/formatters';

// Types unifiés pour tous les documents
interface BaseDocument {
  id: string;
  number: string;
  status: string;
  clientName: string;
  clientAddress?: string;
  projectName?: string;
  projectAddress?: string;
  issueDate: string;
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
    totalHt?: number;
    totalTtc?: number;
    totalHt?: number; // Support both naming conventions
    totalTtc?: number;
  }[];
  notes?: string;
  termsAndConditions?: string;
  totalHt?: number;
  totalVAT?: number;
  totalTtc?: number;
  totalHt?: number; // Support both naming conventions
  totalVat?: number;
  totalTtc?: number;
}

interface QuoteDocument extends BaseDocument {
  documentType: 'quote';
  expiryDate?: string;
}

interface InvoiceDocument extends BaseDocument {
  documentType: 'invoice';
  dueDate?: string;
  paymentTerms?: number;
}

type Document = QuoteDocument | InvoiceDocument;

interface AppearanceSettings {
  documentTemplate?: "modern" | "classic" | "minimal";
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  fontSize?: number;
  showLogo?: boolean;
  logoData?: string;
  logoSize?: number;
  logoPositionType?: 'left' | 'top' | 'header';
  logoCenterInHeader?: boolean;
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
  showLegalMentions?: boolean;
  showBankDetails?: boolean;
  showSignatureArea?: boolean;
  tableHeaderColor?: string;
  tableAlternateColor?: string;
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
  showPaymentMethods?: boolean;
  paymentMethodsTitle?: string;
  paymentMethodsLayout?: 'horizontal' | 'vertical' | 'grid';
  paymentMethodsStyle?: 'modern' | 'classic' | 'minimal';
}

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  siret?: string;
  website?: string;
  ice?: string;
}

interface DocumentPreviewProps {
  document: Document;
  companyInfo?: CompanyInfo;
  appearanceSettings?: AppearanceSettings;
  paymentMethods?: any[];
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  document, 
  paymentMethods = [],
  companyInfo,
  appearanceSettings = {
    documentTemplate: "modern",
    primaryColor: "#1B333F",
    secondaryColor: "#64748B",
    fontFamily: "Inter",
    fontSize: 11,
    showLogo: true,
    logoSize: 60,
    logoPositionType: 'left',
    logoCenterInHeader: false,
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
    showBankDetails: false,
    showSignatureArea: false,
    tableHeaderColor: "#F8FAFC",
    tableAlternateColor: "#FFFFFF",
    tableBorderStyle: 'straight',
    tableBorderHorizontal: true,
    tableBorderVertical: false,
    tableBorderWidth: 1,
    tableBorderColor: "#E2E8F0",
    sectionContrast: false,
    sectionContrastColor: "#F1F5F9",
    showSectionSubtotals: true,
    tableRowPadding: 8,
    tableColumnSpacing: 12,
    showPaymentMethods: false,
    paymentMethodsTitle: "Moyens de paiement acceptés",
    paymentMethodsLayout: 'horizontal',
    paymentMethodsStyle: 'modern'
  }
}) => {
  const { formatCurrency } = useCurrency();
  
  // Configuration unifiée avec fallbacks robustes
  const settings = {
    primaryColor: appearanceSettings?.primaryColor || '#1B333F',
    secondaryColor: appearanceSettings?.secondaryColor || '#64748B',
    fontFamily: appearanceSettings?.fontFamily || 'Inter',
    fontSize: appearanceSettings?.fontSize ?? 11,
    documentTemplate: appearanceSettings?.documentTemplate || 'modern',
    
    // Logo et branding - UTILISE LES VALEURS PASSÉES EN PARAMÈTRE
    showLogo: appearanceSettings?.showLogo ?? true,
    logoSize: appearanceSettings?.logoSize ?? 60,
    logoPositionType: appearanceSettings?.logoPositionType || 'left',
    logoCenterInHeader: appearanceSettings?.logoCenterInHeader ?? false,
    
    // Informations entreprise - UTILISE LES VALEURS PASSÉES EN PARAMÈTRE
    showCompanyName: appearanceSettings?.showCompanyName ?? true,
    showCompanyAddress: appearanceSettings?.showCompanyAddress ?? true,
    showCompanyPhone: appearanceSettings?.showCompanyPhone ?? true,
    showCompanyEmail: appearanceSettings?.showCompanyEmail ?? true,
    showCompanyWebsite: appearanceSettings?.showCompanyWebsite ?? true,
    showCompanySiret: appearanceSettings?.showCompanySiret ?? true,
    showCompanyIce: appearanceSettings?.showCompanyIce ?? true,
    
    // Affichage des sections - UTILISE LES VALEURS PASSÉES EN PARAMÈTRE
    showClientAddress: appearanceSettings?.showClientAddress ?? true,
    showProjectInfo: appearanceSettings?.showProjectInfo ?? true,
    showNotes: appearanceSettings?.showNotes ?? true,
    showPaymentTerms: appearanceSettings?.showPaymentTerms ?? true,
    showBankDetails: appearanceSettings?.showBankDetails ?? false,
    showSignatureArea: appearanceSettings?.showSignatureArea ?? false,
    
    // Style des tableaux - VALEURS ALIGNÉES SUR QUOTEPREVIEW
    tableHeaderColor: appearanceSettings?.tableHeaderColor || '#F8F9FA',
    tableAlternateColor: appearanceSettings?.tableAlternateColor || '#F2F2F2',
    tableBorderColor: appearanceSettings?.tableBorderColor || '#E2E8F0',
    tableBorderStyle: appearanceSettings?.tableBorderStyle || 'rounded',
    tableBorderHorizontal: appearanceSettings?.tableBorderHorizontal ?? true,
    tableBorderVertical: appearanceSettings?.tableBorderVertical ?? true,
    tableBorderWidth: appearanceSettings?.tableBorderWidth ?? 1,
    sectionContrast: appearanceSettings?.sectionContrast ?? true,
    sectionContrastColor: appearanceSettings?.sectionContrastColor || '#EEF2FF',
    showSectionSubtotals: appearanceSettings?.showSectionSubtotals ?? true,
    tableRowPadding: appearanceSettings?.tableRowPadding ?? 8,
    tableColumnSpacing: appearanceSettings?.tableColumnSpacing ?? 12,
    
    // Moyens de paiement - VALEURS ALIGNÉES SUR QUOTEPREVIEW
    showPaymentMethods: appearanceSettings?.showPaymentMethods ?? true,
    paymentMethodsTitle: appearanceSettings?.paymentMethodsTitle || 'Moyens de paiement',
    paymentMethodsLayout: appearanceSettings?.paymentMethodsLayout || 'horizontal',
    paymentMethodsStyle: appearanceSettings?.paymentMethodsStyle || 'modern'
  };
  
  // Fonction pour obtenir le titre du document
  const getDocumentTitle = (): string => {
    switch (document.documentType) {
      case 'quote':
        return 'DEVIS';
      case 'invoice':
        return 'FACTURE';
      default:
        return 'DOCUMENT';
    }
  };

  // Fonction pour obtenir les dates spécifiques
  const getSpecificDates = () => {
    switch (document.documentType) {
      case 'quote':
        return (document as QuoteDocument).expiryDate ? (
          <tr>
            <td style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, paddingBottom: '4px' }}>
              Date d'expiration :
            </td>
            <td style={{ fontSize: `${settings.fontSize}px`, fontWeight: 'bold', paddingBottom: '4px' }}>
              {formatDate((document as QuoteDocument).expiryDate!)}
            </td>
          </tr>
        ) : null;
      case 'invoice':
        return (document as InvoiceDocument).dueDate ? (
          <tr>
            <td style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, paddingBottom: '4px' }}>
              Date d'échéance :
            </td>
            <td style={{ fontSize: `${settings.fontSize}px`, fontWeight: 'bold', paddingBottom: '4px' }}>
              {formatDate((document as InvoiceDocument).dueDate!)}
            </td>
          </tr>
        ) : null;
      default:
        return null;
    }
  };

  // Traitement des articles avec pagination
  const processedItems = useMemo(() => {
    if (!document.items) return [];
    
    return document.items.map((item, index) => ({
      ...item,
      totalHt: item.totalHt || item.totalHt || (item.quantity * item.unitPrice),
      totalTtc: item.totalTtc || item.totalTtc || ((item.quantity * item.unitPrice) * (1 + item.vatRate / 100))
    }));
  }, [document.items]);

  const itemsPerPage = 15;
  const pages = useMemo(() => {
    const items = processedItems;
    const pages = [];
    
    if (items.length <= itemsPerPage) {
      // Une seule page
      pages.push({
        items,
        pageNumber: 1,
        totalPages: 1,
        hasHeader: true,
        hasClientProject: true,
        hasTotals: true
      });
    } else {
      // Calculer le nombre de pages nécessaires
      const totalPages = Math.ceil(items.length / itemsPerPage);
      
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, items.length);
        const pageItems = items.slice(startIndex, endIndex);
        
        pages.push({
          items: pageItems,
          pageNumber: i + 1,
          totalPages,
          hasHeader: i === 0, // En-tête uniquement sur la première page
          hasClientProject: i === 0, // Client/Projet uniquement sur la première page
          hasTotals: i === totalPages - 1 // Totaux uniquement sur la dernière page
        });
      }
    }
    
    return pages;
  }, [processedItems]);

  // Composant d'en-tête réutilisable avec styles inline pour PDF
  const HeaderSection = () => (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: `2px solid ${settings.primaryColor}`
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Logo de l'entreprise */}
        {settings.showLogo && companyInfo?.logo && (
          <div style={{ marginBottom: '8px' }}>
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.name || "Logo entreprise"}
              style={{ 
                width: `${settings.logoSize}px`, 
                height: 'auto',
                maxHeight: `${settings.logoSize}px`,
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        {/* Informations de l'entreprise */}
        <div style={{ lineHeight: 1.4 }}>
          {settings.showCompanyName && companyInfo?.name && (
            <div style={{ 
              fontSize: `${Math.max(settings.fontSize + 2, 13)}px`, 
              fontWeight: 'bold',
              color: settings.primaryColor,
              marginBottom: '4px'
            }}>
              {companyInfo.name}
            </div>
          )}
          {settings.showCompanyAddress && companyInfo?.address && (
            <div style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, marginBottom: '2px' }}>
              {companyInfo.address}
            </div>
          )}
          {settings.showCompanyPhone && companyInfo?.phone && (
            <div style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, marginBottom: '2px' }}>
              Tél : {companyInfo.phone}
            </div>
          )}
          {settings.showCompanyEmail && companyInfo?.email && (
            <div style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, marginBottom: '2px' }}>
              {companyInfo.email}
            </div>
          )}
          {settings.showCompanyWebsite && companyInfo?.website && (
            <div style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, marginBottom: '2px' }}>
              {companyInfo.website}
            </div>
          )}
          {settings.showCompanySiret && companyInfo?.siret && (
            <div style={{ fontSize: `${settings.fontSize - 1}px`, color: settings.secondaryColor, marginBottom: '2px' }}>
              SIRET : {companyInfo.siret}
            </div>
          )}
          {settings.showCompanyIce && companyInfo?.ice && (
            <div style={{ fontSize: `${settings.fontSize - 1}px`, color: settings.secondaryColor }}>
              ICE : {companyInfo.ice}
            </div>
          )}
        </div>
      </div>

      {/* Titre du document et numéro */}
      <div style={{ textAlign: 'right', minWidth: '200px' }}>
        <h1 style={{ 
          fontSize: `${Math.max(settings.fontSize + 8, 20)}px`, 
          fontWeight: 'bold',
          color: settings.primaryColor,
          margin: '0 0 8px 0'
        }}>
          {getDocumentTitle()}
        </h1>
        <table style={{ marginLeft: 'auto', borderSpacing: '0 2px' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, paddingRight: '12px' }}>
                Numéro :
              </td>
              <td style={{ fontSize: `${settings.fontSize}px`, fontWeight: 'bold' }}>
                {document.number || 'Brouillon'}
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: `${settings.fontSize}px`, color: settings.secondaryColor, paddingBottom: '4px' }}>
                Date d'émission :
              </td>
              <td style={{ fontSize: `${settings.fontSize}px`, fontWeight: 'bold', paddingBottom: '4px' }}>
                {formatDate(document.issueDate)}
              </td>
            </tr>
            {getSpecificDates()}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Composant footer réutilisable avec styles inline pour PDF
  const FooterSection = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
    <div style={{
      marginTop: '32px',
      paddingTop: '16px',
      borderTop: `1px solid ${settings.primaryColor}`,
      fontSize: `${settings.fontSize - 1}px`,
      color: settings.secondaryColor,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>{companyInfo?.name || 'Document'} - Document généré le {formatDate(new Date().toISOString())}</div>
      <div>Page {pageNumber} sur {totalPages}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: settings.fontFamily, color: '#1F2937', backgroundColor: '#FFFFFF' }}>
      {pages.map((page) => (
        <div 
          key={page.pageNumber}
          style={{ 
            minHeight: '297mm', 
            padding: '20mm',
            paddingBottom: '40mm', // Espace réservé pour le footer
            pageBreakAfter: page.pageNumber < page.totalPages ? 'always' : 'auto',
            position: 'relative'
          }}
          className={page.pageNumber > 1 ? 'page-break-before' : ''}
        >
          {/* En-tête */}
          {page.hasHeader && <HeaderSection />}

          {/* Informations client et projet */}
          {page.hasClientProject && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Client */}
              {settings.showClientAddress && (
                <div style={{ 
                  padding: '16px', 
                  border: `1px solid ${settings.tableBorderColor}`,
                  borderRadius: settings.tableBorderStyle === 'rounded' ? '8px' : '0'
                }}>
                  <h3 style={{ 
                    fontSize: `${settings.fontSize + 1}px`, 
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    margin: '0 0 8px 0'
                  }}>
                    Client
                  </h3>
                  <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{document.clientName}</div>
                    {document.clientAddress && (
                      <div style={{ color: settings.secondaryColor }}>{document.clientAddress}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Projet */}
              {settings.showProjectInfo && document.projectName && (
                <div style={{ 
                  padding: '16px', 
                  border: `1px solid ${settings.tableBorderColor}`,
                  borderRadius: settings.tableBorderStyle === 'rounded' ? '8px' : '0'
                }}>
                  <h3 style={{ 
                    fontSize: `${settings.fontSize + 1}px`, 
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    margin: '0 0 8px 0'
                  }}>
                    Projet
                  </h3>
                  <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{document.projectName}</div>
                    {document.projectAddress && (
                      <div style={{ color: settings.secondaryColor }}>{document.projectAddress}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tableau des articles */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              border: `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}`,
              borderRadius: settings.tableBorderStyle === 'rounded' ? '8px' : '0',
              overflow: 'hidden'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: `${settings.fontSize}px`,
                border: 'none'
              }}>
              <thead>
                <tr style={{ backgroundColor: settings.tableHeaderColor }}>
                  <th style={{ 
                    padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                  }}>
                    Désignation
                  </th>
                  <th style={{ 
                    padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                  }}>
                    Qté
                  </th>
                  <th style={{ 
                    padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                  }}>
                    P.U. HT
                  </th>
                  <th style={{ 
                    padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                  }}>
                    TVA
                  </th>
                  <th style={{ 
                    padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: settings.primaryColor,
                    borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                  }}>
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const backgroundColor = isEven ? settings.tableAlternateColor : 'transparent';
                  
                  if (item.type === 'chapter' || item.type === 'section') {
                    return (
                      <tr key={item.id} style={{ backgroundColor: settings.sectionContrast ? settings.sectionContrastColor : 'transparent' }}>
                        <td 
                          colSpan={5} 
                          style={{ 
                            padding: `${settings.tableRowPadding + 2}px ${settings.tableColumnSpacing}px`,
                            fontWeight: 'bold',
                            color: settings.primaryColor,
                            borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none',
                            borderRight: settings.tableBorderVertical ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{item.designation}</span>
                            {settings.showSectionSubtotals && item.totalTtc && (
                              <span style={{ fontSize: `${settings.fontSize}px`, fontWeight: 'normal' }}>
                                Sous-total : {formatCurrency(item.totalTtc)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={item.id} style={{ backgroundColor }}>
                      <td style={{ 
                        padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                        borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.designation}</div>
                          {item.description && (
                            <div style={{ 
                              fontSize: `${settings.fontSize - 1}px`, 
                              color: settings.secondaryColor,
                              marginTop: '2px',
                              lineHeight: 1.3
                            }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                        textAlign: 'center',
                        borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td style={{ 
                        padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                        textAlign: 'right',
                        borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td style={{ 
                        padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                        textAlign: 'center',
                        borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {item.vatRate}%
                      </td>
                      <td style={{ 
                        padding: `${settings.tableRowPadding}px ${settings.tableColumnSpacing}px`,
                        textAlign: 'right',
                        fontWeight: '500',
                        borderBottom: settings.tableBorderHorizontal ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {formatCurrency(item.totalTtc)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Totaux */}
          {page.hasTotals && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginBottom: '32px'
            }}>
              <div style={{ 
                minWidth: '250px',
                border: `1px solid ${settings.tableBorderColor}`,
                borderRadius: settings.tableBorderStyle === 'rounded' ? '8px' : '0',
                overflow: 'hidden'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: `${settings.fontSize}px`,
                  border: 'none'
                }}>
                  <tbody>
                    <tr>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'left',
                        backgroundColor: '#F8FAFC',
                        borderBottom: settings.tableBorderHorizontal ? `1px solid ${settings.tableBorderColor}` : 'none',
                        borderRight: settings.tableBorderVertical ? `1px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        Total HT :
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        backgroundColor: '#F8FAFC',
                        borderBottom: settings.tableBorderHorizontal ? `1px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {formatCurrency(document.totalHt || document.totalHt || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'left',
                        backgroundColor: '#F8FAFC',
                        borderBottom: settings.tableBorderHorizontal ? `1px solid ${settings.tableBorderColor}` : 'none',
                        borderRight: settings.tableBorderVertical ? `1px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        Total TVA :
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        backgroundColor: '#F8FAFC',
                        borderBottom: settings.tableBorderHorizontal ? `1px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        {formatCurrency(document.totalVAT || document.totalVat || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: `${settings.fontSize + 1}px`,
                        fontWeight: 'bold',
                        color: settings.primaryColor,
                        backgroundColor: settings.primaryColor + '10',
                        borderTop: `2px solid ${settings.primaryColor}`,
                        borderRight: settings.tableBorderVertical ? `${settings.tableBorderWidth}px solid ${settings.tableBorderColor}` : 'none'
                      }}>
                        Total TTC :
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'right',
                        fontSize: `${settings.fontSize + 2}px`,
                        fontWeight: 'bold',
                        color: settings.primaryColor,
                        backgroundColor: settings.primaryColor + '10',
                        borderTop: `2px solid ${settings.primaryColor}`
                      }}>
                        {formatCurrency(document.totalTtc || document.totalTtc || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {page.hasTotals && settings.showNotes && document.notes && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: `${settings.fontSize + 1}px`, 
                fontWeight: 'bold',
                color: settings.primaryColor,
                marginBottom: '8px'
              }}>
                Notes
              </h3>
              <div style={{ 
                fontSize: `${settings.fontSize}px`,
                lineHeight: 1.5,
                color: settings.secondaryColor,
                whiteSpace: 'pre-line'
              }}>
                {document.notes}
              </div>
            </div>
          )}

          {/* Conditions */}
          {page.hasTotals && settings.showPaymentTerms && document.termsAndConditions && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: `${settings.fontSize + 1}px`, 
                fontWeight: 'bold',
                color: settings.primaryColor,
                marginBottom: '8px'
              }}>
                Conditions de paiement
              </h3>
              <div style={{ 
                fontSize: `${settings.fontSize}px`,
                lineHeight: 1.5,
                color: settings.secondaryColor,
                whiteSpace: 'pre-line'
              }}>
                {document.termsAndConditions}
              </div>
            </div>
          )}

          {/* FOOTER - Position absolue en bas de chaque page */}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '20mm', 
              left: '20mm', 
              right: '20mm',
              fontSize: `${settings.fontSize}px`,
            }}
          >
            <FooterSection pageNumber={page.pageNumber} totalPages={page.totalPages} />
          </div>
        </div>
      ))}
    </div>
  );
};