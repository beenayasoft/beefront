/**
 * Sélecteur de type d'élément de devis avec interface BTP
 */
import React, { useState } from 'react';
import { QuoteItemType } from '@/features/documents/types';
import { QUOTE_ITEM_CATEGORIES, getQuoteItemTypeConfig } from '@/lib/constants/quoteItemTypes';

interface ItemTypeSelectorProps {
  selectedType: QuoteItemType;
  onTypeChange: (type: QuoteItemType) => void;
  disabled?: boolean;
  className?: string;
}

export const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = getQuoteItemTypeConfig(selectedType);

  const handleTypeSelect = (type: QuoteItemType) => {
    onTypeChange(type);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
          ${selectedConfig.color}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{selectedConfig.icon}</span>
            <div>
              <div className="font-medium text-sm">{selectedConfig.label}</div>
              <div className="text-xs opacity-75">{selectedConfig.description}</div>
            </div>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Menu déroulant */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="py-1">
            {Object.entries(QUOTE_ITEM_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {category.label}
                </div>
                <div className="space-y-1">
                  {category.types.map((type) => {
                    const config = getQuoteItemTypeConfig(type);
                    const isSelected = type === selectedType;
                    
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeSelect(type)}
                        className={`
                          w-full px-2 py-2 text-left rounded text-sm transition-colors
                          ${isSelected 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{config.icon}</span>
                          <div>
                            <div className="font-medium">{config.label}</div>
                            <div className="text-xs opacity-75">{config.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ItemTypeSelector;