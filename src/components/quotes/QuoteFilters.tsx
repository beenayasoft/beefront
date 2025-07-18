/**
 * Composant de filtres pour la liste des devis
 */
import React, { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes';
import { QuoteFilters as FilterType, QuoteStatus } from '../../lib/api/types/quotes.types';
import { handleApiError } from '../../lib/api/client';

/**
 * Props du composant QuoteFilters
 */
interface QuoteFiltersProps {
  onFilterChange: (filters: FilterType) => void;
  filters: FilterType;
}

/**
 * Composant de filtres pour la liste des devis
 */
const QuoteFilters: React.FC<QuoteFiltersProps> = ({ onFilterChange, filters }) => {
  // États pour les données des filtres
  const [statuses, setStatuses] = useState<QuoteStatus[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États locaux pour les filtres
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  
  // Charger les données des filtres
  useEffect(() => {
    const loadFilterData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Charger les statuts de devis
        const statusData = await quotesApi.getQuoteStatuses();
        setStatuses(statusData);
        
        // Charger les clients (à implémenter avec l'API clients)
        // Cette partie dépend de l'API disponible pour les clients
        // Pour l'instant, nous utilisons des données simulées
        setClients([
          { id: '1', name: 'Client A' },
          { id: '2', name: 'Client B' },
          { id: '3', name: 'Client C' },
          { id: '4', name: 'Client D' },
          { id: '5', name: 'Client E' }
        ]);
      } catch (error) {
        const errorMessage = handleApiError(error, 'Erreur lors du chargement des données de filtres');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFilterData();
  }, []);
  
  // Mettre à jour les filtres locaux lorsque les filtres externes changent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Gérer les changements de filtres
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    
    // Supprimer les filtres vides
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    
    setLocalFilters(newFilters);
  };
  
  // Appliquer les filtres
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filtres</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            Appliquer
          </button>
          
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            Réinitialiser
          </button>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtre par statut */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Tous les statuts</option>
            {statuses.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtre par client */}
        <div>
          <label htmlFor="tier_id" className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select
            id="tier_id"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.tier_id || ''}
            onChange={(e) => handleFilterChange('tier_id', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Tous les clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtre par recherche */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            type="text"
            id="search"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Numéro, référence, etc."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Filtre par date de début */}
        <div>
          <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="date_from"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Filtre par date de fin */}
        <div>
          <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="date_to"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.date_to || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Filtre par tri */}
        <div>
          <label htmlFor="ordering" className="block text-sm font-medium text-gray-700 mb-1">
            Tri
          </label>
          <select
            id="ordering"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.ordering || ''}
            onChange={(e) => handleFilterChange('ordering', e.target.value)}
            disabled={isLoading}
          >
            <option value="-date">Date (récent → ancien)</option>
            <option value="date">Date (ancien → récent)</option>
            <option value="-total_incl_tax">Montant (élevé → bas)</option>
            <option value="total_incl_tax">Montant (bas → élevé)</option>
            <option value="number">Numéro (croissant)</option>
            <option value="-number">Numéro (décroissant)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuoteFilters;
