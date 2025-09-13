/**
 * Étape de sélection du devis pour la création de facture
 */
import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, Euro, User, Building } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { quotesApi } from '../../../../api/quotes';
import { Quote } from '../../../../types/quotes.types';
import { UseInvoiceWizard } from '../../../../hooks/useInvoiceWizard';
import { useCurrency } from '@/contexts/CurrencyContext';

interface QuoteSelectionStepProps {
  wizard: UseInvoiceWizard;
}

export const QuoteSelectionStep: React.FC<QuoteSelectionStepProps> = ({ wizard }) => {
  const { formatCurrency } = useCurrency();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingQuoteDetails, setLoadingQuoteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Charger les devis du client sélectionné
  useEffect(() => {
    if (wizard.client?.id) {
      loadClientQuotes();
    }
  }, [wizard.client?.id]);

  const loadClientQuotes = async () => {
    if (!wizard.client?.id) {
      console.log('❌ Pas de client sélectionné');
      return;
    }

    console.log('🔍 Chargement des devis acceptés pour le client:', wizard.client.name);
    setLoading(true);
    setError(null);

    try {
      // Charger tous les devis avec filtre par statut accepté
      const response = await quotesApi.getQuotes(1, 50, {
        status: 'accepted', // Seulement les devis acceptés
        search: searchQuery || undefined
      });
      
      console.log('📄 Nombre total de devis acceptés reçus:', response.results.length);
      
      // Filtrer pour le client sélectionné parmi les devis acceptés
      const clientQuotes = response.results.filter(quote => 
        quote.clientName === wizard.client.name
      );
      
      console.log('📊 Devis filtrés pour le client:', clientQuotes.length);
      setQuotes(clientQuotes);
      
      if (clientQuotes.length === 0) {
        setError(`Aucun devis accepté trouvé pour le client "${wizard.client.name}". Seuls les devis acceptés peuvent être facturés.`);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des devis:', err);
      setError(`Erreur: ${err.message || 'Impossible de charger les devis'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSelect = async (quote: Quote) => {
    console.log('🔍 Sélection du devis:', quote.number);
    setLoadingQuoteDetails(true);
    setError(null);
    
    try {
      // Charger les détails complets du devis avec ses articles
      const quoteDetails = await quotesApi.getQuoteDetails(quote.id);
      console.log('📄 Détails du devis chargés:', quoteDetails);
      console.log('📦 Articles trouvés:', quoteDetails.items?.length || 0);
      
      // Charger aussi les articles séparément si pas inclus dans les détails
      let quoteItems = quoteDetails.items || [];
      if (!quoteItems || quoteItems.length === 0) {
        console.log('🔄 Chargement des articles séparément...');
        quoteItems = await quotesApi.getQuoteItems(quote.id);
        console.log('📋 Articles chargés séparément:', quoteItems.length);
      }
      
      // Créer l'objet devis complet avec les articles
      const completeQuote = {
        ...quoteDetails,
        items: quoteItems
      };
      
      wizard.setSelectedQuote(completeQuote);
      
      // Automatiquement calculer la date d'échéance
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + wizard.invoiceDetails.paymentTerms);
      
      wizard.setInvoiceDetails({
        dueDate: dueDate.toISOString().split('T')[0]
      });
      
      console.log('✅ Devis sélectionné avec succès avec', quoteItems.length, 'articles');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du devis:', error);
      setError('Erreur lors du chargement des détails du devis');
    } finally {
      setLoadingQuoteDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
      'sent': { label: 'Envoyé', className: 'bg-blue-100 text-blue-700' },
      'accepted': { label: 'Accepté', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Refusé', className: 'bg-red-100 text-red-700' },
      'expired': { label: 'Expiré', className: 'bg-orange-100 text-orange-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Sélection du devis
        </h2>
        <p className="text-gray-600">
          Choisissez le devis à facturer pour <strong>{wizard.client?.name}</strong>
        </p>
        {wizard.client && (
          <div className="text-sm text-gray-600 mt-2">
            Client sélectionné: <strong>{wizard.client.name}</strong> • 
            Devis acceptés disponibles: <strong>{quotes.length}</strong>
          </div>
        )}
      </div>

      {/* Recherche */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un devis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadClientQuotes()}
            className="pl-10"
          />
        </div>
        <Button onClick={loadClientQuotes} disabled={loading} size="sm">
          {loading ? 'Recherche...' : 'Rechercher'}
        </Button>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chargement des détails du devis */}
      {loadingQuoteDetails && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Chargement des détails du devis et de ses articles...
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des devis */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des devis...</p>
          </div>
        ) : quotes.length === 0 ? (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Aucun devis accepté trouvé pour ce client. 
              Seuls les devis acceptés peuvent être facturés.
            </AlertDescription>
          </Alert>
        ) : (
          quotes.map((quote) => (
            <Card 
              key={quote.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                wizard.selectedQuote?.id === quote.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              } ${loadingQuoteDetails ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !loadingQuoteDetails && handleQuoteSelect(quote)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {quote.number}
                    </span>
                    {getStatusBadge(quote.status)}
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(quote.totalTtc || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{quote.projectName || 'Projet non spécifié'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(quote.issueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {quote.notes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {quote.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Détails de facture si un devis est sélectionné */}
      {wizard.selectedQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Date d'émission</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={wizard.invoiceDetails.issueDate}
                  onChange={(e) => wizard.setInvoiceDetails({ issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={wizard.invoiceDetails.dueDate}
                  onChange={(e) => wizard.setInvoiceDetails({ dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentTerms">Délai de paiement (jours)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={wizard.invoiceDetails.paymentTerms}
                onChange={(e) => wizard.setInvoiceDetails({ paymentTerms: parseInt(e.target.value) || 30 })}
                min="1"
                max="365"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes additionnelles pour la facture..."
                value={wizard.invoiceDetails.notes}
                onChange={(e) => wizard.setInvoiceDetails({ notes: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="termsAndConditions">Conditions générales</Label>
              <Textarea
                id="termsAndConditions"
                placeholder="Conditions générales de vente..."
                value={wizard.invoiceDetails.termsAndConditions}
                onChange={(e) => wizard.setInvoiceDetails({ termsAndConditions: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};