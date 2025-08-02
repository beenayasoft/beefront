import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TenantInfo } from "@/lib/types/tenant";

// Types génériques pour tout type de document
interface DocumentItem {
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
  discount?: number;
}

interface BaseDocument {
  id: string;
  number: string;
  status: string;
  clientId?: string;
  clientName: string;
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  projectAddress?: string;
  issueDate: string;
  items?: DocumentItem[];
  notes?: string;
  termsAndConditions?: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Extension pour les factures
interface Invoice extends BaseDocument {
  dueDate?: string;
  paymentTerms?: number;
  paidAmount?: number;
  remainingAmount?: number;
  payments?: any[];
  quoteNumber?: string;
}

// Extension pour les devis
interface Quote extends BaseDocument {
  expiryDate?: string;
  validityPeriod?: number;
}

type Document = Invoice | Quote;

interface DocumentPreviewProps {
  document: Document;
  documentType: "invoice" | "quote";
  tenantInfo?: TenantInfo;
  appearanceSettings?: {
    primaryColor?: string;
    fontFamily?: string;
    fontSize?: number;
    showLogo?: boolean;
    logoSize?: number;
    showCompanyName?: boolean;
    showCompanySlogan?: boolean;
    showCompanyAddress?: boolean;
    showCompanyPhone?: boolean;
    showCompanyEmail?: boolean;
    showCompanySiret?: boolean;
    showCompanyVat?: boolean;
    showClientAddress?: boolean;
    showProjectInfo?: boolean;
    showNotes?: boolean;
    showPaymentTerms?: boolean;
    showBankDetails?: boolean;
    showSignatureArea?: boolean;
    showLegalMentions?: boolean;
    // Options de style du tableau
    tableBorderStyle?: 'straight' | 'rounded';
    tableBorderHorizontal?: boolean;
    tableBorderVertical?: boolean;
    sectionContrast?: boolean;
    showSectionSubtotals?: boolean;
  };
}

// Constantes pour la pagination
const ITEMS_PER_PAGE = 15;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const HEADER_HEIGHT_MM = 60;
const FOOTER_HEIGHT_MM = 60;
const ITEM_HEIGHT_MM = 10;

export function DocumentPreview({ 
  document, 
  documentType,
  tenantInfo,
  appearanceSettings = {
    primaryColor: "#1B333F",
    fontFamily: "Inter",
    fontSize: 11,
    showLogo: true,
    logoSize: 12,
    showCompanyName: true,
    showCompanySlogan: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanySiret: true,
    showCompanyVat: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
    showLegalMentions: true,
    // Valeurs par défaut pour le style du tableau
    tableBorderStyle: 'rounded',
    tableBorderHorizontal: true,
    tableBorderVertical: true,
    sectionContrast: true,
    showSectionSubtotals: true,
  }
}: DocumentPreviewProps) {
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<DocumentItem[][]>([]);

  // Format a date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Get document-specific labels and data
  const getDocumentConfig = () => {
    if (documentType === "invoice") {
      const invoice = document as Invoice;
      return {
        title: "FACTURE",
        dateLabel: "Date d'échéance:",
        dateValue: formatDate(invoice.dueDate),
        showPaymentInfo: true,
        showSignature: false,
        originLabel: invoice.quoteNumber ? "Devis d'origine:" : null,
        originValue: invoice.quoteNumber || null,
      };
    } else {
      const quote = document as Quote;
      return {
        title: "DEVIS",
        dateLabel: "Date d'expiration:",
        dateValue: formatDate(quote.expiryDate),
        showPaymentInfo: false,
        showSignature: appearanceSettings.showSignatureArea,
        originLabel: null,
        originValue: null,
      };
    }
  };

  const docConfig = getDocumentConfig();

  // Get section items for hierarchical display
  const getSectionItems = (parentId?: string) => {
    if (!document.items) return [];
    return document.items.filter(item => item.parentId === parentId);
  };

  // Get root level items (no parent)
  const getRootItems = () => {
    if (!document.items) return [];
    return document.items.filter(item => !item.parentId);
  };

  // Calculate section total
  const getSectionTotal = (sectionId: string) => {
    if (!document.items) return { totalHT: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTTC = 0;
    
    const sectionItems = document.items.filter(item => item.parentId === sectionId);
    
    sectionItems.forEach(item => {
      if (item.type !== 'chapter' && item.type !== 'section') {
        totalHT += item.totalHT;
        totalTTC += item.totalTTC;
      }
    });
    
    return { totalHT, totalTTC };
  };

  // Calculer la pagination des éléments
  useEffect(() => {
    if (!document.items || document.items.length === 0) {
      setPaginatedItems([[]]);
      setTotalPages(1);
      return;
    }

    const availableHeightMM = A4_HEIGHT_MM - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM;
    const maxItemsPerPage = Math.floor(availableHeightMM / ITEM_HEIGHT_MM);
    
    const allItems = flattenItems(document.items);
    
    const pages: DocumentItem[][] = [];
    for (let i = 0; i < allItems.length; i += maxItemsPerPage) {
      pages.push(allItems.slice(i, i + maxItemsPerPage));
    }
    
    if (pages.length === 0) {
      pages.push([]);
    }
    
    setPaginatedItems(pages);
    setTotalPages(pages.length);
  }, [document.items]);

  // Aplatir la structure hiérarchique des éléments pour la pagination
  const flattenItems = (items: DocumentItem[]): DocumentItem[] => {
    const result: DocumentItem[] = [];
    
    const processItems = (itemsList: DocumentItem[], level = 0) => {
      for (const item of itemsList) {
        result.push(item);
        
        if ((item.type === 'chapter' || item.type === 'section') && item.id) {
          const childItems = getSectionItems(item.id);
          processItems(childItems, level + 1);
        }
      }
    };
    
    processItems(getRootItems());
    return result;
  };

  // Naviguer vers la page précédente
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Naviguer vers la page suivante
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Render hierarchical items
  const renderItems = (items: DocumentItem[], level = 0) => {
    return items.map((item) => {
      if (item.type === 'chapter' || item.type === 'section') {
        const { totalHT } = getSectionTotal(item.id);
        const childItems = getSectionItems(item.id);
        
        return (
          <React.Fragment key={item.id}>
            <tr 
              className={`
                ${appearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''} 
                transition-colors
              `}
              style={{
                backgroundColor: appearanceSettings.sectionContrast 
                  ? `${appearanceSettings.primaryColor}15` // 15 = ~8% d'opacité
                  : 'white'
              }}
            >
              <td 
                className={`py-3 px-4 font-bold text-sm ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}
                style={{ 
                  paddingLeft: `${level * 20 + 16}px`,
                  color: appearanceSettings.primaryColor
                }}
              >
                <span style={{ color: appearanceSettings.primaryColor }}>
                  {item.designation}
                </span>
                {appearanceSettings.showSectionSubtotals && (
                  <span className="ml-2 text-xs font-normal text-gray-600">
                    ({childItems.length} éléments)
                  </span>
                )}
              </td>
              <td className={`py-3 px-4 ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}></td>
              <td className={`py-3 px-4 ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}></td>
              <td className={`py-3 px-4 ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}></td>
              <td className="py-3 px-4 text-right font-bold text-sm" style={{ color: appearanceSettings.primaryColor }}>
                {appearanceSettings.showSectionSubtotals ? `${formatCurrency(totalHT)} MAD` : ''}
              </td>
            </tr>
            
            {renderItems(childItems, level + 1)}
          </React.Fragment>
        );
      }
      
      const isEvenRow = items.indexOf(item) % 2 === 0;
      
      return (
        <tr 
          key={item.id} 
          className={`
            ${appearanceSettings.tableBorderHorizontal ? 'border-b border-gray-100' : ''} 
            bg-white 
            hover:bg-blue-50/30 
            transition-colors duration-150
          `}
        >
          <td 
            className={`py-3 px-4 ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''}`}
            style={{ paddingLeft: `${level * 20 + 16}px` }}
          >
            <div className="font-medium text-sm text-gray-900">{item.designation}</div>
            {item.description && (
              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                {item.description}
              </div>
            )}
          </td>
          <td className={`py-3 px-4 text-center ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
            {item.quantity}
          </td>
          <td className={`py-3 px-4 text-center ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
            {item.unit || 'u'}
          </td>
          <td className={`py-3 px-4 text-right ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm`}>
            <span className="font-medium text-gray-900">{formatCurrency(Math.abs(item.unitPrice))} MAD</span>
            {item.discount && item.discount > 0 && (
              <div className="text-xs text-red-600 font-medium mt-1">
                -{item.discount}%
              </div>
            )}
          </td>
          <td className="py-3 px-4 text-right font-semibold text-sm">
            <span className={item.type === 'discount' ? "text-red-600" : "text-gray-900"}>
              {formatCurrency(Math.abs(item.totalHT))} {item.type === 'discount' && "-"} MAD
            </span>
          </td>
        </tr>
      );
    });
  };

  // Document styles - modern template only
  const templateStyles = {
    headerBg: "bg-white",
    headerBorder: "border-b border-neutral-200",
    titleColor: appearanceSettings.primaryColor,
    sectionTitleColor: appearanceSettings.primaryColor,
    tableBorder: "border-none",
    tableHeaderBg: "bg-neutral-100",
  };

  // Get logo size styles (using pixels) - real size for document preview
  const getLogoSizeStyles = () => {
    const size = appearanceSettings.logoSize || 12;
    return {
      width: `${size * 4}px`, // Taille réelle
      height: `${size * 4}px`
    };
  };

  // Get icon size styles (for SVG inside logo) - slightly smaller than logo
  const getIconSizeStyles = () => {
    const logoSize = appearanceSettings.logoSize || 12;
    const iconSize = Math.max(4, Math.round(logoSize * 0.7)); // 70% de la taille du logo
    return {
      width: `${iconSize * 4}px`, // Taille réelle
      height: `${iconSize * 4}px`
    };
  };

  const logoSizeStyles = getLogoSizeStyles();
  const iconSizeStyles = getIconSizeStyles();

  return (
    <div className="w-full h-full bg-neutral-100 p-4 overflow-auto">
      {/* A4 container - full document view like Microsoft Word */}
      <div 
        className="bg-white shadow-xl mx-auto relative flex flex-col"
        style={{ 
          width: "210mm", // A4 width
          height: "297mm", // A4 height fixe
          maxWidth: "none", // Pas de limitation
          fontSize: `${appearanceSettings.fontSize || 11}px`,
          fontFamily: appearanceSettings.fontFamily || "Inter",
          lineHeight: "1.4"
        }}
      >
        {/* EN-TÊTE - Retour au style original */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-start mb-8">
            {/* Logo + Nom + Slogan - à gauche */}
            <div className="space-y-3">
              {(appearanceSettings.showLogo || appearanceSettings.showCompanyName || appearanceSettings.showCompanySlogan) && (
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  {appearanceSettings.showLogo && (
                    <>
                      {tenantInfo?.settings?.logo_url || tenantInfo?.settings?.logo_base64 ? (
                        <img 
                          src={tenantInfo.settings.logo_url || tenantInfo.settings.logo_base64} 
                          alt={`Logo ${tenantInfo.name}`}
                          className="object-contain rounded-xl"
                          style={logoSizeStyles}
                        />
                      ) : (
                        <div className="rounded-xl flex items-center justify-center" style={{ ...logoSizeStyles, backgroundColor: appearanceSettings.primaryColor }}>
                          <div className="text-white" style={iconSizeStyles}>
                            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                              <g fill="currentColor" opacity="0.9">
                                <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                                <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
                                <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
                                <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
                                <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
                                <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
                              </g>
                              <path
                                d="M15 20L18.5 23.5L25 17"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Nom et slogan */}
                  {(appearanceSettings.showCompanyName || appearanceSettings.showCompanySlogan) && (
                    <div>
                      {appearanceSettings.showCompanyName && (
                        <h1 className="text-xl font-bold" style={{ color: appearanceSettings.primaryColor }}>
                          {tenantInfo?.name || "Votre Entreprise"}
                        </h1>
                      )}
                      {appearanceSettings.showCompanySlogan && (
                        <p className="text-sm text-neutral-600">
                          {tenantInfo?.slogan || "Votre spécialiste"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Info - à droite */}
            <div className="text-right">
              <div className="text-3xl font-bold mb-1" style={{ color: appearanceSettings.primaryColor }}>
                {docConfig.title}
              </div>
              <div className="text-xl font-semibold mb-4" style={{ color: appearanceSettings.primaryColor }}>
                N° {document.number || "Brouillon"}
              </div>
              <div className="text-sm text-neutral-600 space-y-2">
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'émission:</span>
                  <span>{formatDate(document.issueDate)}</span>
                </div>
                {docConfig.dateValue && (
                  <div className="flex justify-end gap-2">
                    <span className="font-medium">{docConfig.dateLabel}</span>
                    <span>{docConfig.dateValue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CORPS DU DOCUMENT - Contenu principal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Section CLIENT et ADRESSE DU CHANTIER - Déplacées dans le corps */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-12">
              {/* Section CLIENT */}
              <div className="max-w-sm">
                <h3 className="font-bold text-sm mb-2" style={{ color: appearanceSettings.primaryColor }}>CLIENT</h3>
                <div className="border-b border-gray-300 mb-3"></div>
                <div className="text-sm">
                  <div className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>{document.clientName || "Client"}</div>
                  {document.clientAddress && (
                    <div className="text-gray-600 mt-1 whitespace-pre-line">
                      {document.clientAddress}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Section ADRESSE DU CHANTIER */}
              {appearanceSettings.showProjectInfo && document.projectName && (
                <div className="max-w-sm">
                  <h3 className="font-bold text-sm mb-2" style={{ color: appearanceSettings.primaryColor }}>ADRESSE DU CHANTIER</h3>
                  <div className="border-b border-gray-300 mb-3"></div>
                  <div className="text-sm">
                    <div className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>{document.projectName}</div>
                    {document.projectAddress && (
                      <div className="text-gray-600 mt-1 whitespace-pre-line">
                        {document.projectAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Items - Tableau avec options de style paramétrables */}
          <div className="flex-1 overflow-auto px-6 py-4">
          <div 
            className={`
              ${appearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
              overflow-hidden 
              ${appearanceSettings.tableBorderHorizontal || appearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''} 
              ${appearanceSettings.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
            `}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: appearanceSettings.primaryColor, opacity: 0.8 }}>
                  <th className={`py-3 px-4 text-left font-semibold text-white ${appearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Désignation</th>
                  <th className={`py-3 px-4 text-center font-semibold text-white ${appearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Qté</th>
                  <th className={`py-3 px-4 text-center font-semibold text-white ${appearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Unité</th>
                  <th className={`py-3 px-4 text-center font-semibold text-white ${appearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Prix U. HT</th>
                  <th className="py-3 px-4 text-center font-semibold text-white">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {document.items && document.items.length > 0 ? (
                  renderItems(getRootItems())
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Aucun élément à afficher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section MODES DE PAIEMENT - Après le tableau des articles */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-12">
              {/* Section MODES DE PAIEMENT */}
              <div className="max-w-sm">
                <h3 className="font-bold text-sm mb-2" style={{ color: appearanceSettings.primaryColor }}>MODES DE PAIEMENT</h3>
                <div className="border-b border-gray-300 mb-3"></div>
                <div className="text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏦</span>
                      <span className="text-gray-700">Virement bancaire</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🧾</span>
                      <span className="text-gray-700">Chèque</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tableau des totaux */}
              <div className="w-80 ml-auto">
                <div 
                  className={`
                    ${appearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                    overflow-hidden 
                    ${appearanceSettings.tableBorderHorizontal || appearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''} 
                    ${appearanceSettings.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
                  `}
                >
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr className={`${appearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total HT</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(document.totalHT || 0)} MAD</td>
                      </tr>
                      <tr className={`${appearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TVA</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(document.totalVAT || 0)} MAD</td>
                      </tr>
                      <tr className={`${appearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${appearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TTC</td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: appearanceSettings.primaryColor }}>{formatCurrency(document.totalTTC || 0)} MAD</td>
                      </tr>
                      <tr>
                        <td 
                          className={`py-3 px-4 font-bold text-white text-base ${appearanceSettings.tableBorderVertical ? 'border-r border-white/20' : ''}`}
                          style={{ backgroundColor: appearanceSettings.primaryColor, opacity: 0.9 }}
                        >
                          Net à payer
                        </td>
                        <td 
                          className="py-3 px-4 text-right font-bold text-white text-base" 
                          style={{ backgroundColor: appearanceSettings.primaryColor, opacity: 0.9 }}
                        >
                          {formatCurrency(document.totalTTC || 0)} MAD
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Zone signature */}
                {docConfig.showSignature && (
                  <div className="mt-4">
                    <div 
                      className={`
                        w-full h-16 bg-gray-50 flex items-center justify-center text-gray-500 text-sm
                        ${appearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                        ${appearanceSettings.tableBorderHorizontal || appearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''}
                      `}
                    >
                      Zone de signature
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - Maximum 5 lignes */}
        <div 
          className="px-6 py-2 flex-shrink-0 text-xs"
          style={{ minHeight: "35mm", maxHeight: "35mm", overflow: "hidden" }} // ~5 lignes d'espace
        >
          <div className="h-full flex flex-col justify-start space-y-1">
            
            {/* Ligne 1: Conditions de paiement (si activées) */}
            {appearanceSettings.showPaymentTerms && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>
                  {documentType === "invoice" ? "Conditions:" : "Modalités:"}
                </span>
                <span className="ml-2">
                  {document.termsAndConditions || (documentType === "invoice" ? "Paiement à 30 jours." : "Acompte 30% - Solde fin travaux")}
                </span>
              </div>
            )}
            
            {/* Ligne 2: Coordonnées bancaires (factures uniquement) */}
            {appearanceSettings.showBankDetails && documentType === "invoice" && tenantInfo?.bank_info && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>Banque:</span>
                <span className="ml-2">
                  {[
                    tenantInfo.bank_info.iban && `IBAN: ${tenantInfo.bank_info.iban}`,
                    tenantInfo.bank_info.bic && `BIC: ${tenantInfo.bank_info.bic}`
                  ].filter(Boolean).join(' - ')}
                </span>
              </div>
            )}
            
            {/* Ligne 3: Notes (si présentes) */}
            {appearanceSettings.showNotes && document.notes && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>Notes:</span>
                <span className="ml-2">{document.notes.substring(0, 80)}{document.notes.length > 80 ? '...' : ''}</span>
              </div>
            )}
            
            {/* Trait de séparation */}
            <div 
              className="w-full h-px my-2"
              style={{ backgroundColor: appearanceSettings.primaryColor }}
            ></div>
            
            {/* Ligne 4: Adresse de l'entreprise */}
            {appearanceSettings.showCompanyAddress && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>Adresse:</span>
                <span className="ml-2">
                  {[
                    tenantInfo?.address?.line1,
                    tenantInfo?.address?.postal_code && tenantInfo?.address?.city ? `${tenantInfo.address.postal_code} ${tenantInfo.address.city}` : tenantInfo?.address?.postal_code || tenantInfo?.address?.city,
                    tenantInfo?.address?.country
                  ].filter(Boolean).join(' - ') || "Adresse entreprise"}
                </span>
              </div>
            )}
            
            {/* Ligne 5: Contacts et informations légales */}
            <div className="flex justify-between items-end">
              <div className="flex flex-wrap gap-4">
                {appearanceSettings.showCompanyPhone && tenantInfo?.phone && (
                  <span>
                    <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>Tél:</span>
                    <span className="ml-1">{tenantInfo.phone}</span>
                  </span>
                )}
                {appearanceSettings.showCompanyEmail && tenantInfo?.email && (
                  <span>
                    <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>Email:</span>
                    <span className="ml-1">{tenantInfo.email}</span>
                  </span>
                )}
                {appearanceSettings.showCompanySiret && tenantInfo?.legal?.siret && (
                  <span>
                    <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>SIRET:</span>
                    <span className="ml-1">{tenantInfo.legal.siret}</span>
                  </span>
                )}
                {appearanceSettings.showCompanyVat && tenantInfo?.legal?.vat_number && (
                  <span>
                    <span className="font-semibold" style={{ color: appearanceSettings.primaryColor }}>TVA:</span>
                    <span className="ml-1">{tenantInfo.legal.vat_number}</span>
                  </span>
                )}
              </div>
              <div className="text-neutral-400">
                Généré par Beenaya
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}