/**
 * Ligne d'élément de devis améliorée pour BTP
 */
import React, { useState, useEffect } from 'react';
import { CreateQuoteItemData, QuoteItemType, BTPUnits, DiscountType } from '@/features/documents/types';
import { formatCurrency } from '@/lib/utils';
import { getQuoteItemTypeConfig, allowsPricing, allowsQuantity, getDefaultUnit, BTP_UNITS_LABELS } from '@/lib/constants/quoteItemTypes';
import ItemTypeSelector from './ItemTypeSelector';

interface QuoteItemRowProps {
  item: CreateQuoteItemData & { id?: string; totalHt?: number; totalTtc?: number };
  index: number;
  onEdit: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  vatRates: { code: string; name: string; rate: number; isDefault?: boolean }[];
  isLoading?: boolean;
  level?: number; // Niveau d'indentation pour la hiérarchie
}

export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  index,
  onEdit,
  onRemove,
  vatRates,
  isLoading = false,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getQuoteItemTypeConfig(item.type);

  // Calculer les totaux localement pour la réactivité
  const [localTotals, setLocalTotals] = useState({
    totalHt: item.totalHt || 0,
    totalTtc: item.totalTtc || 0
  });

  useEffect(() => {
    if (allowsPricing(item.type)) {
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discount || 0;
      const vatRate = parseFloat(item.vatRate) || 20;

      let totalHt = 0;
      
      if (item.discountType === DiscountType.PERCENTAGE) {
        const discountFactor = 1 - (discount / 100);
        totalHt = quantity * unitPrice * discountFactor;
      } else if (item.discountType === DiscountType.FIXED_AMOUNT) {
        totalHt = (quantity * unitPrice) - discount;
      } else {
        // Par défaut, remise en pourcentage
        const discountFactor = 1 - (discount / 100);
        totalHt = quantity * unitPrice * discountFactor;
      }

      const vatAmount = totalHt * (vatRate / 100);
      const totalTtc = totalHt + vatAmount;

      setLocalTotals({ totalHt, totalTtc });
    } else {
      setLocalTotals({ totalHt: 0, totalTtc: 0 });
    }
  }, [item.quantity, item.unitPrice, item.discount, item.discountType, item.vatRate, item.type]);

  const handleFieldChange = (field: string, value: string | number) => {
    onEdit(index, field, value);
  };

  const handleTypeChange = (newType: QuoteItemType) => {
    handleFieldChange('type', newType);
    
    // Auto-remplir l'unité par défaut
    const defaultUnit = getDefaultUnit(newType);
    if (defaultUnit) {
      handleFieldChange('unit', defaultUnit);
    }
    
    // Réinitialiser les champs selon le type
    if (!allowsPricing(newType)) {
      handleFieldChange('unitPrice', 0);
      handleFieldChange('discount', 0);
    }
    if (!allowsQuantity(newType)) {
      handleFieldChange('quantity', 1);
    }
  };

  // Style d'indentation basé sur le niveau hiérarchique
  const indentationStyle = {
    paddingLeft: `${level * 20 + 8}px`
  };

  // Rendu spécialisé selon le type
  const renderSpecializedContent = () => {
    switch (item.type) {
      case QuoteItemType.FREE_TEXT:
        return (
          <div className="col-span-full">
            <textarea
              value={item.freeText || ''}
              onChange={(e) => handleFieldChange('freeText', e.target.value)}
              placeholder="Saisissez votre texte libre..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        );

      case QuoteItemType.SEPARATOR:
        return (
          <div className="col-span-full">
            <input
              type="text"
              value={item.separatorTitle || ''}
              onChange={(e) => handleFieldChange('separatorTitle', e.target.value)}
              placeholder="Titre du séparateur (optionnel)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <div className="mt-2 border-t-2 border-gray-300"></div>
          </div>
        );

      case QuoteItemType.CHAPTER:
      case QuoteItemType.SECTION:
        return (
          <>
            {/* Titre */}
            <div className="col-span-3">
              <input
                type="text"
                value={item.designation || ''}
                onChange={(e) => handleFieldChange('designation', e.target.value)}
                placeholder={`Nom du ${config.label.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-semibold"
                disabled={isLoading}
              />
            </div>
            {/* Colonnes vides pour l'alignement */}
            <div className="col-span-4"></div>
          </>
        );

      default:
        return (
          <>
            {/* Désignation */}
            <div className="col-span-2">
              <input
                type="text"
                value={item.designation || ''}
                onChange={(e) => handleFieldChange('designation', e.target.value)}
                placeholder="Désignation"
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              {/* Description/détails */}
              <textarea
                value={item.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Description détaillée (optionnel)"
                rows={1}
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Quantité */}
            <div>
              {allowsQuantity(item.type) ? (
                <input
                  type="number"
                  value={item.quantity?.toString() || '1'}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                  disabled={isLoading}
                />
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>

            {/* Unité */}
            <div>
              {allowsQuantity(item.type) ? (
                <select
                  value={item.unit || ''}
                  onChange={(e) => handleFieldChange('unit', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                >
                  {Object.entries(BTP_UNITS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>

            {/* Prix unitaire */}
            <div>
              {allowsPricing(item.type) ? (
                <input
                  type="number"
                  value={item.unitPrice?.toString() || '0'}
                  onChange={(e) => handleFieldChange('unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                  disabled={isLoading}
                />
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>

            {/* Remise */}
            <div>
              {allowsPricing(item.type) ? (
                <div className="flex space-x-1">
                  <input
                    type="number"
                    value={item.discount?.toString() || '0'}
                    onChange={(e) => handleFieldChange('discount', e.target.value)}
                    min="0"
                    step="0.01"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                    disabled={isLoading}
                  />
                  <select
                    value={item.discountType || DiscountType.PERCENTAGE}
                    onChange={(e) => handleFieldChange('discountType', e.target.value)}
                    className="px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs"
                    disabled={isLoading}
                  >
                    <option value={DiscountType.PERCENTAGE}>%</option>
                    <option value={DiscountType.FIXED_AMOUNT}>€</option>
                  </select>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>

            {/* TVA */}
            <div>
              {allowsPricing(item.type) ? (
                <select
                  value={item.vatRate?.toString() || '20'}
                  onChange={(e) => handleFieldChange('vatRate', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                  disabled={isLoading}
                >
                  {vatRates.map(rate => (
                    <option key={rate.code} value={rate.rate}>
                      {rate.rate}%
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>

            {/* Total HT */}
            <div className="text-right">
              {allowsPricing(item.type) ? (
                <span className="font-medium">{formatCurrency(localTotals.totalHt)}</span>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <tr className={`${config.color} border-l-4`}>
      {/* Type et actions */}
      <td className="px-2 py-2" style={indentationStyle}>
        <div className="flex items-center space-x-2">
          <ItemTypeSelector
            selectedType={item.type}
            onTypeChange={handleTypeChange}
            disabled={isLoading}
            className="min-w-[150px]"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-900 p-1"
            disabled={isLoading}
            title="Supprimer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>

      {/* Contenu spécialisé */}
      {renderSpecializedContent()}
    </tr>
  );
};

export default QuoteItemRow;