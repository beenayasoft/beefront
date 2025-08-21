/**
 * Page de détail d'un devis
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesApi } from '../api/quotes';
import { Quote, QuoteItem } from '../types/quotes.types';
import { handleApiError } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ValidateQuoteModal, SendQuoteModal, ConvertToInvoiceModal } from '../components/quotes';
import { useModalState } from '@/hooks/useModalState';
import QuoteA4Preview from '../components/quotes/QuoteA4Preview';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/use-toast';

/**
 * Page de détail d'un devis
 */
const QuoteDetail: React.FC = () => {
  // Récupérer l'ID du devis depuis l'URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États pour les données
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // États pour les modals
  const validateModal = useModalState();
  const sendModal = useModalState();
  const convertModal = useModalState();
  
  // États pour les nouvelles modales de succès et confirmation
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    buttonText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    buttonText: 'OK'
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    loading?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    loading: false
  });
  
  // Référence pour l'AbortController et cache des données
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const loadedQuoteIdRef = React.useRef<string | null>(null);
  
  // Fonction de chargement optimisée avec useCallback
  const loadQuoteData = useCallback(async () => {
    if (!id) return;
    
    // Si on a déjà chargé ce devis, ne pas recharger
    if (loadedQuoteIdRef.current === id) {
      return;
    }
    
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Créer un nouvel AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Charger les détails du devis (inclut déjà les items)
      const quoteData = await quotesApi.getQuoteDetails(id, abortController.signal);
      
      // Marquer ce devis comme chargé
      loadedQuoteIdRef.current = id;
      setQuote(quoteData);
      
      // Les items sont déjà inclus dans quoteData.items
      setQuoteItems(quoteData.items || []);
    } catch (err) {
      // Ne pas afficher d'erreur si la requête a été annulée
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
        return;
      }
      
      // Gérer l'erreur
      const errorMessage = handleApiError(err, 'Erreur lors du chargement du devis');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Charger les données du devis
  useEffect(() => {
    loadQuoteData();
    
    // Nettoyer l'AbortController au démontage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadQuoteData]);
  
  
  // Gérer l'acceptation du devis
  const handleAcceptQuote = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      const updatedQuote = await quotesApi.acceptQuote(id);
      setQuote(updatedQuote);
      
      toast({
        title: 'Devis accepté avec succès',
        description: `Le devis ${quote.number} a été marqué comme accepté`,
        variant: 'default'
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de l\'acceptation du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Gérer le rejet du devis
  const handleRejectQuote = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      const updatedQuote = await quotesApi.rejectQuote(id);
      setQuote(updatedQuote);
      
      toast({
        title: 'Devis rejeté',
        description: `Le devis ${quote.number} a été marqué comme rejeté`,
        variant: 'default'
      });
      
      // Marquer qu'un devis a été rejeté pour déclencher la mise à jour des opportunités
      sessionStorage.setItem('quoteRejected', 'true');
      
      // Optionnel : rediriger vers les opportunités après le rejet
      setTimeout(() => {
        navigate('/opportunities');
      }, 2000); // Attendre 2 secondes pour que l'utilisateur voie le changement
      
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors du rejet du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Gérer l'annulation du devis
  const handleCancelQuote = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      const updatedQuote = await quotesApi.cancelQuote(id);
      setQuote(updatedQuote);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de l\'annulation du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Gérer la duplication du devis
  const handleDuplicateQuote = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      console.log(`🔄 Duplication en cours pour le devis ${quote.number}...`);
      const newQuote = await quotesApi.duplicateQuote(id);
      console.log(`✅ Duplication réussie: nouveau devis ${newQuote.number}`);
      
      // Naviguer vers le nouveau devis
      navigate(`/devis/${newQuote.id}`);
      
      // Optionnel: afficher un message de succès
      // alert(`Devis dupliqué avec succès ! Nouveau numéro: ${newQuote.number}`);
    } catch (error) {
      console.error(`❌ Erreur duplication pour le devis ${quote.number}:`, error);
      const errorMessage = handleApiError(error, 'Erreur lors de la duplication du devis');
      setActionError(`Duplication impossible: ${errorMessage}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Gérer la validation du devis
  const handleValidateQuote = async (data: { notes?: string }) => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      const updatedQuote = await quotesApi.validateQuote(id, data);
      setQuote(updatedQuote);
      validateModal.actions.close();
      // Afficher un message de succès avec la nouvelle modale
      setSuccessModal({
        isOpen: true,
        title: 'Devis validé avec succès !',
        description: `Le devis ${quote.number} a été validé et est maintenant prêt à être envoyé.`,
        buttonText: 'Continuer'
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de la validation du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Gérer l'envoi du devis
  const handleSendQuote = async (data: { recipient_email: string; message?: string }) => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      await quotesApi.sendQuote(id, data);
      sendModal.actions.close();
      // Recharger les données du devis pour mettre à jour le statut
      const updatedQuote = await quotesApi.getQuoteDetails(id);
      setQuote(updatedQuote);
      // Afficher un message de succès avec la nouvelle modale
      setSuccessModal({
        isOpen: true,
        title: 'Devis envoyé avec succès !',
        description: `Le devis ${quote.number} a été envoyé au client par email.`,
        buttonText: 'OK'
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de l\'envoi du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Gérer la conversion en facture
  const handleConvertToInvoice = async (data: {
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    notes?: string;
    copyItems: boolean;
  }) => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      // ✅ Générer le numéro de facture avant la conversion
      const { settingsApi } = await import('@/features/settings/api/settings');
      const { formatNumberWithSettings, getDocumentFormat, getNextSequentialNumber } = await import('@/features/documents/utils/numberFormatting');
      
      let invoiceNumber: string;
      try {
        // Récupérer la configuration du tenant
        const tenantInfo = await settingsApi.getCurrentTenantInfo();
        const numberingSettings = tenantInfo.document_numbering || [];
        
        // Générer le numéro selon la configuration
        const format = getDocumentFormat(numberingSettings, 'invoice');
        const nextNumber = getNextSequentialNumber(numberingSettings, 'invoice');
        invoiceNumber = formatNumberWithSettings(format, nextNumber);
        
        console.log('🔢 Numéro de facture généré pour la conversion:', invoiceNumber);
      } catch (numberError) {
        console.error('Erreur génération numéro, utilisation du fallback:', numberError);
        // Fallback
        const { invoicesApi } = await import('@/features/documents/api/invoices');
        const fallbackResponse = await invoicesApi.getNextInvoiceNumber();
        invoiceNumber = fallbackResponse.number;
      }
      
      // ✅ Inclure le numéro généré dans les données de conversion
      const conversionData = {
        ...data,
        number: invoiceNumber // Ajouter le numéro généré
      };
      
      const invoice = await quotesApi.convertToInvoice(id, conversionData);
      
      // ✅ Incrémenter le compteur après conversion réussie
      try {
        const tenantInfo = await settingsApi.getCurrentTenantInfo();
        const numberingSettings = tenantInfo.document_numbering || [];
        const invoiceSettings = numberingSettings.find(s => s.document_type === 'invoice');
        
        if (invoiceSettings) {
          const updatedSettings = numberingSettings.map(setting => {
            if (setting.document_type === 'invoice') {
              return {
                ...setting,
                next_number: (setting.next_number || 1) + 1
              };
            }
            return setting;
          });
          
          await settingsApi.updateDocumentNumbering(updatedSettings);
          console.log('📈 Compteur de factures incrémenté après conversion');
        }
      } catch (counterError) {
        console.error('⚠️ Erreur lors de l\'incrémentation du compteur:', counterError);
        // Ne pas faire échouer la conversion pour un problème de compteur
      }
      
      convertModal.actions.close();
      // Afficher le message de succès avec redirection
      setSuccessModal({
        isOpen: true,
        title: 'Facture créée avec succès !',
        description: `La facture ${invoiceNumber} a été créée à partir du devis ${quote.number}.`,
        buttonText: 'Voir la facture',
        onConfirm: () => navigate(`/factures/${invoice.id}`)
      });
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de la conversion en facture');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Gérer la suppression du devis
  const handleDeleteQuote = async () => {
    if (!id || !quote) return;
    
    // Afficher la modale de confirmation au lieu de window.confirm
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le devis',
      description: `Êtes-vous sûr de vouloir supprimer le devis ${quote.number} ? Cette action est irréversible.`,
      onConfirm: performDeleteQuote
    });
  };

  const performDeleteQuote = async () => {
    if (!id || !quote) return;
    
    setConfirmModal(prev => ({ ...prev, loading: true }));
    
    try {
      await quotesApi.deleteQuote(id);
      setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
      
      // Afficher un message de succès puis rediriger
      setSuccessModal({
        isOpen: true,
        title: 'Devis supprimé',
        description: `Le devis ${quote.number} a été supprimé avec succès.`,
        buttonText: 'Retour à la liste',
        onConfirm: () => navigate('/devis')
      });
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, loading: false }));
      const errorMessage = handleApiError(error, 'Erreur lors de la suppression du devis');
      setActionError(errorMessage);
    }
  };
  
  // Gérer l'export du devis en PDF avec paramètres d'apparence backend
  const handleExportPdf = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      console.log(`🔄 Export PDF backend en cours pour le devis ${quote.number}...`);
      
      // Récupérer les paramètres d'apparence et infos tenant
      let appearanceSettings = null;
      let tenantInfo = null;
      
      try {
        const [settingsModule, tenantModule] = await Promise.all([
          import('@/lib/api/documentAppearance'),
          import('@/lib/api/tenant')
        ]);
        
        appearanceSettings = await settingsModule.documentAppearanceAPI.getAppearanceSettings();
        tenantInfo = await tenantModule.tenantApi.getCurrentTenantInfo();
        
        console.log('🎨 Paramètres récupérés pour PDF backend');
      } catch (settingsError) {
        console.warn('⚠️ Impossible de récupérer les paramètres, utilisation des valeurs par défaut:', settingsError);
      }
      
      // Préparer les données complètes pour le backend
      const pdfRequestData = {
        appearance_settings: appearanceSettings,
        tenant_info: tenantInfo,
        quote_data: {
          id: quote.id,
          number: quote.number,
          clientName: quote.clientName,
          projectName: quote.projectName,
          totalHt: quote.totalHt,
          totalVat: quote.totalVat,
          totalTtc: quote.totalTtc,
          items: quote.items,
          issueDate: quote.issueDate,
          expiryDate: quote.expiryDate,
          notes: quote.notes,
          termsAndConditions: quote.termsAndConditions
        }
      };
      
      console.log('📤 Envoi données complètes au backend pour PDF:', pdfRequestData);
      
      const blob = await quotesApi.exportQuoteToPdf(id, pdfRequestData);
      
      // Vérifier que le blob est valide
      if (!blob || blob.size === 0) {
        throw new Error('PDF vide ou invalide reçu du serveur');
      }
      
      console.log(`📄 PDF reçu - Taille: ${blob.size} bytes, Type: ${blob.type}`);
      
      // Créer un blob avec le type MIME correct pour PDF
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      
      // Créer un URL pour le blob et le télécharger
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `devis_${quote.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer après un délai pour permettre le téléchargement
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`✅ Export PDF backend réussi pour le devis ${quote.number} avec paramètres d'apparence`);
    } catch (error) {
      console.error(`❌ Erreur export PDF pour le devis ${quote.number}:`, error);
      const errorMessage = handleApiError(error, 'Erreur lors de l\'export du devis en PDF');
      setActionError(`Export PDF impossible: ${errorMessage}`);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Si erreur de chargement
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-red-500 text-center">
            <p>Erreur lors du chargement du devis</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => navigate('/devis')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Si pas de devis
  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p>Devis non trouvé</p>
            <button
              onClick={() => navigate('/devis')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header avec thème Benaya et coins arrondis */}
        <div className="Beenaya-gradient text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/devis')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{quote.number || 'Brouillon'}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quote.status === 'draft' ? 'bg-gray-500/80 text-white' :
                    quote.status === 'sent' ? 'bg-blue-500/80 text-white' :
                    quote.status === 'accepted' ? 'bg-green-500/80 text-white' :
                    'bg-red-500/80 text-white'
                  }`}>
                    {quote.status === 'draft' ? 'Brouillon' : 
                     quote.status === 'sent' ? 'Envoyé' :
                     quote.status === 'accepted' ? 'Accepté' :
                     quote.statusDisplay || quote.status}
                  </span>
                </div>
                <p className="text-slate-200 mt-1">
                  Client: {quote.clientName} - Projet: {quote.projectName || 'Devis - Opportunité normale'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right mr-4">
                <div className="text-slate-200 text-sm">Total TTC</div>
                <div className="text-xl font-bold">{formatCurrency(quote.totalTtc)}</div>
              </div>
              
              <div className="flex">
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Voir en plein écran"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                
                <button
                  onClick={handleExportPdf}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Télécharger PDF"
                  disabled={isActionLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleDuplicateQuote}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Dupliquer"
                  disabled={isActionLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <Link
                  to={`/devis/edit/${id}`}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message d'erreur pour les actions */}
        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {actionError}
          </div>
        )}

        {/* Layout principal exactement comme l'image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonnes principales (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Client et Projet (une seule card) */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Client */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="font-medium text-gray-900">Client</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{quote.clientName}</div>
                    {quote.clientAddress && (
                      <div className="text-sm text-gray-600">{quote.clientAddress}</div>
                    )}
                  </div>
                </div>

                {/* Projet */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="font-medium text-gray-900">Projet</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{quote.projectName || 'Devis - Opportunité normale'}</div>
                    {quote.projectAddress && (
                      <div className="text-sm text-gray-600">{quote.projectAddress}</div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-medium text-gray-900">Dates</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500">Date d'émission</div>
                      <div className="text-sm text-gray-900">{formatDate(quote.issueDate) || '25/06/2025'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date d'expiration</div>
                      <div className="text-sm text-gray-900">{quote.expiryDate ? formatDate(quote.expiryDate) : '25/07/2025'}</div>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-medium text-gray-900">Informations</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500">Validité</div>
                      <div className="text-sm text-gray-900">{quote.validityPeriod || '30 jours'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Créé le</div>
                      <div className="text-sm text-gray-900">{formatDate(quote.createdAt) || '25/06/2025'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détail du devis */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Détail du devis</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {quoteItems.length > 0 ? (
                      quoteItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.designation || item.description}</div>
                            {item.description && item.description !== item.designation && (
                              <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">
                            {item.vatRate}%
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(item.totalHt)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalTtc)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">Aucun élément dans ce devis</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totaux - Exactement comme l'image */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="text-right space-y-2">
                    <div className="flex justify-between items-center min-w-[200px]">
                      <span className="text-sm text-gray-600">Total HT:</span>
                      <span className="text-sm font-medium">{formatCurrency(quote.totalHt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total TVA:</span>
                      <span className="text-sm font-medium">{formatCurrency(quote.totalVat)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(quote.totalTtc)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Colonne de droite - Statut et actions exactement comme l'image (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Statut et actions - Design exact de l'image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut et actions</h3>
              
              {/* Statut actuel - Centré comme l'image */}
              <div className="text-center mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">Statut actuel</div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  quote.status === 'draft' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  quote.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300' :
                  'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    quote.status === 'draft' ? 'bg-gray-500' :
                    quote.status === 'sent' ? 'bg-blue-500' :
                    quote.status === 'accepted' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                  {quote.status === 'draft' ? 'Brouillon' : 
                   quote.status === 'sent' ? 'Envoyé' :
                   quote.status === 'accepted' ? 'Accepté' :
                   quote.statusDisplay || quote.status}
                </div>
              </div>

              {/* Montants - Disposition exacte de l'image */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total HT:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.totalHt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.totalVat)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span>Total TTC:</span>
                  <span className="text-slate-700">
                    {formatCurrency(quote.totalTtc)}
                  </span>
                </div>
              </div>

              {/* Actions principales - Design exact de l'image */}
              <div className="space-y-3">
                {/* Actions avec thème Benaya */}
                {quote.status === 'draft' && (
                  <>
                    <button
                      className="w-full flex items-center justify-center px-4 py-3 bg-Beenaya-600 text-white rounded-lg hover:bg-Beenaya-700 transition-colors font-medium gap-2"
                      onClick={() => sendModal.actions.open()}
                      disabled={isActionLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer au client
                    </button>
                    
                    <button
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      onClick={() => navigate(`/devis/edit/${id}`)}
                      disabled={isActionLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  </>
                )}

                {quote.status === 'sent' && (
                  <>
                    <button
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium gap-2"
                      onClick={handleAcceptQuote}
                      disabled={isActionLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marquer comme accepté
                    </button>
                    
                    <button
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium gap-2"
                      onClick={handleRejectQuote}
                      disabled={isActionLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Marquer comme refusé
                    </button>
                  </>
                )}

                {quote.status === 'accepted' && (
                  <button
                    className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium gap-2"
                    onClick={() => convertModal.actions.open()}
                    disabled={isActionLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Convertir en facture
                  </button>
                )}

                {/* Actions communes avec thème Benaya */}
                <button
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={handleDuplicateQuote}
                  disabled={isActionLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Dupliquer
                </button>

                <button
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={handleExportPdf}
                  disabled={isActionLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger PDF
                </button>
              </div>
            </div>

            {/* Résumé - Design exact de l'image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Éléments:</span>
                  <span className="font-medium text-gray-900 text-right">{quoteItems.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validité:</span>
                  <span className="font-medium text-gray-900 text-right">{quote.validityPeriod || '30 jours'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créé par:</span>
                  <span className="font-medium text-gray-900 text-right">{quote.createdBy || 'elvislex@live.fr'}</span>
                </div>
              </div>
            </div>

            {/* Notes et conditions */}
            {(quote.notes || quote.terms) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes et conditions</h3>
                
                <div className="space-y-4">
                  {quote.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
                    </div>
                  )}
                  
                  {quote.terms && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{quote.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    {/* Prévisualisation A4 */}
    <QuoteA4Preview
      quote={quote}
      isOpen={isFullScreen}
      onClose={() => setIsFullScreen(false)}
      onDownloadPdf={handleExportPdf}
    />

    {/* Ancien Modal Plein Écran - SUPPRIMER APRÈS */}
    {false && isFullScreen && quote && (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        {/* Header plein écran */}
        <div className="Beenaya-gradient text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{quote.number || 'Brouillon'}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              quote.status === 'draft' ? 'bg-gray-500/80 text-white' :
              quote.status === 'sent' ? 'bg-blue-500/80 text-white' :
              quote.status === 'accepted' ? 'bg-green-500/80 text-white' :
              'bg-red-500/80 text-white'
            }`}>
              {quote.status === 'draft' ? 'Brouillon' : 
               quote.status === 'sent' ? 'Envoyé' :
               quote.status === 'accepted' ? 'Accepté' :
               quote.statusDisplay || quote.status}
            </span>
          </div>
          <button
            onClick={() => setIsFullScreen(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Fermer plein écran"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu plein écran */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Informations client et projet - Layout horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Client
              </h3>
              <div className="space-y-2">
                <div className="font-medium">{quote.clientName}</div>
                {quote.clientAddress && <div className="text-sm text-gray-600">{quote.clientAddress}</div>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Projet
              </h3>
              <div className="space-y-2">
                <div className="font-medium">{quote.projectName || 'Devis - Opportunité normale'}</div>
                {quote.projectAddress && <div className="text-sm text-gray-600">{quote.projectAddress}</div>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dates
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500">Émission</div>
                  <div className="font-medium">{formatDate(quote.issueDate) || '25/06/2025'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Expiration</div>
                  <div className="font-medium">{quote.expiryDate ? formatDate(quote.expiryDate) : '25/07/2025'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table des éléments - Version plein écran */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Détail du devis</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Désignation</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Quantité</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Prix unitaire</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">TVA</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total HT</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quoteItems.length > 0 ? (
                    quoteItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.designation || item.description}</div>
                          {item.description && item.description !== item.designation && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                          {item.vatRate}%
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          {formatCurrency(item.totalHt)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(item.totalTtc)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>Aucun élément dans ce devis</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totaux - Version plein écran */}
            <div className="px-6 py-6 bg-gray-50 border-t">
              <div className="flex justify-end">
                <div className="text-right space-y-3 min-w-[300px]">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">Total HT:</span>
                    <span className="font-semibold">{formatCurrency(quote.totalHt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">Total TVA:</span>
                    <span className="font-semibold">{formatCurrency(quote.totalVat)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3 text-xl">
                    <span className="font-bold text-gray-900">Total TTC:</span>
                    <span className="font-bold text-Beenaya-600">{formatCurrency(quote.totalTtc)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modals */}
    {quote && (
      <>
        <ValidateQuoteModal
            open={validateModal.isOpen}
            onOpenChange={validateModal.actions.setOpen}
            quote={{
              id: quote.id,
              number: quote.number,
              clientName: quote.clientName,
              totalTtc: quote.totalTtc,
              status: quote.status
            }}
            onValidate={handleValidateQuote}
            loading={isActionLoading}
          />

          <SendQuoteModal
            open={sendModal.isOpen}
            onOpenChange={sendModal.actions.setOpen}
            quote={{
              id: quote.id,
              number: quote.number,
              clientName: quote.clientName,
              totalTtc: quote.totalTtc
            }}
            onSend={handleSendQuote}
            loading={isActionLoading}
          />

          <ConvertToInvoiceModal
            open={convertModal.isOpen}
            onOpenChange={convertModal.actions.setOpen}
            quote={{
              id: quote.id,
              number: quote.number,
              clientName: quote.clientName,
              totalTtc: quote.totalTtc
            }}
            onConvert={handleConvertToInvoice}
            loading={isActionLoading}
          />

          {/* Nouvelles modales de succès et de confirmation */}
          <SuccessModal
            open={successModal.isOpen}
            onOpenChange={(open) => setSuccessModal(prev => ({ ...prev, isOpen: open }))}
            title={successModal.title}
            description={successModal.description}
            buttonText={successModal.buttonText}
            onConfirm={successModal.onConfirm}
          />

          <ConfirmModal
            open={confirmModal.isOpen}
            onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}
            title={confirmModal.title}
            description={confirmModal.description}
            confirmText="Supprimer"
            cancelText="Annuler"
            variant="danger"
            onConfirm={confirmModal.onConfirm}
            loading={confirmModal.loading}
          />
      </>
    )}
    </>
  );
};

export default QuoteDetail;
