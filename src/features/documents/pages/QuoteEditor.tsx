/**
 * Page d'édition d'un devis existant
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuoteForm from '../components/quotes/QuoteForm';
import { quotesApi } from '../api/quotes';
import { Quote, CreateQuoteData } from '../types/quotes.types';
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
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [vatRates, setVatRates] = useState<{ code: string; name: string; rate: number; isDefault: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        
        // Charger les taux de TVA
        const rates = await quotesApi.getVATRates();
        setVatRates(rates);
        
        // Charger les clients (à implémenter avec l'API clients)
        // Cette partie dépend de l'API disponible pour les clients
        // Pour l'instant, on utilise un tableau vide
        // setClients(await clientsApi.getClients());
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
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (data: CreateQuoteData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Mettre à jour le devis
      const updatedQuote = await quotesApi.updateQuote(id, data);
      
      // Rediriger vers la page du devis mis à jour
      navigate(`/devis/${updatedQuote.id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      setError(handleApiError(error, 'Erreur lors de la mise à jour du devis'));
      setIsSubmitting(false);
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
  if (error && !quote) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-red-500 text-center">
            <p>Erreur lors du chargement du devis</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Modifier le devis {quote?.number}</h1>
            <p className="text-Beenaya-100 mt-1">
              Éditez les détails et éléments de votre devis
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/devis/${id}`)}
              className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 backdrop-blur-sm"
            >
              Prévisualiser
            </button>
            
            <button
              onClick={() => navigate('/devis')}
              className="px-4 py-2 bg-white text-Beenaya-900 rounded-md hover:bg-white/90 font-medium"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
      
      {quote && (
        <QuoteForm
          quote={quote}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          error={error}
          clients={clients}
          vatRates={vatRates}
        />
      )}
    </div>
  );
};

export default QuoteEditor;
