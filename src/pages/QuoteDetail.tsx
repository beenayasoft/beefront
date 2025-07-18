/**
 * Page de détail d'un devis
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesApi } from '../lib/api/quotes';
import { Quote, QuoteItem } from '../lib/api/types/quotes.types';
import { handleApiError } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils/formatters';

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
  
  // Référence pour l'AbortController
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // Charger les données du devis
  useEffect(() => {
    const loadQuoteData = async () => {
      if (!id) return;
      
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
        // Charger les détails du devis
        const quoteData = await quotesApi.getQuoteDetails(id, abortController.signal);
        setQuote(quoteData);
        
        // Charger les éléments du devis
        const items = await quotesApi.getQuoteItems(id, abortController.signal);
        setQuoteItems(items);
      } catch (err) {
        // Ne pas afficher d'erreur si la requête a été annulée
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Requête annulée');
          return;
        }
        
        // Gérer l'erreur
        const errorMessage = handleApiError(err, 'Erreur lors du chargement du devis');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuoteData();
    
    // Nettoyer l'AbortController au démontage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);
  
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
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Devis {quote.number}
          </h1>
          <p className="text-gray-600">
            {quote.status_name} - Créé le {formatDate(quote.created_at)}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/devis/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Modifier
          </Link>
          
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            disabled={isActionLoading}
          >
            Exporter PDF
          </button>
          
          <button
            onClick={handleDuplicateQuote}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isActionLoading}
          >
            Dupliquer
          </button>
          
          <button
            onClick={handleDeleteQuote}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isActionLoading}
          >
            Supprimer
          </button>
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
              <p><span className="font-medium">Client:</span> {quote.tier_name}</p>
              <p><span className="font-medium">Date:</span> {formatDate(quote.date)}</p>
              <p><span className="font-medium">Validité:</span> {formatDate(quote.validity_date)}</p>
              <p><span className="font-medium">Statut:</span> {quote.status_name}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Montants</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Total HT:</span> {formatCurrency(quote.total_excl_tax)}</p>
              <p><span className="font-medium">TVA:</span> {formatCurrency(quote.tax_amount)}</p>
              <p><span className="font-medium">Total TTC:</span> {formatCurrency(quote.total_incl_tax)}</p>
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
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                      {item.notes && <div className="text-sm text-gray-500">{item.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.vat_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(item.total_excl_tax)}
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
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(quote.total_excl_tax)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">TVA</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(quote.tax_amount)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-900">Total TTC</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(quote.total_incl_tax)}</td>
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
            <button
              onClick={() => alert('Fonctionnalité à implémenter: Envoyer le devis')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isActionLoading}
            >
              Envoyer
            </button>
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
              onClick={() => alert('Fonctionnalité à implémenter: Créer une facture')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              disabled={isActionLoading}
            >
              Créer une facture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
