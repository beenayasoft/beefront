/**
 * Modal d'aperçu unifiée pour les factures - Version html2pdf optimisée
 * - Aperçu HTML avec DocumentPreview unifié
 * - PDF généré avec html2pdf.js depuis l'aperçu HTML
 * - Configuration optimisée pour une meilleure qualité
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, Printer, Eye, Loader2, FileText, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Invoice } from '../../types/invoices.types';
import { DocumentPreview } from '../shared/DocumentPreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDocumentAppearance } from '@/features/settings/hooks/useDocumentAppearance';
import { tenantApi } from '@/lib/api/tenant';
import { useCurrency } from '@/contexts/CurrencyContext';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { config: appearanceSettings, isLoading: isLoadingAppearance } = useDocumentAppearance();
  const { formatCurrency } = useCurrency();
  
  // États de la modal unifiée
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Référence vers le composant DocumentPreview pour la conversion PDF
  const previewRef = useRef<HTMLDivElement>(null);

  // Charger les informations du tenant
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        setError(null);
        const info = await tenantApi.getCurrentTenantInfo();
        setTenantInfo(info);
      } catch (error) {
        console.error('Erreur lors de la récupération des informations du tenant:', error);
        setError('Impossible de charger les informations de l\'entreprise');
      }
    };
    
    if (isOpen) {
      fetchTenantInfo();
    }
  }, [isOpen]);

  // Gestion du zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, toggleFullscreen, handleZoomIn, handleZoomOut]);

  // Préparer les données de l'entreprise - masquer si pas disponible
  const companyInfo = tenantInfo ? {
    name: tenantInfo.name || undefined,
    address: tenantInfo.address ? [
      tenantInfo.address.line1,
      tenantInfo.address.line2,
      `${tenantInfo.address.postal_code} ${tenantInfo.address.city}`,
      tenantInfo.address.country
    ].filter(Boolean).join(', ') : undefined,
    phone: tenantInfo.phone || undefined,
    email: tenantInfo.email || undefined,
    logo: tenantInfo.settings?.logo_url || tenantInfo.settings?.logo_base64,
    siret: tenantInfo.siret || undefined,
    website: tenantInfo.website || undefined,
    ice: tenantInfo.ice || undefined
  } : undefined;

  // Fonction pour générer le nom de fichier avec client et date
  const generateFilename = () => {
    const documentNumber = invoice.number || invoice.id;
    const clientName = invoice.clientName?.replace(/[^a-zA-Z0-9]/g, '') || 'Client';
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `facture-${documentNumber}_${clientName}_${currentDate}.pdf`;
  };

  // Configuration html2pdf optimisée pour la pagination multi-pages
  const html2pdfOptions = {
    margin: [0.1, 0.1, 0.1, 0.1], // Marges réduites : top, left, bottom, right (en pouces)
    filename: generateFilename(),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 1.5, // Réduction de l'échelle pour améliorer les performances
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1024,
      windowHeight: 1400 // Hauteur plus grande pour capturer le contenu complet
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.keep-together'
    }
  };

  const handleGeneratePdf = useCallback(async (action: 'preview' | 'download' | 'print') => {
    if (isLoadingAppearance) {
      toast({
        title: 'Chargement en cours',
        description: 'Veuillez patienter, les paramètres d\'apparence se chargent...',
        variant: 'default'
      });
      return;
    }

    if (!previewRef.current) {
      setError('Élément de prévisualisation non trouvé');
      return;
    }

    setIsGeneratingPdf(true);
    setError(null);
    
    try {
      const element = previewRef.current;
      
      if (action === 'download') {
        await html2pdf().set(html2pdfOptions).from(element).save();
        
        toast({
          title: 'PDF téléchargé',
          description: 'La facture a été téléchargée avec succès',
          variant: 'default'
        });
      } else if (action === 'preview') {
        const pdfBlob = await html2pdf().set(html2pdfOptions).from(element).output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        
        toast({
          title: 'Aperçu généré',
          description: 'L\'aperçu s\'ouvre dans un nouvel onglet',
          variant: 'default'
        });
      } else if (action === 'print') {
        const pdfBlob = await html2pdf().set(html2pdfOptions).from(element).output('blob');
        const url = URL.createObjectURL(pdfBlob);
        
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Attendre que l'impression soit terminée avant de nettoyer
            const handleAfterPrint = () => {
              setTimeout(() => {
                try {
                  if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                  }
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.warn('Erreur lors du nettoyage de l\'iframe:', e);
                }
              }, 500);
            };

            // Fallback: nettoyer après 30 secondes si aucun événement afterprint
            const fallbackTimeout = setTimeout(handleAfterPrint, 30000);
            
            // Écouter les événements d'impression
            const wrappedAfterPrint = () => {
              clearTimeout(fallbackTimeout);
              handleAfterPrint();
            };
            
            iframeWindow.addEventListener('beforeprint', () => {
              console.log('Impression démarrée');
            });
            
            iframeWindow.addEventListener('afterprint', wrappedAfterPrint);
            
            // Déclencher l'impression
            iframeWindow.print();
          }
        };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur génération PDF:', error);
      setError(`Impossible de générer le PDF: ${errorMessage}`);
      toast({
        title: 'Erreur',
        description: `Impossible de générer le PDF: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [isLoadingAppearance, html2pdfOptions, toast]);

  // Fonctions d'action simplifiées utilisant handleGeneratePdf
  const handlePreview = useCallback(() => handleGeneratePdf('preview'), [handleGeneratePdf]);
  const handleDownload = useCallback(() => handleGeneratePdf('download'), [handleGeneratePdf]);
  const handlePrint = useCallback(() => handleGeneratePdf('print'), [handleGeneratePdf]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
    >
      {/* Interface améliorée avec vraie prévisualisation */}
      <div className={`bg-white ${
        isFullscreen 
          ? 'w-full h-full' 
          : 'max-w-7xl max-h-[95vh] rounded-lg shadow-2xl'
      }`}>
        
        {/* Barre d'outils améliorée */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Aperçu de la Facture N° {invoice.number || 'Brouillon'}
            </h2>
            
          </div>

          <div className="flex items-center gap-2">
            {/* Contrôles de zoom */}
            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">
              {zoom}%
            </span>
            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {/* Bouton plein écran */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            {/* Actions principales */}
            <Button
              onClick={handlePreview}
              disabled={isGeneratingPdf}
              variant="outline"
              size="sm"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              PDF
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={isGeneratingPdf}
              size="sm"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Télécharger
            </Button>
            
            <Button
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              variant="outline"
              size="sm"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="hover:bg-red-50 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Zone d'erreur */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Zone de prévisualisation unifiée */}
        <div className={`${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(95vh-120px)]'
        } overflow-auto bg-gray-100 p-4`}>
          
          {isLoadingAppearance ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Chargement des paramètres d'apparence...</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                ref={previewRef}
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <DocumentPreview 
                  document={{
                    ...invoice,
                    documentType: 'invoice' as const
                  }}
                  companyInfo={companyInfo}
                  appearanceSettings={appearanceSettings}
                />
              </div>
            </div>
          )}
        </div>

        {/* Informations du document en bas */}
        {!isFullscreen && (
          <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span><strong>Client:</strong> {invoice.clientName || 'Non défini'}</span>
                <span><strong>Date:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : 'Non définie'}</span>
              </div>
              <div className="flex items-center gap-6">
                <span><strong>Total HT:</strong> {formatCurrency(Number(invoice.totalHt) || 0)}</span>
                <span><strong>Total TTC:</strong> {formatCurrency(Number(invoice.totalTtc) || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreviewModal;