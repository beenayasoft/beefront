/**
 * Formulaire de création/édition de devis
 */
import React, { useState, useEffect } from 'react';
import { Quote, QuoteItem, CreateQuoteData, CreateQuoteItemData } from '../../lib/api/types/quotes.types';
import { formatCurrency } from '../../lib/utils/formatters';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: CreateQuoteData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  clients?: { id: string; name: string }[];
  vatRates?: { code: string; name: string; rate: number; isDefault: boolean }[];
}

/**
 * Formulaire de création/édition de devis
 */
export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  onSubmit,
  isLoading = false,
  error = null,
  clients = [],
  vatRates = []
}) => {
  // État initial du formulaire
  const initialFormData: CreateQuoteData = {
    tierId: quote?.tierId || '',
    clientName: quote?.clientName || '',
    clientEmail: quote?.clientEmail || '',
    clientPhone: quote?.clientPhone || '',
    clientAddress: quote?.clientAddress || '',
    projectName: quote?.projectName || '',
    reference: quote?.reference || '',
    issueDate: quote?.issueDate || new Date().toISOString().split('T')[0],
    validityPeriod: quote?.validityPeriod || 30,
    notes: quote?.notes || '',
    terms: quote?.terms || 'Conditions générales de vente applicables.',
    items: []
  };

  // État du formulaire
  const [formData, setFormData] = useState<CreateQuoteData>(initialFormData);
  
  // État pour les éléments du devis
  const [items, setItems] = useState<(CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number })[]>(
    quote?.items?.map(item => ({
      id: item.id,
      description: item.description,
      details: item.details || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      totalHt: item.totalHt,
      totalTtc: item.totalTtc
    })) || []
  );

  // État pour le nouvel élément en cours d'ajout
  const [newItem, setNewItem] = useState<CreateQuoteItemData>({
    description: '',
    details: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: vatRates.find(rate => rate.isDefault)?.rate || 20
  });

  // État pour les totaux
  const [totals, setTotals] = useState({
    totalHt: 0,
    totalVat: 0,
    totalTtc: 0
  });

  // Mettre à jour les totaux quand les éléments changent
  useEffect(() => {
    let totalHt = 0;
    let totalVat = 0;
    let totalTtc = 0;

    items.forEach(item => {
      const itemTotalHt = item.quantity * item.unitPrice;
      const itemVat = itemTotalHt * (item.vatRate / 100);
      const itemTotalTtc = itemTotalHt + itemVat;

      totalHt += itemTotalHt;
      totalVat += itemVat;
      totalTtc += itemTotalTtc;
    });

    setTotals({
      totalHt,
      totalVat,
      totalTtc
    });
  }, [items]);

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

  // Gérer les changements dans le nouvel élément
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'quantity' || name === 'unitPrice' || name === 'vatRate' ? parseFloat(value) : value
    });
  };

  // Ajouter un nouvel élément
  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const itemTotalHt = newItem.quantity * newItem.unitPrice;
    const itemVat = itemTotalHt * (newItem.vatRate / 100);
    const itemTotalTtc = itemTotalHt + itemVat;

    setItems([
      ...items,
      {
        ...newItem,
        totalHt: itemTotalHt,
        totalTtc: itemTotalTtc
      }
    ]);

    // Réinitialiser le nouvel élément
    setNewItem({
      description: '',
      details: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: vatRates.find(rate => rate.isDefault)?.rate || 20
    });
  };

  // Modifier un élément existant
  const handleEditItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };

    // Mettre à jour le champ
    item[field as keyof typeof item] = field === 'quantity' || field === 'unitPrice' || field === 'vatRate' 
      ? parseFloat(value as string) 
      : value;

    // Recalculer les totaux
    const itemTotalHt = item.quantity * item.unitPrice;
    const itemVat = itemTotalHt * (item.vatRate / 100);
    const itemTotalTtc = itemTotalHt + itemVat;

    item.totalHt = itemTotalHt;
    item.totalTtc = itemTotalTtc;

    updatedItems[index] = item;
    setItems(updatedItems);
  };

  // Supprimer un élément
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
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
        description: item.description,
        details: item.details,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate
      }))
    };

    // Soumettre le formulaire
    await onSubmit(submitData);
  };

  // Sélectionner un client existant
  const handleSelectClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const selectedClient = clients.find(client => client.id === clientId);

    if (selectedClient) {
      setFormData({
        ...formData,
        tierId: clientId,
        clientName: selectedClient.name
      });
    } else {
      setFormData({
        ...formData,
        tierId: '',
        clientName: ''
      });
    }
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <div>
            <label htmlFor="tierId" className="block text-sm font-medium text-gray-700 mb-1">
              Client existant
            </label>
            <select
              id="tierId"
              name="tierId"
              value={formData.tierId}
              onChange={handleSelectClient}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">-- Sélectionner un client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Projet */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Nom du client */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du client *
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Référence */}
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
              Référence
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Email du client */}
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email du client
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
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

          {/* Téléphone du client */}
          <div>
            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone du client
            </label>
            <input
              type="text"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
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
              value={formData.validityPeriod}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Adresse du client */}
          <div className="md:col-span-2">
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse du client
            </label>
            <textarea
              id="clientAddress"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Éléments du devis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Éléments du devis</h2>

        {/* Liste des éléments */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire HT
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA (%)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total HT
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total TTC
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleEditItem(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                      <input
                        type="text"
                        value={item.details || ''}
                        onChange={(e) => handleEditItem(index, 'details', e.target.value)}
                        placeholder="Détails (optionnel)"
                        className="w-full mt-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleEditItem(index, 'quantity', e.target.value)}
                        min="1"
                        step="1"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleEditItem(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.vatRate}
                        onChange={(e) => handleEditItem(index, 'vatRate', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                        disabled={isLoading}
                      >
                        {vatRates.map(rate => (
                          <option key={rate.code} value={rate.rate}>
                            {rate.rate}%
                          </option>
                        ))}
                        {vatRates.length === 0 && (
                          <>
                            <option value="0">0%</option>
                            <option value="5.5">5.5%</option>
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(item.totalHt || item.quantity * item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(item.totalTtc || (item.quantity * item.unitPrice) * (1 + item.vatRate / 100))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun élément dans ce devis. Ajoutez-en un ci-dessous.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ajouter un nouvel élément */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-2">Ajouter un élément</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={newItem.description}
                onChange={handleNewItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <input
                type="text"
                id="details"
                name="details"
                value={newItem.details}
                onChange={handleNewItemChange}
                placeholder="Détails (optionnel)"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={newItem.quantity}
                onChange={handleNewItemChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire HT *
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={newItem.unitPrice}
                onChange={handleNewItemChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="vatRate" className="block text-sm font-medium text-gray-700 mb-1">
                TVA (%) *
              </label>
              <select
                id="vatRate"
                name="vatRate"
                value={newItem.vatRate}
                onChange={handleNewItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                {vatRates.map(rate => (
                  <option key={rate.code} value={rate.rate}>
                    {rate.rate}%
                  </option>
                ))}
                {vatRates.length === 0 && (
                  <>
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Total HT:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totals.totalHt)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">TVA:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totals.totalVat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-700">Total TTC:</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(totals.totalTtc)}</span>
              </div>
            </div>
          </div>
        </div>
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
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
              Conditions
            </label>
            <textarea
              id="terms"
              name="terms"
              value={formData.terms}
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
