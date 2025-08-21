/**
 * Composant d'affichage A4 pour les devis
 * Unifié avec DocumentPreview pour une apparence cohérente
 */
import React, { useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Quote } from '../../types/quotes.types';
import { formatCurrency } from '@/lib/utils';
import { useDocumentAppearance } from '@/features/settings/hooks/useDocumentAppearance';
import { tenantApi } from '@/lib/api/tenant';
import { documentAppearanceAPI } from '@/lib/api/documentAppearance';

interface QuoteA4PreviewProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf?: () => void;
}

export const QuoteA4Preview: React.FC<QuoteA4PreviewProps> = ({
  quote,
  isOpen,
  onClose,
  onDownloadPdf
}) => {
  // Utiliser les paramètres d'apparence sauvegardés (même logique que InvoicePreview)
  const { settings: appearanceSettings, isLoading: isLoadingAppearance } = useDocumentAppearance();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [fallbackAppearanceSettings, setFallbackAppearanceSettings] = useState<any>(null);
  
  const [scale, setScale] = useState(0.9); // Taille fixe raisonnable (90%)
  
  // Hook pour la numérotation
  
  // Utiliser les paramètres du hook en priorité, sinon fallback, sinon valeurs par défaut (MÊME que DocumentPreview)
  const effectiveAppearanceSettings = (appearanceSettings && Object.keys(appearanceSettings).length > 0 
    ? appearanceSettings 
    : fallbackAppearanceSettings) || {
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
    tableBorderStyle: 'rounded',
    tableBorderHorizontal: true,
    tableBorderVertical: true,
    sectionContrast: true,
    showSectionSubtotals: true,
  };

  // Format a date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Get document-specific labels and data (MÊME LOGIQUE que DocumentPreview)
  const getDocumentConfig = () => {
    return {
      title: "DEVIS",
      dateLabel: "Date d'expiration:",
      dateValue: formatDate(quote.expiryDate),
      showPaymentInfo: false,
      showSignature: effectiveAppearanceSettings.showSignatureArea,
      originLabel: null,
      originValue: null,
    };
  };

  const docConfig = getDocumentConfig();

  // Get logo size styles (using pixels) - real size for document preview (MÊME que DocumentPreview)
  const getLogoSizeStyles = () => {
    const size = effectiveAppearanceSettings.logoSize;
    return {
      width: `${size * 4}px`, // Taille réelle
      height: `${size * 4}px`
    };
  };

  // Get icon size styles (for SVG inside logo) - slightly smaller than logo
  const getIconSizeStyles = () => {
    const logoSize = effectiveAppearanceSettings.logoSize;
    const iconSize = Math.max(4, Math.round(logoSize * 0.7)); // 70% de la taille du logo
    return {
      width: `${iconSize * 4}px`, // Taille réelle
      height: `${iconSize * 4}px`
    };
  };

  const logoSizeStyles = getLogoSizeStyles();
  const iconSizeStyles = getIconSizeStyles();
  
  // Récupérer les informations du tenant
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const info = await tenantApi.getCurrentTenantInfo();
        setTenantInfo(info);
      } catch (error) {
        console.error('Erreur lors de la récupération des informations du tenant:', error);
      }
    };
    
    if (isOpen) {
      fetchTenantInfo();
    }
  }, [isOpen]);
  
  // Fallback pour récupérer les paramètres d'apparence si le hook échoue
  useEffect(() => {
    if (!isLoadingAppearance && (!appearanceSettings || Object.keys(appearanceSettings).length === 0)) {
      const fetchDirectAppearance = async () => {
        try {
          const directSettings = await documentAppearanceAPI.getAppearanceSettings();
          setFallbackAppearanceSettings(directSettings);
        } catch (error) {
          console.error('Erreur lors de la récupération des paramètres d\'apparence:', error);
        }
      };
      
      fetchDirectAppearance();
    }
  }, [appearanceSettings, isLoadingAppearance]);

  // Handle window resize for scaling
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const documentWidth = 794; // 210mm en pixels (210 * 3.78)
      
      // Pour la plupart des écrans, 0.9 est une bonne taille
      // Pour les très petits écrans, on s'adapte
      if (viewportWidth < 1200) {
        const scaleX = (viewportWidth - 100) / documentWidth;
        return Math.min(Math.max(scaleX, 0.5), 0.9);
      }
      
      return 0.9; // Taille fixe pour les écrans normaux
    };

    const handleResize = () => {
      setScale(calculateScale());
    };

    // Set initial scale
    setScale(calculateScale());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Charger les paramètres uniquement quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const loadSettings = async () => {
        try {
          // Charger l'apparence
          const freshSettings = await documentAppearanceAPI.getAppearanceSettings();
          setFallbackAppearanceSettings(freshSettings);
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      };
      
      loadSettings();
      
      // Écouter les événements de changement de configuration d'apparence seulement
      window.addEventListener('focus', loadSettings);
      
      return () => {
        window.removeEventListener('focus', loadSettings);
      };
    }
  }, [isOpen]);


  // Helper pour convertir les objets adresse en chaîne
  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (!address || typeof address !== 'object') return '';
    
    const parts = [];
    if (address.line1) parts.push(address.line1);
    if (address.line2) parts.push(address.line2);
    if (address.postal_code || address.city) {
      const cityPart = [address.postal_code, address.city].filter(Boolean).join(' ');
      if (address.country) parts.push(`${cityPart}, ${address.country}`);
      else parts.push(cityPart);
    }
    return parts.join('\n');
  };

  if (!isOpen) return null;
  
  // Gestion d'erreur pour éviter les crashes
  if (!quote) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-red-600">Erreur: Devis non disponible</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Fermer</button>
        </div>
      </div>
    );
  }

  // Calcul des totaux
  const calculateTotals = () => {
    return quote.items?.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const vatRate = Number(item.vatRate) || 0;
      
      const baseTotal = quantity * unitPrice;
      const discountAmount = baseTotal * discount / 100;
      const totalHT = baseTotal - discountAmount;
      const vatAmount = totalHT * vatRate / 100;
      const totalTtc = totalHT + vatAmount;
      
      return {
        totalHT: acc.totalHT + totalHT,
        totalVAT: acc.totalVAT + vatAmount,
        totalTtc: acc.totalTtc + totalTtc
      };
    }, { totalHT: 0, totalVAT: 0, totalTtc: 0 }) || { totalHT: 0, totalVAT: 0, totalTtc: 0 };
  };

  const totals = calculateTotals();

  const handlePrint = () => {
    window.print();
  };

  // Gestionnaire pour télécharger PDF avec paramètres d'apparence backend
  const handleDownloadPdfWithSettings = async () => {
    try {
      console.log('🎨 Téléchargement PDF backend avec paramètres d\'apparence:', effectiveAppearanceSettings);
      
      // Préparer les données complètes pour le backend
      const pdfRequestData = {
        appearance_settings: effectiveAppearanceSettings,
        tenant_info: tenantInfo,
        quote_data: {
          id: quote.id,
          number: quote.number,
          clientName: quote.clientName,
          totalHt: quote.totalHt,
          totalTtc: quote.totalTtc,
          items: quote.items
        }
      };
      
      console.log('📤 Envoi données complètes au backend:', pdfRequestData);
      
      // Importer l'API des devis et télécharger avec tous les paramètres
      const { quotesApi } = await import('../../api/quotes');
      const pdfBlob = await quotesApi.exportQuoteToPdf(quote.id, pdfRequestData);
      
      // Créer le téléchargement
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${quote.number?.replace(/[^a-zA-Z0-9]/g, '_') || 'brouillon'}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ PDF backend téléchargé avec succès');
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF backend:', error);
      
      // Fallback vers la méthode simple
      if (onDownloadPdf) {
        console.log('🔄 Fallback vers méthode simple...');
        onDownloadPdf();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Contrôles en haut */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {onDownloadPdf && (
          <button
            onClick={handleDownloadPdfWithSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
            title="Télécharger PDF avec apparence"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handlePrint}
          className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Imprimer"
        >
          <Printer className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Container avec scaling adaptatif pour le document A4 */}
      <div 
        className="max-w-none max-h-[90vh] overflow-auto mx-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div 
          className="bg-white shadow-xl mx-auto relative flex flex-col" 
          style={{ 
            width: "210mm", // A4 width
            height: "297mm", // A4 height fixe (comme DocumentPreview)
            fontSize: `${effectiveAppearanceSettings.fontSize || 11}px`,
            fontFamily: effectiveAppearanceSettings.fontFamily || "Inter",
            lineHeight: "1.4"
          }}
        >
        {/* EN-TÊTE - Style unifié avec DocumentPreview */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-start mb-8">
            {/* Logo + Nom + Slogan - à gauche */}
            <div className="space-y-3">
              {(effectiveAppearanceSettings.showLogo || effectiveAppearanceSettings.showCompanyName || effectiveAppearanceSettings.showCompanySlogan) && (
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  {effectiveAppearanceSettings.showLogo && (
                    <>
                      {tenantInfo?.settings?.logo_url || tenantInfo?.settings?.logo_base64 ? (
                        <img 
                          src={tenantInfo.settings.logo_url || tenantInfo.settings.logo_base64} 
                          alt={`Logo ${tenantInfo.name}`}
                          className="object-contain rounded-xl"
                          style={logoSizeStyles}
                        />
                      ) : (
                        <div 
                          className="rounded-xl flex items-center justify-center" 
                          style={{ 
                            ...logoSizeStyles, 
                            backgroundColor: effectiveAppearanceSettings.primaryColor
                          }}
                        >
                          <div 
                            className="text-white" 
                            style={iconSizeStyles}
                          >
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
                  {(effectiveAppearanceSettings.showCompanyName || effectiveAppearanceSettings.showCompanySlogan) && (
                    <div>
                      {effectiveAppearanceSettings.showCompanyName && (
                        <h1 className="text-xl font-bold" style={{ color: effectiveAppearanceSettings.primaryColor }}>
                          {tenantInfo?.name || "BEENAYA"}
                        </h1>
                      )}
                      {effectiveAppearanceSettings.showCompanySlogan && (
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
              <div className="text-3xl font-bold mb-1" style={{ color: effectiveAppearanceSettings.primaryColor }}>
                {docConfig.title}
              </div>
              <div className="text-xl font-semibold mb-4" style={{ color: effectiveAppearanceSettings.primaryColor }}>
                N° {quote.number || 'Brouillon'}
              </div>
              <div className="text-sm text-neutral-600 space-y-2">
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'émission:</span>
                  <span>{formatDate(quote.issueDate)}</span>
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
        <div className="flex-1 flex flex-col">
          
          {/* Section CLIENT et ADRESSE DU CHANTIER - Déplacées dans le corps */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-12">
              {/* Section CLIENT */}
              <div className="max-w-sm">
                <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings.primaryColor }}>CLIENT</h3>
                <div className="border-b border-gray-300 mb-3"></div>
                <div className="text-sm">
                  <div className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>{quote.clientName || "Client"}</div>
                  {quote.clientAddress && (
                    <div className="text-gray-600 mt-1 whitespace-pre-line">
                      {quote.clientAddress}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Section ADRESSE DU CHANTIER */}
              {effectiveAppearanceSettings.showProjectInfo && quote.projectName && (
                <div className="max-w-sm">
                  <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings.primaryColor }}>ADRESSE DU CHANTIER</h3>
                  <div className="border-b border-gray-300 mb-3"></div>
                  <div className="text-sm">
                    <div className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>{quote.projectName}</div>
                    {quote.projectAddress && (
                      <div className="text-gray-600 mt-1 whitespace-pre-line">
                        {quote.projectAddress}
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
                ${effectiveAppearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                overflow-hidden 
                ${effectiveAppearanceSettings.tableBorderHorizontal || effectiveAppearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''} 
                ${effectiveAppearanceSettings.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
              `}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: effectiveAppearanceSettings.primaryColor, opacity: 0.8 }}>
                    <th className={`py-3 px-4 text-left font-semibold text-white ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Désignation</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Qté</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Unité</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Prix U. HT</th>
                    <th className="py-3 px-4 text-center font-semibold text-white">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items && quote.items.length > 0 ? (
                    quote.items.map((item, index) => {
                      const isSection = item.type === 'chapter' || item.type === 'section';
                      const isEvenRow = index % 2 === 0;
                      
                      return (
                        <tr 
                          key={item.id || index}
                          className={`
                            ${effectiveAppearanceSettings.tableBorderHorizontal ? 'border-b border-gray-100' : ''}
                            ${isSection ? 'transition-colors' : 'bg-white hover:bg-blue-50/30 transition-colors duration-150'}
                          `}
                          style={{
                            backgroundColor: isSection && effectiveAppearanceSettings.sectionContrast 
                              ? `${effectiveAppearanceSettings.primaryColor}15`
                              : isSection ? 'white' : 'white'
                          }}
                        >
                          <td 
                            className={`py-3 px-4 ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} ${isSection ? 'font-bold text-sm' : ''}`}
                            style={isSection ? { color: effectiveAppearanceSettings.primaryColor } : {}}
                          >
                            <div className={`${isSection ? 'font-bold' : 'font-medium'} text-sm text-gray-900`}>{item.designation}</div>
                            {item.description && (
                              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-center ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
                            {isSection ? '' : item.quantity}
                          </td>
                          <td className={`py-3 px-4 text-center ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
                            {isSection ? '' : (item.unit || 'u')}
                          </td>
                          <td className={`py-3 px-4 text-right ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm`}>
                            {isSection ? '' : (
                              <span className="font-medium text-gray-900">{formatCurrency(Math.abs(item.unitPrice))} MAD</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-sm">
                            {isSection ? (
                              effectiveAppearanceSettings.showSectionSubtotals ? (
                                <span style={{ color: effectiveAppearanceSettings.primaryColor }}>
                                  {formatCurrency(item.totalHt)} MAD
                                </span>
                              ) : ''
                            ) : (
                              <span className="text-gray-900">
                                {formatCurrency(Math.abs(item.totalHt))} MAD
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
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
          </div>

          {/* Section MODES DE PAIEMENT - Après le tableau des articles */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-12">
              {/* Section MODES DE PAIEMENT */}
              <div className="max-w-sm">
                <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings.primaryColor }}>MODES DE PAIEMENT</h3>
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
                    ${effectiveAppearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                    overflow-hidden 
                    ${effectiveAppearanceSettings.tableBorderHorizontal || effectiveAppearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''} 
                    ${effectiveAppearanceSettings.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
                  `}
                >
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr className={`${effectiveAppearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total HT</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(quote.totalHt || 0)} MAD</td>
                      </tr>
                      <tr className={`${effectiveAppearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TVA</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(quote.totalVat || 0)} MAD</td>
                      </tr>
                      <tr className={`${effectiveAppearanceSettings.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TTC</td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>{formatCurrency(quote.totalTtc || 0)} MAD</td>
                      </tr>
                      <tr>
                        <td 
                          className={`py-3 px-4 font-bold text-white text-base ${effectiveAppearanceSettings.tableBorderVertical ? 'border-r border-white/20' : ''}`}
                          style={{ backgroundColor: effectiveAppearanceSettings.primaryColor, opacity: 0.9 }}
                        >
                          Net à payer
                        </td>
                        <td 
                          className="py-3 px-4 text-right font-bold text-white text-base" 
                          style={{ backgroundColor: effectiveAppearanceSettings.primaryColor, opacity: 0.9 }}
                        >
                          {formatCurrency(totals.totalTtc || 0)} MAD
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
                        ${effectiveAppearanceSettings.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                        ${effectiveAppearanceSettings.tableBorderHorizontal || effectiveAppearanceSettings.tableBorderVertical ? 'border border-gray-200' : ''}
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
            {effectiveAppearanceSettings.showPaymentTerms && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>
                  Modalités:
                </span>
                <span className="ml-2">
                  {quote.termsAndConditions || "Acompte 30% - Solde fin travaux"}
                </span>
              </div>
            )}
            
            {/* Ligne 2: Validité du devis */}
            <div className="mb-1">
              <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>Validité:</span>
              <span className="ml-2">
                Ce devis est valable {quote.validityPeriod || 30} jours à compter de la date d'émission.
              </span>
            </div>
            
            {/* Ligne 3: Notes (si présentes) */}
            {effectiveAppearanceSettings.showNotes && quote.notes && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>Notes:</span>
                <span className="ml-2">{quote.notes.substring(0, 80)}{quote.notes.length > 80 ? '...' : ''}</span>
              </div>
            )}
            
            {/* Trait de séparation */}
            <div 
              className="w-full h-px my-2"
              style={{ backgroundColor: effectiveAppearanceSettings.primaryColor }}
            ></div>
            
            {/* Ligne 4: Adresse de l'entreprise */}
            {effectiveAppearanceSettings.showCompanyAddress && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>Adresse:</span>
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
                {effectiveAppearanceSettings.showCompanyPhone && tenantInfo?.phone && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>Tél:</span>
                    <span className="ml-1">{tenantInfo.phone}</span>
                  </span>
                )}
                {effectiveAppearanceSettings.showCompanyEmail && tenantInfo?.email && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>Email:</span>
                    <span className="ml-1">{tenantInfo.email}</span>
                  </span>
                )}
                {effectiveAppearanceSettings.showCompanySiret && tenantInfo?.legal?.siret && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>SIRET:</span>
                    <span className="ml-1">{tenantInfo.legal.siret}</span>
                  </span>
                )}
                {effectiveAppearanceSettings.showCompanyVat && tenantInfo?.legal?.vat_number && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings.primaryColor }}>ICE:</span>
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

      <style>{`
        @media print {
          /* Reset scaling for print */
          div[style*="transform: scale"] {
            transform: none !important;
          }
          
          .bg-white {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
          }
          
          button {
            display: none !important;
          }
          
          .fixed {
            position: relative !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuoteA4Preview;