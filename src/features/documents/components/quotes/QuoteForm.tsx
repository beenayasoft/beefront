/**
 * Formulaire de création/édition de devis
 */
import React, { useState, useEffect } from 'react';
import { Quote, QuoteItem, CreateQuoteData, CreateQuoteItemData } from '../../types/quotes.types';
import { ClientOption, OpportunityOption } from '@/features/crm/types/crm.types';
import { crmApi } from '@/features/crm/api';
import { quotesApi } from '@/features/documents/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import SectionManager from './SectionManager';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: CreateQuoteData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  vatRates?: { code: string; name: string; rate: number; rate_display?: string; description?: string; is_default?: boolean; is_active?: boolean; isDefault?: boolean }[];
}

/**
 * Formulaire de création/édition de devis
 */
export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  onSubmit,
  isLoading = false,
  error = null,
  vatRates = []
}) => {
  const { formatCurrency } = useCurrency();
  
  // États pour les données CRM
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityOption | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [nextQuoteNumber, setNextQuoteNumber] = useState<string>('');
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);
  
  // État initial du formulaire
  const initialFormData: CreateQuoteData = {
    tierId: quote?.tierId || '',
    opportunityId: quote?.opportunityId || '',
    clientName: quote?.clientName || '',
    clientAddress: quote?.clientAddress || '',
    projectName: quote?.projectName || '',
    projectAddress: quote?.projectAddress || '',
    projectReference: quote?.projectReference || '',
    issueDate: quote?.issueDate || new Date().toISOString().split('T')[0],
    validityPeriod: quote?.validityPeriod || 30,
    notes: quote?.notes || '',
    termsAndConditions: quote?.termsAndConditions || 'Conditions générales de vente applicables.',
    items: []
  };

  // État du formulaire
  const [formData, setFormData] = useState<CreateQuoteData>(initialFormData);
  
  // Charger les clients au montage du composant
  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const clientsData = await crmApi.tiers.getClients(clientSearch);
        setClients(clientsData);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    loadClients();
  }, [clientSearch]);
  
  // Charger le prochain numéro de devis (seulement pour les nouveaux devis)
  useEffect(() => {
    const loadNextNumber = async () => {
      if (quote) return; // Ne pas charger pour l'édition
      
      setIsLoadingNumber(true);
      try {
        const number = await quotesApi.getNextQuoteNumber();
        setNextQuoteNumber(number);
      } catch (error) {
        console.error('Erreur lors du chargement du numéro de devis:', error);
      } finally {
        setIsLoadingNumber(false);
      }
    };
    
    loadNextNumber();
  }, [quote]);
  
  // Charger les opportunités quand un client est sélectionné
  useEffect(() => {
    const loadOpportunities = async () => {
      if (!selectedClient) {
        setOpportunities([]);
        return;
      }
      
      setIsLoadingOpportunities(true);
      try {
        const opportunitiesData = await crmApi.opportunities.getOpportunitiesByClient(
          selectedClient.id,
          ['new', 'needs_analysis', 'negotiation'] // Seulement les opportunités ouvertes
        );
        setOpportunities(opportunitiesData);
      } catch (error) {
        console.error('Erreur lors du chargement des opportunités:', error);
        setOpportunities([]);
      } finally {
        setIsLoadingOpportunities(false);
      }
    };
    
    loadOpportunities();
  }, [selectedClient]);
  
  // État pour les éléments du devis
  const [items, setItems] = useState<(CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number })[]>(
    quote?.items?.map(item => ({
      id: item.id,
      type: item.type || 'product',
      position: item.position || 0,
      designation: item.designation || '',
      description: item.description,
      details: item.details || '',
      unit: item.unit || 'u',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      vatRate: item.vatRate,
      totalHt: item.totalHt,
      totalTtc: item.totalTtc
    })) || []
  );


  // Mettre à jour le formulaire quand le devis change
  useEffect(() => {
    if (quote) {
      setFormData({
        tierId: quote.tierId || '',
        clientName: quote.clientName || '',
        clientEmail: quote.clientEmail || '',
        clientPhone: quote.clientPhone || '',
        clientAddress: quote.clientAddress || '',
        projectName: quote.projectName || '',
        reference: quote.reference || '',
        issueDate: quote.issueDate || new Date().toISOString().split('T')[0],
        validityPeriod: quote.validityPeriod || 30,
        notes: quote.notes || '',
        terms: quote.terms || 'Conditions générales de vente applicables.',
        items: []
      });

      if (quote.items) {
        setItems(
          quote.items.map(item => ({
            id: item.id,
            description: item.description,
            details: item.details || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            totalHt: item.totalHt,
            totalTtc: item.totalTtc
          }))
        );
      }
    }
  }, [quote]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que les champs obligatoires sont remplis
    if (!formData.clientName) {
      alert('Veuillez remplir le nom du client');
      return;
    }

    // Vérifier qu'il y a au moins un élément
    if (items.length === 0) {
      alert('Veuillez ajouter au moins un élément au devis');
      return;
    }

    // Préparer les données à soumettre
    const submitData: CreateQuoteData = {
      ...formData,
      items: items.map(item => ({
        type: item.type,
        position: item.position,
        designation: item.designation,
        description: item.description,
        details: item.details,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountType: item.discountType,
        vatRate: item.vatRate,
        freeText: item.freeText,
        separatorTitle: item.separatorTitle,
        isVisible: item.isVisible,
        isPrintable: item.isPrintable
      }))
    };

    // Soumettre le formulaire
    await onSubmit(submitData);
  };

  // Sélectionner un client existant
  const handleSelectClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);

    if (client) {
      setSelectedClient(client);
      setFormData({
        ...formData,
        tierId: clientId,
        clientName: client.name,
        clientAddress: client.adressePrincipale ? 
          `${client.adressePrincipale.rue}, ${client.adressePrincipale.codePostal} ${client.adressePrincipale.ville}` 
          : ''
      });
      // Réinitialiser l'opportunité sélectionnée
      setSelectedOpportunity(null);
      setFormData(prev => ({ ...prev, opportunityId: '' }));
    } else {
      setSelectedClient(null);
      setSelectedOpportunity(null);
      setFormData({
        ...formData,
        tierId: '',
        clientName: '',
        clientAddress: '',
        opportunityId: ''
      });
    }
  };
  
  // Sélectionner une opportunité
  const handleSelectOpportunity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opportunityId = e.target.value;
    const opportunity = opportunities.find(o => o.id === opportunityId);
    
    if (opportunity) {
      setSelectedOpportunity(opportunity);
      setFormData({
        ...formData,
        opportunityId: opportunityId,
        projectName: opportunity.name
      });
    } else {
      setSelectedOpportunity(null);
      setFormData({
        ...formData,
        opportunityId: '',
        projectName: ''
      });
    }
  };
  
  // Recherche de clients
  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSearch(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Afficher les erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Informations générales */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
          {!quote && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Numéro de devis :</span>
              {isLoadingNumber ? (
                <span className="text-sm text-gray-400">Génération...</span>
              ) : (
                <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {nextQuoteNumber || 'N/A'}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection du client */}
          <div className="md:col-span-2">
            <label htmlFor="tierId" className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={clientSearch}
                onChange={handleClientSearch}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <select
                id="tierId"
                name="tierId"
                value={formData.tierId}
                onChange={handleSelectClient}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || isLoadingClients}
                required
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.type === 'entreprise' ? 'Entreprise' : 'Particulier'})
                  </option>
                ))}
              </select>
            </div>
            {isLoadingClients && (
              <p className="text-sm text-gray-500 mt-1">Chargement des clients...</p>
            )}
          </div>

          {/* Sélection de l'opportunité */}
          <div className="md:col-span-2">
            <label htmlFor="opportunityId" className="block text-sm font-medium text-gray-700 mb-1">
              Opportunité (optionnel)
            </label>
            <select
              id="opportunityId"
              name="opportunityId"
              value={formData.opportunityId || ''}
              onChange={handleSelectOpportunity}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || isLoadingOpportunities || !selectedClient}
            >
              <option value="">-- Aucune opportunité --</option>
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.name} - {formatCurrency(opp.estimatedAmount)} ({opp.probability}%)
                </option>
              ))}
            </select>
            {!selectedClient && (
              <p className="text-sm text-gray-500 mt-1">Sélectionnez d'abord un client</p>
            )}
            {selectedClient && isLoadingOpportunities && (
              <p className="text-sm text-gray-500 mt-1">Chargement des opportunités...</p>
            )}
          </div>

          {/* Nom du client (lecture seule) */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du client
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={true}
              readOnly
            />
          </div>

          {/* Nom du projet */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={formData.projectName || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              placeholder={selectedOpportunity ? "Auto-rempli depuis l'opportunité" : "Saisir le nom du projet"}
            />
          </div>

          {/* Date d'émission */}
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'émission *
            </label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Période de validité */}
          <div>
            <label htmlFor="validityPeriod" className="block text-sm font-medium text-gray-700 mb-1">
              Période de validité (jours)
            </label>
            <input
              type="number"
              id="validityPeriod"
              name="validityPeriod"
              value={formData.validityPeriod?.toString() || '30'}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Adresse du client (lecture seule) */}
          <div className="md:col-span-2">
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse du client
            </label>
            <textarea
              id="clientAddress"
              name="clientAddress"
              value={formData.clientAddress || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={true}
              readOnly
              placeholder="Adresse auto-remplie depuis le client sélectionné"
            />
          </div>

          {/* Adresse du projet */}
          <div className="md:col-span-2">
            <label htmlFor="projectAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse du projet (optionnel)
            </label>
            <textarea
              id="projectAddress"
              name="projectAddress"
              value={formData.projectAddress || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              placeholder="Adresse du chantier/projet si différente du client"
            />
          </div>
        </div>
      </div>

      {/* Éléments du devis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Éléments du devis</h2>
        
        <SectionManager
          items={items}
          vatRates={vatRates}
          onItemsChange={setItems}
          isLoading={isLoading}
        />
      </div>

      {/* Notes et conditions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notes et conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">
              Conditions
            </label>
            <textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : quote ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default QuoteForm;
