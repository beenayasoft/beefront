/**
 * Page d'édition d'un devis existant
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuoteEditWizard from '../components/quotes/modern/QuoteEditWizard';
import { quotesApi } from '../api/quotes';
import { Quote } from '../types/quotes.types';
import { handleApiError } from '@/lib/api/client';

/**
 * Page d'édition d'un devis existant
 */
const QuoteEditor: React.FC = () => {
  // Récupérer l'ID du devis depuis l'URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États pour les données
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
      } catch (error) {
        // Ne pas afficher d'erreur si la requête a été annulée
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Requête annulée');
          return;
        }
        
        // Gérer l'erreur
        const errorMessage = handleApiError(error, 'Erreur lors du chargement du devis');
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
  
  // Gérer la sauvegarde réussie
  const handleQuoteSaved = (quoteId: string) => {
    navigate(`/devis/${quoteId}`);
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    navigate(`/devis/${id}`);
  };
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header de chargement */}
        <div className="Beenaya-card Beenaya-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-white/20 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-64 animate-pulse"></div>
            </div>
            
            <div className="flex space-x-2">
              <div className="h-10 bg-white/20 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-white rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Contenu de chargement */}
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  // Si erreur de chargement
  if (error && !quote) {
    return (
      <div className="p-6 space-y-6">
        {/* Header d'erreur */}
        <div className="Beenaya-card Beenaya-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Erreur de chargement</h1>
              <p className="text-Beenaya-100 mt-1">
                Impossible de charger le devis
              </p>
            </div>
            
            <button
              onClick={() => navigate('/devis')}
              className="px-4 py-2 bg-white text-Beenaya-900 rounded-md hover:bg-white/90 font-medium"
            >
              Retour à la liste
            </button>
          </div>
        </div>
        
        {/* Message d'erreur */}
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-500 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Erreur lors du chargement du devis</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Réessayer
                </button>
                <button
                  onClick={() => navigate('/devis')}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si le devis est chargé, afficher le wizard
  if (quote) {
    return (
      <QuoteEditWizard
        quote={quote}
        onQuoteSaved={handleQuoteSaved}
        onCancel={handleCancel}
      />
    );
  }
  
  // Cas de fallback (ne devrait jamais arriver)
  return null;
};

export default QuoteEditor;