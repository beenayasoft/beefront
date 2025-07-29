import { useState, useEffect, useMemo } from 'react';
import { CalculationService, ItemCalculationData, DocumentCalculationData, CalculationResult } from '@/lib/services/CalculationService';

/**
 * Hook pour les calculs en temps réel sur un élément
 */
export function useItemCalculations(item: ItemCalculationData) {
  const [calculations, setCalculations] = useState<CalculationResult>(() => 
    CalculationService.calculateItemTotals(item)
  );

  useEffect(() => {
    const newCalculations = CalculationService.calculateItemTotals(item);
    setCalculations(newCalculations);
  }, [item.quantity, item.unitPrice, item.discountPercentage, item.vatRate]);

  const validation = useMemo(() => 
    CalculationService.validateItemAmounts(item),
    [item]
  );

  return {
    calculations,
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings
  };
}

/**
 * Hook pour les calculs en temps réel sur un document complet
 */
export function useDocumentCalculations(document: DocumentCalculationData) {
  const [calculations, setCalculations] = useState<CalculationResult>(() => 
    CalculationService.calculateDocumentTotals(document)
  );

  const [vatBreakdown, setVatBreakdown] = useState(() => 
    CalculationService.calculateVATBreakdown(document)
  );

  useEffect(() => {
    const newCalculations = CalculationService.calculateDocumentTotals(document);
    const newVatBreakdown = CalculationService.calculateVATBreakdown(document);
    
    setCalculations(newCalculations);
    setVatBreakdown(newVatBreakdown);
  }, [document.items, document.globalDiscountPercentage, document.globalVatRate]);

  const validation = useMemo(() => 
    CalculationService.validateDocumentAmounts(document),
    [document]
  );

  const statistics = useMemo(() => ({
    itemCount: document.items.length,
    averageItemValue: document.items.length > 0 
      ? calculations.subtotalAfterDiscount / document.items.length 
      : 0,
    totalDiscount: calculations.discountAmount,
    effectiveVatRate: calculations.subtotalAfterDiscount > 0 
      ? (calculations.vatAmount / calculations.subtotalAfterDiscount) * 100 
      : 0,
    hasDiscounts: calculations.discountAmount > 0,
    hasMultipleVatRates: vatBreakdown.length > 1
  }), [calculations, vatBreakdown, document.items.length]);

  return {
    calculations,
    vatBreakdown,
    validation,
    statistics,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings
  };
}

/**
 * Hook pour calculer la marge bénéficiaire
 */
export function useMarginCalculations(costPrice: number, sellingPrice: number) {
  const margin = useMemo(() => 
    CalculationService.calculateMargin(sellingPrice, costPrice),
    [costPrice, sellingPrice]
  );

  const marginAmount = useMemo(() => 
    sellingPrice - costPrice,
    [costPrice, sellingPrice]
  );

  const isHealthyMargin = useMemo(() => 
    margin >= 20, // 20% de marge minimum
    [margin]
  );

  const calculateSellingPriceForMargin = (targetMargin: number) => 
    CalculationService.calculateSellingPrice(costPrice, targetMargin);

  return {
    margin,
    marginAmount,
    isHealthyMargin,
    calculateSellingPriceForMargin
  };
}

/**
 * Hook pour les conversions HT/TTC
 */
export function useTaxCalculations(amount: number, vatRate: number = 20) {
  const calculations = useMemo(() => ({
    ht: CalculationService.convertTTCtoHT(amount, vatRate),
    ttc: CalculationService.convertHTtoTTC(amount, vatRate),
    vatAmount: amount * (vatRate / 100)
  }), [amount, vatRate]);

  const convertToHT = (ttcAmount: number) => 
    CalculationService.convertTTCtoHT(ttcAmount, vatRate);

  const convertToTTC = (htAmount: number) => 
    CalculationService.convertHTtoTTC(htAmount, vatRate);

  return {
    ...calculations,
    convertToHT,
    convertToTTC,
    vatRates: CalculationService.getAvailableVATRates()
  };
}

/**
 * Hook pour les calculs de remise
 */
export function useDiscountCalculations(originalAmount: number, discountPercentage: number = 0) {
  const calculations = useMemo(() => {
    const discountAmount = originalAmount * (discountPercentage / 100);
    const finalAmount = originalAmount - discountAmount;
    
    return {
      originalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
      savings: discountAmount,
      savingsPercentage: discountPercentage
    };
  }, [originalAmount, discountPercentage]);

  const calculateDiscountPercentage = (targetAmount: number) => {
    if (originalAmount === 0) return 0;
    return ((originalAmount - targetAmount) / originalAmount) * 100;
  };

  const calculateDiscountAmount = (percentage: number) => {
    return originalAmount * (percentage / 100);
  };

  return {
    ...calculations,
    calculateDiscountPercentage,
    calculateDiscountAmount
  };
}

/**
 * Hook pour la calculatrice intégrée
 */
export function useCalculator() {
  const [history, setHistory] = useState<Array<{
    operation: string;
    result: number;
    timestamp: Date;
  }>>([]);

  const addToHistory = (operation: string, result: number) => {
    setHistory(prev => [
      { operation, result, timestamp: new Date() },
      ...prev.slice(0, 9) // Garder seulement les 10 dernières opérations
    ]);
  };

  const calculateItemTotal = (quantity: number, unitPrice: number, discount: number = 0, vat: number = 20) => {
    const result = CalculationService.calculateItemTotals({
      quantity,
      unitPrice,
      discountPercentage: discount,
      vatRate: vat
    });
    
    addToHistory(
      `${quantity} × ${unitPrice}€ (-${discount}% +${vat}% TVA)`,
      result.total
    );
    
    return result;
  };

  const calculateMargin = (cost: number, selling: number) => {
    const margin = CalculationService.calculateMargin(selling, cost);
    addToHistory(`Marge: ${selling}€ - ${cost}€`, margin);
    return margin;
  };

  const clearHistory = () => setHistory([]);

  return {
    history,
    calculateItemTotal,
    calculateMargin,
    clearHistory,
    service: CalculationService
  };
}