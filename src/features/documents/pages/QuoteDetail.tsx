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

/**
 * Page de détail d'un devis
 */
const QuoteDetail: React.FC = () => {
  // Récupérer l'ID du devis depuis l'URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États pour les données
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // États pour les modals
  const validateModal = useModalState();
  const sendModal = useModalState();
  const convertModal = useModalState();
  
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
      const newQuote = await quotesApi.duplicateQuote(id);
      navigate(`/devis/${newQuote.id}`);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de la duplication du devis');
      setActionError(errorMessage);
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
      // Afficher un message de succès
      alert('Devis validé avec succès !');
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
      alert('Devis envoyé avec succès !');
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
      const invoice = await quotesApi.convertToInvoice(id, data);
      convertModal.actions.close();
      // Rediriger vers la facture créée
      navigate(`/factures/${invoice.id}`);
      alert('Facture créée avec succès !');
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
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      return;
    }
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      await quotesApi.deleteQuote(id);
      navigate('/devis');
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de la suppression du devis');
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Gérer l'export du devis en PDF
  const handleExportPdf = async () => {
    if (!id || !quote) return;
    
    setIsActionLoading(true);
    setActionError(null);
    
    try {
      const blob = await quotesApi.exportQuoteToPdf(id);
      
      // Créer un URL pour le blob et le télécharger
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `devis_${quote.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erreur lors de l\'export du devis en PDF');
      setActionError(errorMessage);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis {quote.number}</h1>
            <p className="text-benaya-100 mt-1">
              {quote.statusDisplay || quote.status} - Créé le {formatDate(quote.createdAt)}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/devis/${id}/edit`}
              className="px-4 py-2 bg-white text-benaya-900 rounded-md hover:bg-white/90 font-medium"
            >
              Modifier
            </Link>
            
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 backdrop-blur-sm"
              disabled={isActionLoading}
            >
              Exporter PDF
            </button>
            
            <button
              onClick={handleDuplicateQuote}
              className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 backdrop-blur-sm"
              disabled={isActionLoading}
            >
              Dupliquer
            </button>
            
            <button
              onClick={handleDeleteQuote}
              className="px-4 py-2 bg-red-500/80 text-white rounded-md hover:bg-red-600 backdrop-blur-sm"
              disabled={isActionLoading}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
      
      {/* Message d'erreur pour les actions */}
      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionError}
        </div>
      )}
      
      {/* Informations générales */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Client:</span> {quote.clientName}</p>
              <p><span className="font-medium">Date:</span> {formatDate(quote.issueDate)}</p>
              <p><span className="font-medium">Validité:</span> {quote.expiryDate ? formatDate(quote.expiryDate) : 'Non définie'}</p>
              <p><span className="font-medium">Statut:</span> {quote.statusDisplay || quote.status}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Montants</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Total HT:</span> {formatCurrency(quote.totalHt)}</p>
              <p><span className="font-medium">TVA:</span> {formatCurrency(quote.totalVat)}</p>
              <p><span className="font-medium">Total TTC:</span> {formatCurrency(quote.totalTtc)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Éléments du devis */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Éléments du devis</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quoteItems.length > 0 ? (
                quoteItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm font-medium text-gray-900">{item.designation || item.description}</div>
                      {item.description && item.description !== item.designation && <div className="text-sm text-gray-500">{item.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.vatRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(item.totalHt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun élément dans ce devis
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">Total HT</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(quote.totalHt)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">TVA</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(quote.totalVat)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-900">Total TTC</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(quote.totalTtc)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Notes et conditions */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Notes et conditions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-line">{quote.notes || 'Aucune note'}</p>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Conditions</h3>
            <p className="text-gray-700 whitespace-pre-line">{quote.terms || 'Aucune condition spécifique'}</p>
          </div>
        </div>
      </div>
      
      {/* Actions selon le statut */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-2">
          {quote.status === 'draft' && (
            <>
              <button
                onClick={() => validateModal.actions.open()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isActionLoading}
              >
                Valider
              </button>
              <button
                onClick={() => sendModal.actions.open()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isActionLoading}
              >
                Envoyer
              </button>
            </>
          )}
          
          {quote.status === 'sent' && (
            <>
              <button
                onClick={handleAcceptQuote}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isActionLoading}
              >
                Accepter
              </button>
              
              <button
                onClick={handleRejectQuote}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isActionLoading}
              >
                Rejeter
              </button>
            </>
          )}
          
          {['draft', 'sent'].includes(quote.status) && (
            <button
              onClick={handleCancelQuote}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={isActionLoading}
            >
              Annuler
            </button>
          )}
          
          {quote.status === 'accepted' && (
            <button
              onClick={() => convertModal.actions.open()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              disabled={isActionLoading}
            >
              Créer une facture
            </button>
          )}
        </div>
      </div>

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
        </>
      )}
    </div>
  );
};

export default QuoteDetail;
