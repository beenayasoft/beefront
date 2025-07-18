/**
 * Page de création d'un nouveau devis
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuoteForm from '../components/quotes/QuoteForm';
import { quotesApi } from '../lib/api/quotes';
import { CreateQuoteData, VATRate } from '../lib/api/types/quotes.types';
import { handleApiError } from '../lib/api/client';

/**
 * Page de création d'un nouveau devis
 */
const DevisNew: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [vatRates, setVatRates] = useState<{ code: string; name: string; rate: number; isDefault: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les données nécessaires au formulaire
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Charger les taux de TVA
        const rates = await quotesApi.getVATRates();
        
        // Transformer les taux de TVA au format attendu par le composant
        const formattedRates = rates.map(rate => ({
          code: rate.toString(),
          name: `${rate}%`,
          rate: parseFloat(rate),
          isDefault: rate === VATRate.STANDARD
        }));
        
        setVatRates(formattedRates);
        
        // Charger les clients (à implémenter avec l'API clients)
        // Cette partie dépend de l'API disponible pour les clients
        // Pour l'instant, on utilise un tableau vide
        // setClients(await clientsApi.getClients());
      } catch (error) {
        console.error('Erreur lors du chargement des données du formulaire:', error);
        setError(handleApiError(error, 'Erreur lors du chargement des données'));
      }
    };
    
    loadFormData();
  }, []);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (data: CreateQuoteData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Créer le devis
      const newQuote = await quotesApi.createQuote(data);
      
      // Rediriger vers la page du devis créé
      navigate(`/devis/${newQuote.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      setError(handleApiError(error, 'Erreur lors de la création du devis'));
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>
      
      <QuoteForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        clients={clients}
        vatRates={vatRates}
      />
    </div>
  );
};

export default DevisNew;
