/**
 * Page principale des devis
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../lib/api/quotes';
import { QuoteFilters as FilterType, QuotesResponse } from '../lib/api/types/quotes.types';
import QuoteStats from '../components/quotes/QuoteStats';
import QuoteFilters from '../components/quotes/QuoteFilters';
import QuoteList from '../components/quotes/QuoteList';
import { handleApiError } from '../lib/api/client';

/**
 * Page principale des devis
 */
const Devis: React.FC = () => {
  // États pour les données
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination et les filtres
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterType>({});
  
  // Référence pour l'AbortController
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // Fonction pour charger les devis
  const loadQuotes = useCallback(async () => {
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
      // Charger les devis avec pagination et filtres
      const data = await quotesApi.getQuotes(
        page,
        pageSize,
        filters,
        abortController.signal
      );
      setQuotes(data);
    } catch (err) {
      // Ne pas afficher d'erreur si la requête a été annulée
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Requête annulée');
        return;
      }
      
      // Gérer l'erreur
      const errorMessage = handleApiError(err, 'Erreur lors du chargement des devis');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);
  
  // Charger les devis au chargement de la page et lorsque les filtres changent
  useEffect(() => {
    loadQuotes();
    
    // Nettoyer l'AbortController au démontage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadQuotes]);
  
  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Gérer le changement de taille de page
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Réinitialiser la page à 1 lors du changement de taille
  };
  
  // Gérer le changement de filtres
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1); // Réinitialiser la page à 1 lors du changement de filtres
  };
  
  // Gérer le rafraîchissement des données
  const handleRefresh = () => {
    loadQuotes();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <Link
          to="/devis/nouveau"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nouveau devis
        </Link>
      </div>
      
      {/* Statistiques des devis */}
      <div className="mb-6">
        <QuoteStats />
      </div>
      
      {/* Filtres */}
      <div className="mb-6">
        <QuoteFilters
          onFilterChange={handleFilterChange}
          filters={filters}
        />
      </div>
      
      {/* Liste des devis */}
      <QuoteList
        quotes={quotes}
        isLoading={isLoading}
        error={error}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={handleRefresh}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
};

export default Devis;
