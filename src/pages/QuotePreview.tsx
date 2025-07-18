/**
 * Page d'aperçu d'un devis avant impression ou envoi
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotesApi } from '../lib/api/quotes';
import { Quote } from '../lib/api/types/quotes.types';
import { formatCurrency, formatDate } from '../lib/utils/formatters';
import { handleApiError } from '../lib/api/client';

/**
 * Page d'aperçu d'un devis
 */
const QuotePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États pour les données
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour l'AbortController
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // Charger les détails du devis
  useEffect(() => {
    // Créer un nouvel AbortController pour cette requête
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    const loadQuote = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer les détails du devis
        const quoteData = await quotesApi.getQuoteDetails(id, signal);
        setQuote(quoteData);
      } catch (error) {
        // Ne pas définir d'erreur si la requête a été annulée
        if (signal.aborted) return;
        
        console.error('Erreur lors du chargement du devis:', error);
        setError(handleApiError(error, 'Erreur lors du chargement du devis'));
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    loadQuote();
    
    // Nettoyer l'AbortController lors du démontage du composant
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);
  
  // Gérer l'impression du devis
  const handlePrint = () => {
    window.print();
  };
  
  // Gérer le téléchargement du PDF
  const handleDownloadPdf = async () => {
    if (!id) return;
    
    try {
      const pdfBlob = await quotesApi.exportQuoteToPdf(id);
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${quote?.number || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      setError(handleApiError(error, 'Erreur lors du téléchargement du PDF'));
    }
  };
  
  // Gérer le retour à la page de détail
  const handleBack = () => {
    navigate(`/devis/${id}`);
  };
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-red-500 text-center">
            <p>Erreur lors du chargement du devis</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour
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
          <div className="text-center text-gray-500">
            <p>Devis non trouvé</p>
            <button
              onClick={handleBack}
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
    <div className="container mx-auto px-4 py-6">
      {/* Barre d'outils d'impression (masquée lors de l'impression) */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Retour
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Télécharger PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Imprimer
          </button>
        </div>
      </div>
      
      {/* Document imprimable */}
      <div className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0 print:m-0">
        {/* En-tête du document */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DEVIS</h1>
            <p className="text-gray-600">N° {quote.number}</p>
            <p className="text-gray-600">Date: {formatDate(quote.issueDate)}</p>
            {quote.expiryDate && (
              <p className="text-gray-600">Validité: {formatDate(quote.expiryDate)}</p>
            )}
          </div>
          
          <div className="text-right">
            <p className="font-bold">Votre entreprise</p>
            <p>123 Rue de l'Exemple</p>
            <p>75000 Paris</p>
            <p>contact@votre-entreprise.com</p>
            <p>01 23 45 67 89</p>
          </div>
        </div>
        
        {/* Informations client */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border p-4 rounded">
            <h2 className="font-bold mb-2">Client</h2>
            <p>{quote.clientName}</p>
            {quote.clientAddress && <p>{quote.clientAddress}</p>}
            {quote.clientInfo?.email && <p>{quote.clientInfo.email}</p>}
            {quote.clientInfo?.phone && <p>{quote.clientInfo.phone}</p>}
          </div>
          
          {(quote.projectName || quote.projectAddress || quote.projectReference) && (
            <div className="border p-4 rounded">
              <h2 className="font-bold mb-2">Projet</h2>
              {quote.projectName && <p>{quote.projectName}</p>}
              {quote.projectAddress && <p>{quote.projectAddress}</p>}
              {quote.projectReference && <p>Réf: {quote.projectReference}</p>}
            </div>
          )}
        </div>
        
        {/* Tableau des éléments */}
        <table className="w-full mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">PU HT</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Remise</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quote.items?.map((item) => (
              <tr key={item.id} className={item.type === 'chapter' ? 'font-bold bg-gray-50' : ''}>
                <td className="px-4 py-2 whitespace-normal">
                  <div className="font-medium">{item.designation}</div>
                  {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                </td>
                <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-2 text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                <td className="px-4 py-2 text-right">{item.vatRate}%</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.totalHt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Total HT</span>
              <span className="font-medium">{formatCurrency(quote.totalHt)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>TVA</span>
              <span className="font-medium">{formatCurrency(quote.totalVat)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
              <span>Total TTC</span>
              <span>{formatCurrency(quote.totalTtc)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes et conditions */}
        {quote.notes && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
          </div>
        )}
        
        {quote.termsAndConditions && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Conditions générales</h3>
            <p className="text-gray-700 whitespace-pre-line">{quote.termsAndConditions}</p>
          </div>
        )}
        
        {/* Signature */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="border-t pt-4">
            <p className="font-bold">Signature client</p>
            <p className="text-sm text-gray-500">Bon pour accord</p>
          </div>
          
          <div className="border-t pt-4">
            <p className="font-bold">Signature prestataire</p>
            <p className="text-sm text-gray-500">Date: {formatDate(new Date())}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;
