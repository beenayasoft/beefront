import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "../types/invoices.types";
import { getInvoiceById, generateInvoicePdf, sendInvoice } from "../api/invoices";
import { formatCurrency } from "@/lib/utils";
import { SendInvoiceModal } from "../components/invoices/SendInvoiceModal";
import { toast } from "@/components/ui/use-toast";
import { useDocumentAppearance } from '@/features/settings/hooks/useDocumentAppearance';
import { tenantApi } from '@/lib/api/tenant';
import { documentAppearanceAPI } from '@/lib/api/documentAppearance';

export default function InvoicePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  
  // Utiliser les paramètres d'apparence sauvegardés
  const { settings: appearanceSettings, isLoading: isLoadingAppearance } = useDocumentAppearance();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [fallbackAppearanceSettings, setFallbackAppearanceSettings] = useState<any>(null);
  
  // Utiliser les paramètres du hook en priorité, sinon fallback
  const effectiveAppearanceSettings = appearanceSettings && Object.keys(appearanceSettings).length > 0 
    ? appearanceSettings 
    : fallbackAppearanceSettings;
  
  // Debug supprimé - paramètres correctement appliqués

  // Récupérer les informations du tenant
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const info = await tenantApi.getCurrentTenantInfo();
        console.log('💼 InvoicePreview - Tenant info récupéré:', info);
        setTenantInfo(info);
      } catch (error) {
        console.error('Erreur lors de la récupération des informations du tenant:', error);
      }
    };
    
    fetchTenantInfo();
  }, []);
  
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

  // Load invoice data
  useEffect(() => {
    // Essayer d'abord de récupérer depuis sessionStorage
    const storedInvoice = sessionStorage.getItem('previewInvoice');
    
    if (storedInvoice) {
      try {
        setInvoice(JSON.parse(storedInvoice));
        setLoading(false);
        return;
      } catch (err) {
        console.error("Erreur lors du parsing de l'aperçu:", err);
        // Continue to try loading from API if parsing fails
      }
    }
    
    // Si pas de données dans sessionStorage ou erreur de parsing, essayer de charger depuis l'API
    if (id && id !== 'preview') {
      const fetchInvoice = async () => {
      try {
          const invoiceData = await getInvoiceById(id);
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          setError("Facture non trouvée");
        }
      } catch (err) {
        setError("Erreur lors du chargement de la facture");
        console.error(err);
        } finally {
          setLoading(false);
      }
      };
      
      fetchInvoice();
    } else if (!storedInvoice) {
      setError("Aucune donnée d'aperçu disponible");
      setLoading(false);
    }
  }, [id]);

  // Print the invoice
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF
  const handleDownload = async () => {
    if (!invoice || !invoice.id) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture: ID manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloading(true);
      const pdfBlob = await generateInvoicePdf(invoice.id);
      
      // Créer un URL pour le blob
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Facture_${invoice.number || 'brouillon'}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Téléchargement réussi",
        description: "La facture a été téléchargée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture PDF",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Send by email
  const handleSendEmail = async (data: { recipient_email: string; message?: string }) => {
    if (!invoice) return;
    
    try {
      await sendInvoice(invoice.id, data);
      setSendModalOpen(false);
      toast({
        title: "Facture envoyée",
        description: "La facture a été envoyée avec succès par email.",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la facture:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la facture.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Beenaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Facture non trouvée"}</h2>
          <Button onClick={() => navigate("/factures")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">
                Aperçu de la facture
              </h1>
              <p className="text-Beenaya-100 mt-1">
                {invoice.number || "Brouillon"} - {invoice.clientName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleDownload}
              disabled={downloading || !invoice.id || invoice.status === 'draft'}
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Téléchargement...
                </>
              ) : (
                <>
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
                </>
              )}
            </Button>
            
            <Button 
              className="bg-white text-Beenaya-900 hover:bg-white/90"
              onClick={() => setSendModalOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer par email
            </Button>
          </div>
        </div>
      </div>

      {/* Document A4 imprimable avec styles d'apparence appliqués */}
      <div 
        className="bg-white shadow-lg rounded-lg mx-auto print:shadow-none print:rounded-none print:m-0 print:p-0 relative flex flex-col" 
        style={{ 
          width: "210mm", // A4 width
          height: "297mm", // A4 height fixe
          maxWidth: "none", // Pas de limitation
          fontSize: `${effectiveAppearanceSettings?.fontSize || 11}px`,
          fontFamily: effectiveAppearanceSettings?.fontFamily || "Inter",
          lineHeight: "1.4"
        }}
      >
        {/* EN-TÊTE - Style DocumentPreview */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-start mb-8">
            {/* Logo + Nom + Slogan - à gauche */}
            <div className="space-y-3">
              {(effectiveAppearanceSettings?.showLogo || effectiveAppearanceSettings?.showCompanyName || effectiveAppearanceSettings?.showCompanySlogan) && (
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  {effectiveAppearanceSettings?.showLogo && (
                    <>
                      {tenantInfo?.settings?.logo_url || tenantInfo?.settings?.logo_base64 ? (
                        <img 
                          src={tenantInfo.settings.logo_url || tenantInfo.settings.logo_base64} 
                          alt={`Logo ${tenantInfo.name}`}
                          className="object-contain rounded-xl"
                          style={{
                            width: `${(effectiveAppearanceSettings?.logoSize || 12) * 4}px`,
                            height: `${(effectiveAppearanceSettings?.logoSize || 12) * 4}px`
                          }}
                        />
                      ) : (
                        <div 
                          className="rounded-xl flex items-center justify-center" 
                          style={{ 
                            width: `${(effectiveAppearanceSettings?.logoSize || 12) * 4}px`,
                            height: `${(effectiveAppearanceSettings?.logoSize || 12) * 4}px`,
                            backgroundColor: effectiveAppearanceSettings?.primaryColor || '#1B333F'
                          }}
                        >
                          <div 
                            className="text-white" 
                            style={{
                              width: `${Math.max(4, Math.round((effectiveAppearanceSettings?.logoSize || 12) * 0.7)) * 4}px`,
                              height: `${Math.max(4, Math.round((effectiveAppearanceSettings?.logoSize || 12) * 0.7)) * 4}px`
                            }}
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
                  {(effectiveAppearanceSettings?.showCompanyName || effectiveAppearanceSettings?.showCompanySlogan) && (
                    <div>
                      {effectiveAppearanceSettings?.showCompanyName && (
                        <h1 className="text-xl font-bold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>
                          {tenantInfo?.name || "BEENAYA"}
                        </h1>
                      )}
                      {effectiveAppearanceSettings?.showCompanySlogan && (
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
              <div className="text-3xl font-bold mb-1" style={{ color: effectiveAppearanceSettings?.primaryColor }}>
                FACTURE
              </div>
              <div className="text-xl font-semibold mb-4" style={{ color: effectiveAppearanceSettings?.primaryColor }}>
                N° {invoice.number || "Brouillon"}
              </div>
              <div className="text-sm text-neutral-600 space-y-2">
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'émission:</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'échéance:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
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
              {effectiveAppearanceSettings?.showClientAddress !== false && (
                <div className="max-w-sm">
                  <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings?.primaryColor }}>CLIENT</h3>
                  <div className="border-b border-gray-300 mb-3"></div>
                  <div className="text-sm">
                    <div className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>{invoice.clientName || "Client"}</div>
                    {invoice.clientAddress && (
                      <div className="text-gray-600 mt-1 whitespace-pre-line">
                        {invoice.clientAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Section ADRESSE DU CHANTIER */}
              {effectiveAppearanceSettings?.showProjectInfo !== false && (invoice.projectName || invoice.projectAddress) && (
                <div className="max-w-sm">
                  <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings?.primaryColor }}>ADRESSE DU CHANTIER</h3>
                  <div className="border-b border-gray-300 mb-3"></div>
                  <div className="text-sm">
                    {invoice.projectName && (
                      <div className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>{invoice.projectName}</div>
                    )}
                    {invoice.projectAddress && (
                      <div className="text-gray-600 mt-1 whitespace-pre-line">
                        {invoice.projectAddress}
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
                ${effectiveAppearanceSettings?.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                overflow-hidden 
                ${effectiveAppearanceSettings?.tableBorderHorizontal || effectiveAppearanceSettings?.tableBorderVertical ? 'border border-gray-200' : ''} 
                ${effectiveAppearanceSettings?.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
              `}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: effectiveAppearanceSettings?.primaryColor, opacity: 0.8 }}>
                    <th className={`py-3 px-4 text-left font-semibold text-white ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Désignation</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Qté</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Unité</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>Prix U. HT</th>
                    <th className={`py-3 px-4 text-center font-semibold text-white ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20 last:border-r-0' : ''}`}>TVA</th>
                    <th className="py-3 px-4 text-center font-semibold text-white">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => {
                      const isSection = item.type === 'chapter' || item.type === 'section';
                      const isEvenRow = index % 2 === 0;
                      
                      return (
                        <tr 
                          key={item.id}
                          className={`
                            ${effectiveAppearanceSettings?.tableBorderHorizontal ? 'border-b border-gray-100' : ''}
                            ${isSection ? 'transition-colors' : 'bg-white hover:bg-blue-50/30 transition-colors duration-150'}
                          `}
                          style={{
                            backgroundColor: isSection && effectiveAppearanceSettings?.sectionContrast 
                              ? `${effectiveAppearanceSettings?.primaryColor}15`
                              : isSection ? 'white' : 'white'
                          }}
                        >
                          <td 
                            className={`py-3 px-4 ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} ${isSection ? 'font-bold text-sm' : ''}`}
                            style={isSection ? { color: effectiveAppearanceSettings?.primaryColor } : {}}
                          >
                            <div className={`${isSection ? 'font-bold' : 'font-medium'} text-sm text-gray-900`}>{item.designation}</div>
                            {item.description && (
                              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-center ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
                            {isSection ? '' : item.quantity}
                          </td>
                          <td className={`py-3 px-4 text-center ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm text-gray-700`}>
                            {isSection ? '' : (item.unit || 'u')}
                          </td>
                          <td className={`py-3 px-4 text-right ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm`}>
                            {isSection ? '' : (
                              <span className="font-medium text-gray-900">{formatCurrency(Math.abs(item.unitPrice))} MAD</span>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-right ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200 last:border-r-0' : ''} text-sm`}>
                            {isSection ? '' : `${item.vatRate}%`}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-sm">
                            {isSection ? (
                              effectiveAppearanceSettings?.showSectionSubtotals ? (
                                <span style={{ color: effectiveAppearanceSettings?.primaryColor }}>
                                  {formatCurrency(item.totalHT)} MAD
                                </span>
                              ) : ''
                            ) : (
                              <span className="text-gray-900">
                                {formatCurrency(Math.abs(item.totalHT))} MAD
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
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
                <h3 className="font-bold text-sm mb-2" style={{ color: effectiveAppearanceSettings?.primaryColor }}>MODES DE PAIEMENT</h3>
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
                    {effectiveAppearanceSettings?.showBankDetails !== false && tenantInfo && (
                      <div className="mt-4 text-xs text-gray-600">
                        {tenantInfo.iban && <p>IBAN: {tenantInfo.iban}</p>}
                        {tenantInfo.bic && <p>BIC: {tenantInfo.bic}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tableau des totaux */}
              <div className="w-80 ml-auto">
                <div 
                  className={`
                    ${effectiveAppearanceSettings?.tableBorderStyle === 'rounded' ? 'rounded-lg' : ''} 
                    overflow-hidden 
                    ${effectiveAppearanceSettings?.tableBorderHorizontal || effectiveAppearanceSettings?.tableBorderVertical ? 'border border-gray-200' : ''} 
                    ${effectiveAppearanceSettings?.tableBorderStyle === 'rounded' ? 'shadow-sm' : ''}
                  `}
                >
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr className={`${effectiveAppearanceSettings?.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total HT</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(invoice.totalHT || 0)} MAD</td>
                      </tr>
                      <tr className={`${effectiveAppearanceSettings?.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TVA</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(invoice.totalVAT || 0)} MAD</td>
                      </tr>
                      <tr className={`${effectiveAppearanceSettings?.tableBorderHorizontal ? 'border-b border-gray-200' : ''}`}>
                        <td className={`py-3 px-4 font-medium ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-gray-200' : ''}`}>Total TTC</td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>{formatCurrency(invoice.totalTTC || 0)} MAD</td>
                      </tr>
                      <tr>
                        <td 
                          className={`py-3 px-4 font-bold text-white text-base ${effectiveAppearanceSettings?.tableBorderVertical ? 'border-r border-white/20' : ''}`}
                          style={{ backgroundColor: effectiveAppearanceSettings?.primaryColor, opacity: 0.9 }}
                        >
                          Net à payer
                        </td>
                        <td 
                          className="py-3 px-4 text-right font-bold text-white text-base" 
                          style={{ backgroundColor: effectiveAppearanceSettings?.primaryColor, opacity: 0.9 }}
                        >
                          {formatCurrency(invoice.totalTTC || 0)} MAD
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
            {effectiveAppearanceSettings?.showPaymentTerms && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>
                  Conditions:
                </span>
                <span className="ml-2">
                  {invoice.termsAndConditions || `Paiement à ${invoice.paymentTerms || 30} jours - Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
            )}
            
            {/* Ligne 2: Coordonnées bancaires (factures uniquement) */}
            {effectiveAppearanceSettings?.showBankDetails && tenantInfo?.bank_info && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>Banque:</span>
                <span className="ml-2">
                  {[
                    tenantInfo.bank_info.iban && `IBAN: ${tenantInfo.bank_info.iban}`,
                    tenantInfo.bank_info.bic && `BIC: ${tenantInfo.bank_info.bic}`
                  ].filter(Boolean).join(' - ')}
                </span>
              </div>
            )}
            
            {/* Ligne 3: Notes (si présentes) */}
            {effectiveAppearanceSettings?.showNotes && invoice.notes && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>Notes:</span>
                <span className="ml-2">{invoice.notes.substring(0, 80)}{invoice.notes.length > 80 ? '...' : ''}</span>
              </div>
            )}
            
            {/* Trait de séparation */}
            <div 
              className="w-full h-px my-2"
              style={{ backgroundColor: effectiveAppearanceSettings?.primaryColor }}
            ></div>
            
            {/* Ligne 4: Adresse de l'entreprise */}
            {effectiveAppearanceSettings?.showCompanyAddress && (
              <div className="mb-1">
                <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>Adresse:</span>
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
                {effectiveAppearanceSettings?.showCompanyPhone && tenantInfo?.phone && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>Tél:</span>
                    <span className="ml-1">{tenantInfo.phone}</span>
                  </span>
                )}
                {effectiveAppearanceSettings?.showCompanyEmail && tenantInfo?.email && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>Email:</span>
                    <span className="ml-1">{tenantInfo.email}</span>
                  </span>
                )}
                {effectiveAppearanceSettings?.showCompanySiret && tenantInfo?.legal?.siret && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>SIRET:</span>
                    <span className="ml-1">{tenantInfo.legal.siret}</span>
                  </span>
                )}
                {effectiveAppearanceSettings?.showCompanyVat && tenantInfo?.legal?.vat_number && (
                  <span>
                    <span className="font-semibold" style={{ color: effectiveAppearanceSettings?.primaryColor }}>TVA:</span>
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

      {/* Modal d'envoi */}
      {invoice && (
        <SendInvoiceModal
          open={sendModalOpen}
          onOpenChange={setSendModalOpen}
          invoice={{
            id: invoice.id,
            number: invoice.number,
            clientName: invoice.clientName,
            totalTTC: invoice.totalTTC || 0
          }}
          onSend={handleSendEmail}
          loading={false}
        />
      )}
    </div>
  );
}