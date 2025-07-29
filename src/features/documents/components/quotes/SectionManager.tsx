/**
 * Gestionnaire de sections pour les devis BTP
 */
import React, { useState } from 'react';
import { CreateQuoteItemData, QuoteItemType, BTPUnits } from '@/features/documents/types';
import { formatCurrency } from '@/lib/utils';
import { getQuoteItemTypeConfig, getDefaultUnit } from '@/lib/constants/quoteItemTypes';
import QuoteItemRow from './QuoteItemRow';
import ItemTypeSelector from './ItemTypeSelector';

interface SectionManagerProps {
  items: (CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number })[];
  vatRates: { code: string; name: string; rate: number; isDefault?: boolean }[];
  onItemsChange: (items: (CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number })[]) => void;
  isLoading?: boolean;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  items,
  vatRates,
  onItemsChange,
  isLoading = false
}) => {
  const [newItemType, setNewItemType] = useState<QuoteItemType>(QuoteItemType.PRODUCT);

  // Créer un nouvel élément avec des valeurs par défaut
  const createNewItem = (type: QuoteItemType): CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number } => {
    const config = getQuoteItemTypeConfig(type);
    const defaultUnit = getDefaultUnit(type);
    
    return {
      type,
      position: items.length,
      designation: '',
      description: '',
      details: '',
      unit: defaultUnit || BTPUnits.UNIT,
      quantity: config.allowQuantity ? 1 : 0,
      unitPrice: config.allowPricing ? 0 : 0,
      discount: 0,
      discountType: 'percentage',
      vatRate: vatRates.find(rate => rate.isDefault)?.rate.toString() || '20',
      freeText: type === QuoteItemType.FREE_TEXT ? '' : undefined,
      separatorTitle: type === QuoteItemType.SEPARATOR ? '' : undefined,
      isVisible: true,
      isPrintable: true,
      totalHt: 0,
      totalTtc: 0
    };
  };

  // Ajouter un nouvel élément
  const handleAddItem = () => {
    if (!newItemType) return;
    
    const newItem = createNewItem(newItemType);
    const updatedItems = [...items, newItem];
    onItemsChange(updatedItems);
  };

  // Modifier un élément existant
  const handleEditItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };

    // Mettre à jour le champ
    (item as any)[field] = field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'vatRate'
      ? (value === '' ? 0 : parseFloat(value as string) || 0)
      : value;

    updatedItems[index] = item;
    onItemsChange(updatedItems);
  };

  // Supprimer un élément
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    // Réajuster les positions
    updatedItems.forEach((item, idx) => {
      item.position = idx;
    });
    onItemsChange(updatedItems);
  };

  // Déplacer un élément vers le haut
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
    
    // Réajuster les positions
    updatedItems.forEach((item, idx) => {
      item.position = idx;
    });
    
    onItemsChange(updatedItems);
  };

  // Déplacer un élément vers le bas
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    
    const updatedItems = [...items];
    [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];
    
    // Réajuster les positions
    updatedItems.forEach((item, idx) => {
      item.position = idx;
    });
    
    onItemsChange(updatedItems);
  };

  // Calculer les totaux globaux
  const calculateTotals = () => {
    let totalHt = 0;
    let totalVat = 0;
    let totalTtc = 0;

    items.forEach(item => {
      if (item.type !== QuoteItemType.CHAPTER && 
          item.type !== QuoteItemType.SECTION && 
          item.type !== QuoteItemType.FREE_TEXT && 
          item.type !== QuoteItemType.SEPARATOR) {
        
        const itemTotalHt = item.totalHt || 0;
        const vatRate = parseFloat(item.vatRate) / 100;
        const itemVat = itemTotalHt * vatRate;
        const itemTotalTtc = itemTotalHt + itemVat;

        totalHt += itemTotalHt;
        totalVat += itemVat;
        totalTtc += itemTotalTtc;
      }
    });

    return { totalHt, totalVat, totalTtc };
  };

  const totals = calculateTotals();

  // Obtenir le niveau d'indentation d'un élément
  const getItemLevel = (index: number): number => {
    const item = items[index];
    let level = 0;
    
    // Compter les chapitres et sections précédents
    for (let i = index - 1; i >= 0; i--) {
      const prevItem = items[i];
      if (prevItem.type === QuoteItemType.CHAPTER) {
        if (item.type !== QuoteItemType.CHAPTER) level = 1;
        break;
      } else if (prevItem.type === QuoteItemType.SECTION) {
        if (item.type !== QuoteItemType.CHAPTER && item.type !== QuoteItemType.SECTION) {
          level = 2;
        } else if (item.type === QuoteItemType.SECTION) {
          level = 1;
        }
      }
    }
    
    return level;
  };

  return (
    <div className="space-y-4">
      {/* En-tête du tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type / Actions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Désignation
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qté
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unité
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                P.U. HT
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remise
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                TVA (%)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total HT
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item, index) => (
                <QuoteItemRow
                  key={`${item.id || 'new'}-${index}`}
                  item={item}
                  index={index}
                  onEdit={handleEditItem}
                  onRemove={handleRemoveItem}
                  vatRates={vatRates}
                  isLoading={isLoading}
                  level={getItemLevel(index)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun élément dans ce devis. Ajoutez-en un ci-dessous.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ajouter un nouvel élément */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-3">Ajouter un élément</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <ItemTypeSelector
              selectedType={newItemType}
              onTypeChange={setNewItemType}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
            <div className="flex justify-between border-t pt-1">
              <span className="text-sm font-bold text-gray-700">Total TTC:</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(totals.totalTtc)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionManager;