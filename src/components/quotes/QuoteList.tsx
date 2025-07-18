/**
 * Composant d'affichage de la liste des devis
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { PaginatedQuotesResponse, Quote } from '../../lib/api/types/quotes.types';
import { formatCurrency, formatDate } from '../../lib/utils/formatters';

/**
 * Props du composant QuoteList
 */
interface QuoteListProps {
  quotes: PaginatedQuotesResponse | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRefresh: () => void;
  page: number;
  pageSize: number;
}

/**
 * Composant d'affichage de la liste des devis
 */
const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  isLoading,
  error,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  page,
  pageSize
}) => {
  // Obtenir le nombre total de pages
  const totalPages = quotes ? Math.ceil(quotes.count / pageSize) : 0;
  
  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Si le nombre de pages est inférieur ou égal au nombre maximum de pages à afficher
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      // Calculer les pages du milieu
      let startPage = Math.max(2, page - Math.floor(maxPagesToShow / 2) + 1);
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
      
      // Ajuster si on est proche du début
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      
      // Ajuster si on est proche de la fin
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Ajouter des points de suspension si nécessaire
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Ajouter des points de suspension si nécessaire
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Toujours afficher la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded mb-3"></div>
          ))}
          <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }
  
  // Si erreur
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-500 text-center">
          <p>Erreur lors du chargement des devis</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  // Si pas de devis
  if (!quotes || quotes.results.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          <p>Aucun devis trouvé</p>
          <p className="text-sm">Essayez de modifier les filtres ou créez un nouveau devis</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Liste des devis */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant HT
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant TTC
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.results.map((quote: Quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(quote.issueDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(quote.status)}`}>
                    {quote.statusDisplay || quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(quote.totalHt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(quote.totalTtc)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/devis/${quote.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
                    </Link>
                    <Link
                      to={`/devis/${quote.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Précédent
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">
                {(page - 1) * pageSize + 1}
              </span>{' '}
              à{' '}
              <span className="font-medium">
                {Math.min(page * pageSize, quotes.count)}
              </span>{' '}
              sur <span className="font-medium">{quotes.count}</span> résultats
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Afficher</span>
              <select
                className="border border-gray-300 rounded-md text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-700">par page</span>
            </div>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Précédent</span>
                &lt;
              </button>
              
              {getPageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNumber === 'number' ? onPageChange(pageNumber) : null}
                  disabled={pageNumber === '...'}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                    pageNumber === page
                      ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                      : pageNumber === '...'
                      ? 'bg-white text-gray-700'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Suivant</span>
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteList;
