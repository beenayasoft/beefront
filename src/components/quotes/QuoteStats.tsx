/**
 * Composant d'affichage des statistiques des devis
 */
import React, { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes';
import { handleApiError } from '../../lib/api/client';
import { formatCurrency, formatPercent } from '../../lib/utils/formatters';

/**
 * Interface pour les statistiques des devis
 */
interface QuoteStatistics {
  total_count: number;
  draft_count: number;
  sent_count: number;
  accepted_count: number;
  rejected_count: number;
  cancelled_count: number;
  total_value: number;
  acceptance_rate: number;
  average_value: number;
  monthly_evolution: {
    month: string;
    count: number;
    value: number;
  }[];
  top_clients: {
    tier_id: string;
    tier_name: string;
    count: number;
    value: number;
  }[];
}

/**
 * Composant d'affichage des statistiques des devis
 */
const QuoteStats: React.FC = () => {
  // États pour les données
  const [stats, setStats] = useState<QuoteStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Dans une implémentation réelle, cette API devrait exister
        // Pour l'instant, nous simulons les données
        // const data = await quotesApi.getStatistics();
        
        // Données simulées pour le développement
        const mockStats: QuoteStatistics = {
          total_count: 120,
          draft_count: 25,
          sent_count: 45,
          accepted_count: 30,
          rejected_count: 10,
          cancelled_count: 10,
          total_value: 150000,
          acceptance_rate: 0.4,
          average_value: 1250,
          monthly_evolution: [
            { month: 'Jan', count: 10, value: 12000 },
            { month: 'Fév', count: 12, value: 15000 },
            { month: 'Mar', count: 15, value: 18000 },
            { month: 'Avr', count: 18, value: 22000 },
            { month: 'Mai', count: 20, value: 25000 },
            { month: 'Juin', count: 22, value: 28000 }
          ],
          top_clients: [
            { tier_id: '1', tier_name: 'Client A', count: 15, value: 25000 },
            { tier_id: '2', tier_name: 'Client B', count: 12, value: 20000 },
            { tier_id: '3', tier_name: 'Client C', count: 10, value: 15000 }
          ]
        };
        
        setStats(mockStats);
      } catch (error) {
        const errorMessage = handleApiError(error, 'Erreur lors du chargement des statistiques');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si erreur
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-500 text-center">
          <p>Erreur lors du chargement des statistiques</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  // Si pas de statistiques
  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          Aucune statistique disponible
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Statistiques des devis</h2>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">Total des devis</p>
          <p className="text-2xl font-bold">{stats.total_count}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">Taux d'acceptation</p>
          <p className="text-2xl font-bold">{formatPercent(stats.acceptance_rate)}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-700">Valeur moyenne</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.average_value)}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">Valeur totale</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
        </div>
      </div>
      
      {/* Répartition par statut */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Répartition par statut</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Brouillons</p>
            <p className="text-lg font-semibold">{stats.draft_count}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-blue-500">Envoyés</p>
            <p className="text-lg font-semibold">{stats.sent_count}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <p className="text-xs text-green-500">Acceptés</p>
            <p className="text-lg font-semibold">{stats.accepted_count}</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded">
            <p className="text-xs text-red-500">Rejetés</p>
            <p className="text-lg font-semibold">{stats.rejected_count}</p>
          </div>
          
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-xs text-gray-500">Annulés</p>
            <p className="text-lg font-semibold">{stats.cancelled_count}</p>
          </div>
        </div>
      </div>
      
      {/* Top clients */}
      <div>
        <h3 className="text-md font-medium mb-2">Top clients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.top_clients.map((client) => (
                <tr key={client.tier_id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.tier_name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-500">
                    {client.count}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(client.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuoteStats;
